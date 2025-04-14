import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import UseFileUpload from "../../utilities/UseFileUpload";
import socketIOClient from "socket.io-client";
import axios from "axios";
import Header from "../../Components/Compound/Header";
import NavLink from "../../Components/Atom/NavLink";
import Profile from "../Profile";
import("dotenv").config;

// -------------------------------------------------------------------------------------SERVER URL
// const SOCKET_SERVER_URL = 'http://192.168.0.3:11000' //backend url
const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL; //backend url

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [token, setToken] = useState(null);
  const [typingUser, setTypingUser] = useState("");

  // Refs---------------------------------------------------------------------------------REFs
  const socketRef = useRef();
  const fileInputRef = useRef();

  //get from UseFileUpload------------------------------------------------------------------useFILEUpload
  const { selectedFile, preview, handleFileChange, handleUpload, setPreview } =
    UseFileUpload(socketRef, SOCKET_SERVER_URL);

  const navigate = useNavigate();

  //all chat messages--------------------------------------------------------------------ALL CHATS
  const allChatData = [...messages, ...files].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);

    //authenticate user via token---------------------------------------------------------AUTH via TOKEN
    const token = localStorage.getItem("auth_token");
    if (token) {
      socketRef.current.emit("authenticate", token);
      // handle response for authencate
      socketRef.current.on("auth_success", (message) => {
        const username = message.split(" ")[1];
        const useremail = message.split(" ")[2];
        setCurrentUser({ username });

        // fetch previous messages------------------------------------------------FETCH prev messages
        axios
          .get(`${SOCKET_SERVER_URL}/messages?userId=${useremail}`)
          .then((response) => {
            if (response.data.status === "success") {
              setMessages(response.data.data);
            }
          })
          .catch((error) => console.log("Error fetching messages", error));

        // fetch previous files-----------------------------------------------------FETCH prev files
        axios
          .get(`${SOCKET_SERVER_URL}/files?userId=${useremail}`)
          .then((response) => {
            if (response.data.status === "success") {
              setFiles(response.data.data);
            }
          })
          .catch((error) => console.log("error fetching files", error));
      });
    } else {
      navigate("/login");
    }

    //listen for incoming messages----------------------------------------------------INCOMING MESSAGES
    socketRef.current.on("receive_message", (formattedMessage) => {
      const { status, data } = formattedMessage.formattedMessage;
      if (status === "success" && data) {
        setMessages((prevMessages) => [...prevMessages, data]);
        socketRef.current.emit("mark_as_delivered", data.messageId);
      } else {
        alert("message not found");
      }
    });

    //listen for incoming files----------------------------------------------------------INCOMING FILES
    socketRef.current.on("receive_file", (fileMessage) => {
      const { data, status } = fileMessage.fileMessage;
      if (status === "success" && data) {
        setFiles((prevFile) => [...prevFile, data]);
        socketRef.current.emit("mark_as_delivered", data.messageId);
      } else {
        alert("Files not found");
      }
    });

    // listen message status-------------------------------------------------------------LISTEN MESSAGE STATUS
    socketRef.current.on("message_status_update", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.messageId === messageId ? { ...m, status } : m))
      );
    });

    //handle typing indicator-------------------------------------------------------------TYPING INDICATOR
    socketRef.current.on("user_typing", (username) => {
      setTypingUser(username);
      setTimeout(() => {
        setTypingUser(""), 2000;
      });
    });

    // listen delete update---------------------------------------------------DELETE UPDATE
    socketRef.current.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
      setFiles((prev) => prev.filter((fl) => fl.messageId !== messageId));
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("message_deleted");
    };
  }, []);

  const handleTyping = () => {
    socketRef.current.emit("user_typing", currentUser);
  };

  //function to send messgage on send button click-----------------------------------------SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();
    const receivedId = "receiver_mail@example.com"; //update receiver logic

    if (message.trim()) {
      const formattedMessage = {
        content: message,
        receivedId: receivedId,
      };

      socketRef.current.emit("send_message", formattedMessage);
      setMessage("");
    }
    if (selectedFile) {
      await handleUpload(receivedId);
      //clear After sending files
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // remove preview items----------------------------------------------------------------------------HANDLE PREVIEW
  const handleRemoveFile = (indexToRemove) => {
    const updated = preview.filter((_, index) => index !== indexToRemove);
    setPreview(updated);
    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = [];
    }
  };

  // handle delete request-----------------------------------------------------------------------------------DELETE MESSAGES
  const handleDeleteMessage = (messageId, senderId) => {
    socketRef.current.emit("delete_message", {
      messageId,
      senderId: senderId,
    });
  };

  // message status request--------------------------------------------------------------------MESSAGE STATUS READ, SENT, DELEVIRED

  return (
    <div className="flex flex-col items-center  h-screen bg-gray-200">
      <Header />
      <div className="flex justify-between items-center w-full bg-white py-2 px-6">
        <h2 className="text-xl text-blue-700">
          <Link to="/profile" path={<Profile />}>
            <i className="ri-user-6-fill"></i> {currentUser?.username}
          </Link>
        </h2>
      </div>
      <div className="w-[80%] h-[79%] p-2 overflow-hidden ">
        {/* typing.. */}
        {/* <div className=' py-1 px-3 bg-gray-300 mb-2'>
          {currentUser && <p>{currentUser?.username} is typing...</p>}
        </div> */}

        {/* messages.. */}
        {/* messages..-------------------------------------------------------------------------------------- */}
        <div className="bg-white p-4 h-[85%] overflow-y-auto py-1">
          {allChatData.map((msg, index) => {
            const isCurrentUser = msg.senderName === currentUser?.username;

            const renderFile = () => {
              if (msg.mimeType?.startsWith("image/")) {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    className="inline-block relative"
                  >
                    <img
                      src={msg.fileUrl}
                      alt={msg.originalName}
                      className="max-w-[15vw] max-h-[15vw] rounded shadow  "
                    />
                    {isCurrentUser && (
                      <span className="absolute bottom-[-0.7vw] text-[.5vw] bg-black text-white  right-0 px-1 rounded-sm">
                        {msg.status === "sent" && "0"}
                        {msg.status === "delivered" && "0 0"}
                        {msg.status === "read" && "0 0 0"}
                      </span>
                    )}
                    {isCurrentUser ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // stop anchor from triggering
                          e.stopPropagation(); // stop bubbling up
                          handleDeleteMessage(msg.messageId, msg.senderId);
                        }}
                        className="text-red-500 text-xs ml-2 absolute top-[-.8vw] right-[0vw] z-0 bg-red-500 rounded-sm flex items-center justify-center p-[.2vw] cursor-pointer"
                      >
                        <i className="ri-delete-bin-6-line text-[.6vw] text-white"></i>
                      </button>
                    ) : (
                      ""
                    )}
                  </a>
                );
              } else if (msg.mimeType === "application/pdf") {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline relative inline-block"
                  >
                    📄 View PDF
                    {isCurrentUser && (
                      <span className="absolute bottom-[-0.7vw] text-[.5vw] bg-black text-white  right-0 px-1 rounded-sm">
                        {msg.status === "sent" && "0"}
                        {msg.status === "delivered" && "0 0"}
                        {msg.status === "read" && "0 0 0"}
                      </span>
                    )}
                    {isCurrentUser ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // stop anchor from triggering
                          e.stopPropagation(); // stop bubbling up
                          handleDeleteMessage(msg.messageId, msg.senderId);
                        }}
                        className="text-red-500 text-xs ml-2 absolute top-[-.8vw] right-[0vw] z-0 bg-red-500 rounded-sm flex items-center justify-center p-[.2vw] cursor-pointer"
                      >
                        <i className="ri-delete-bin-6-line text-[.6vw] text-white"></i>
                      </button>
                    ) : (
                      ""
                    )}
                  </a>
                );
              } else {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 underline inline-block relative"
                  >
                    <i class="ri-video-fill"></i> {msg.originalName}
                    {isCurrentUser && (
                      <span className="absolute bottom-[-0.7vw] text-[.5vw] bg-black text-white  right-0 px-1 rounded-sm">
                        {msg.status === "sent" && "0"}
                        {msg.status === "delivered" && "0 0"}
                        {msg.status === "read" && "0 0 0"}
                      </span>
                    )}
                    {isCurrentUser ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // stop anchor from triggering
                          e.stopPropagation(); // stop bubbling up
                          handleDeleteMessage(msg.messageId, msg.senderId);
                        }}
                        className="text-red-500 text-xs ml-2 absolute top-[-.8vw] right-[0vw] z-0 bg-red-500 rounded-sm flex items-center justify-center p-[.2vw] cursor-pointer"
                      >
                        <i className="ri-delete-bin-6-line text-[.6vw] text-white"></i>
                      </button>
                    ) : (
                      ""
                    )}
                  </a>
                );
              }
            };

            return (
              <div
                key={msg.messageId}
                className={`p-1 mb-6 flex gap-2  ${
                  isCurrentUser ? "justify-end w-[100%]" : "justify-start"
                } justify-self-${isCurrentUser ? "end" : "start"}`}
              >
                {isCurrentUser ? (
                  <>
                    <span className="text-[.5vw]">{msg.timestamp}</span>
                    {msg.messageType === "file" ? (
                      renderFile(msg, isCurrentUser)
                    ) : (
                      <span className="text-[1.5vw] max-w-[60%] bg-blue-300 px-4 py-1 rounded-sm flex items-center justify-center relative">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {msg.content}
                        </ReactMarkdown>
                        {isCurrentUser && (
                          <span className="absolute bottom-[-0.7vw] text-[.5vw] bg-black text-white  right-0 px-1 rounded-sm">
                            {msg.status === "sent" && "0"}
                            {msg.status === "delivered" && "0 0"}
                            {msg.status === "read" && "0 0 0"}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteMessage(msg.messageId, msg.senderId)
                          }
                          className="text-red-500 text-xs ml-2 absolute top-[-.8vw] right-[0vw] z-0 bg-red-500 rounded-sm flex items-center justify-center p-[.2vw] cursor-pointer"
                        >
                          <i className="ri-delete-bin-6-line text-[.6vw] text-white"></i>
                        </button>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center outline outline-black rounded-full px-4 bg-black text-white">
                      {msg.senderName}
                    </div>
                    {msg.messageType === "file" ? (
                      renderFile()
                    ) : (
                      <span className="text-[1.5vw] max-w-[60%] bg-orange-300 px-4 py-1 rounded-sm flex items-center justify-center">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {msg.content}
                        </ReactMarkdown>
                      </span>
                    )}
                    <span className="text-[.5vw]">{msg.timestamp}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* input massages.. */}
      <div className="flex justify-between absolute bottom-6 bg-white w-[80%]  px-4 rounded-sm outline outline-black">
        <form className="w-full flex items-center" onSubmit={sendMessage}>
          <input
            className="w-[80%] focus:outline-none  py-4 px-2 text-wrap"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a Message..."
          />

          {/* previews--------------------------------------------- */}
          <div className="flex flex-wrap gap-4 my-4">
            {preview.map((file, index) => (
              <div key={index} className="mx-2 my-2 relative w-[8vw] h-[6vw] ">
                {file.type === "image" && (
                  <img
                    src={file.src}
                    alt={file.name}
                    className="w-[100%] h-[100%] rounded-lg"
                  />
                )}
                {file.type === "video" && (
                  <video
                    src={file.src}
                    controls
                    className="w-[100%] h-[100%] rounded-lg"
                  />
                )}
                {file.type === "pdf" && (
                  <p className="w-[100%] h-[100%] text-[1vw] bg-rose-400 p-2 rounded-lg">
                    {file.name} (PDF)
                    <i class="ri-file-pdf-2-line"></i>
                  </p>
                )}
                {file.type === "other" && (
                  <p className="w-[100%] h-[100%] rounded-lg">
                    {file.name} (Other)
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute flex items-center justify-center top-[-18%] right-[-15%] p-2 rounded-full w-[1.2vw] h-[1.2vw] text-[.5vw] bg-black text-white cursor-pointer"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <div className="w-[5%] focus:outline-none text-sm  py-4 px-2 flex items-center justify-center ">
            <input
              className="hidden"
              id="inputFile"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
            <label
              className="text-[2vw] cursor-pointer hover:text-green-600 hover:font-bold "
              htmlFor="inputFile"
            >
              <i class="ri-file-upload-line"></i>
            </label>
          </div>

          <button
            type="submit"
            className="w-[15%] cursor-pointer hover:font-bold bg-black text-white py-2 rounded-lg"
            onClick={sendMessage}
          >
            Send <i className="ri-send-plane-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
