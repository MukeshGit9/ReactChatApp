import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AllUsersContext } from "../../Context/AllUsersProvider";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import ReactSimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css"; // Required CSS
import UseFileUpload from "../../utilities/UseFileUpload";
import socketIOClient from "socket.io-client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Header from "../../Components/Compound/Header";
import NavLink from "../../Components/Atom/NavLink";
import Profile from "../Profile";
import CallComponent from "../../Components/Compound/CallComponent";
import Home from "../Home";
import("dotenv").config;

// -------------------------------------------------------------------------------------SERVER URL
// const SOCKET_SERVER_URL = 'http://192.168.0.3:11000' //backend url
const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL; //backend url

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // check user via url id
  // const queryParams = new URLSearchParams(location.search);
  // const userUrlId = queryParams.get('id')

  // clicked user details--------------------------------------------------------------SELECTED USER DETAILS
  const { selectedUser } = location.state || {};
  
  if (!selectedUser || !selectedUser?.email ) {
    navigate("/");
  }

  // al users-------------------------------------------------------------------------ALL USERS
  const { allUsers } = useContext(AllUsersContext);
  // const user = allUsers[2] || {};

  // -----------------------------------------------------------------------------------STATES
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [token, setToken] = useState(null);
  const [typingUser, setTypingUser] = useState("");

  // useEffect(() => {
  //   // clicked user details--------------------------------------------------------------SELECTED USER DETAILS
  //   if (!userUrlId) {
  //     navigate("/");
  //     return;
  //   }
  //   setSelectedUser({email:userUrlId})
  // });

  // useMemo-----------------------------------------------------------------------------USE MEMO
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Type your message...",
      // toolbar: ["bold", "italic", "heading", "|", "quote", "code", "link"],
      // You can customize more here
    };
  }, []);

  // Refs---------------------------------------------------------------------------------REFs
  const socketRef = useRef();
  const fileInputRef = useRef();

  //get from UseFileUpload------------------------------------------------------------------useFILEUpload
  const {
    selectedFile,
    setSelectedFile,
    preview,
    handleFileChange,
    handleUpload,
    setPreview,
  } = UseFileUpload(socketRef, SOCKET_SERVER_URL);

  //all chat messages--------------------------------------------------------------------ALL CHATS
  const allChatData = [...messages, ...files].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const sortedMessages = allChatData.slice().reverse();

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);

    //authenticate user via token---------------------------------------------------------AUTH via TOKEN
    const token = localStorage.getItem("auth_token");
    if (token) {
      socketRef.current.emit("authenticate", token);
      // handle response for authencate
      socketRef.current.on("auth_success", (user, email) => {
        setCurrentUser(user);
        setCurrentUserEmail(email);

        // fetch previous messages------------------------------------------------FETCH prev messages
        axios
          .get(
            `${SOCKET_SERVER_URL}/messages?userId=${email}&receiveId=${selectedUser.email}`
          )
          .then((response) => {
            if (response.data.status === "success") {
              setMessages(response.data.data);
            }
          })
          .catch((error) => console.log("Error fetching messages", error));

        // fetch previous files-----------------------------------------------------FETCH prev files
        axios
          .get(
            `${SOCKET_SERVER_URL}/files?userId=${email}&receiveId=${selectedUser.email}`
          )
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
        if (
          data.senderId === selectedUser.email ||
          data.receiverId === selectedUser.email
        ) {
          setMessages((prevMessages) => [...prevMessages, data]);
        } else {
          console.log("Message is for another user, not for this room");
        }
        socketRef.current.emit("mark_as_delivered", data.messageId);
      } else {
        console.log("message not found");
      }
    });

    //listen for incoming files----------------------------------------------------------INCOMING FILES
    socketRef.current.on("receive_file", (fileMessage) => {
      const { data, status } = fileMessage.fileMessage;
      if (status === "success" && data) {
        if (
          data.senderId === selectedUser.email ||
          data.receiverId === selectedUser.email
        ) {
          setFiles((prevFile) => [...prevFile, data]);
        } else {
          console.log("File is for another user, not for this room");
        }
        socketRef.current.emit("mark_as_delivered", data.messageId);
      } else {
        console.log("Files not found");
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
  }, [currentUser]);

  const handleTyping = () => {
    socketRef.current.emit("user_typing", currentUser);
  };

  //function to send messgage on send button click-----------------------------------------SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();
    // const receivedId = "receiver_mail@example.com"; //update receiver logic
    const receivedId = selectedUser.email; //update receiver logic

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
  const handleRemoveFile = (fileToRemove) => {
    // Remove the file from preview
    const updatedPreview = preview.filter(
      (file) => file.src !== fileToRemove.src
    );
    setPreview(updatedPreview);

    // Remove the corresponding file from selectedFile
    const updatedFiles = selectedFile.filter(
      (file) => file.name !== fileToRemove.name
    );
    setSelectedFile(updatedFiles);

    // Reset the file input value if no files are left
    if (updatedPreview.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = null; // or []
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
    <div className="flex flex-col items-center  h-screen bg-gray-300">
      <Header />
      <div className="flex justify-end items-center w-full bg-white py-2 px-6">
        <h2 className="text-xl text-blue-700 font-bold">
          <Link to="/profile" path={<Profile />}>
            <i className="ri-user-6-fill"></i> {currentUser}
          </Link>
        </h2>
      </div>
      <div className="self-start m-2 bg-black text-[1.6vw] font-bold text-white px-4 py-1 rounded-sm">
        <span className="text-[.8vw]">Chatting with </span>
        {selectedUser?.username}
      </div>
      <div className="flex flex-row items-start justify-center w-full h-[41vw]  pl-2 pr-2 pb-2 gap-2">
        {/* typing..  */}
        {/* {/* <div className=' py-1 px-3 bg-gray-300 mb-2'>
          {currentUser && <p>{currentUser} is typing...</p>}
         </div> */}

        {/* messages.. */}
        {/* messages..-------------------------------------------------------------------------------------- */}
        <div className="bg-white p-4 w-[60%]  h-full   p-2 overflow-y-auto">
          {sortedMessages.map((msg, index) => {
            const isCurrentUser = msg.senderName === currentUser;

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
              } else if (msg.mimeType?.startsWith("video/")) {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    className="inline-block relative"
                  >
                    <video
                      src={msg.fileUrl}
                      controls
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

        {/* input massages.. */}
        <div className="flex flex-col justify-between  bottom-6 bg-gray-100 w-[40%] h-full  overflow-y-auto  rounded-sm   ">
          <div>
            <CallComponent
              currentUser={currentUser}
              users={allUsers} // should include peerId info
            />
          </div>

          <form
            className="w-full flex flex-col items-center justify-between p-4"
            onSubmit={sendMessage}
          >
            {/* <div className="w-full focus:outline-none  py-4 px-2 text-wrap">
              <ReactSimpleMDE
                value={message}
                onChange={setMessage}
                options={options}
              />
            </div> */}

            <textarea
              className="w-[100%] h-[50%] focus:outline-none  py-4 px-2 text-wrap bg-white"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a Message..."
            />

            {/* previews--------------------------------------------------------------------- */}
            <div className="flex flex-wrap gap-4 my-4">
              {preview.map((file, index) => (
                <div
                  key={index}
                  className="mx-2 my-2 relative w-[8vw] h-[6vw] "
                >
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
                    onClick={() => handleRemoveFile(file)}
                    className="absolute flex items-center justify-center top-[-18%] right-[-15%] p-2 rounded-full w-[1.2vw] h-[1.2vw] text-[.5vw] bg-black text-white cursor-pointer"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="w-[20%] focus:outline-none text-sm  py-4 px-2 flex items-center justify-center ">
              <input
                className="hidden"
                id="inputFile"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
              />
              <label
                className="text-[3vw] cursor-pointer hover:text-green-600 hover:font-bold "
                htmlFor="inputFile"
              >
                <i class="ri-file-upload-line"></i>
              </label>
            </div>

            <button
              type="submit"
              className="w-[100%] cursor-pointer hover:font-bold bg-black text-white py-2 rounded-lg group relative "
              onClick={sendMessage}
            >
              Send{" "}
              <i className="ri-send-plane-fill group-hover:right-20 transition-all duration-700 absolute  "></i>
            </button>
            {/* <button onClick={sendMessage}>Send</button> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
