import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import UseFileUpload from "../../utilities/UseFileUpload";
import socketIOClient from "socket.io-client";
import axios from "axios";
import Header from "../../Components/Compound/Header";
import NavLink from "../../Components/Atom/NavLink";
import Profile from "../Profile";
import("dotenv").config;

// const SOCKET_SERVER_URL = 'http://192.168.0.3:11000' //backend url
const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL; //backend url

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [token, setToken] = useState(null);
  const [typingUser, setTypingUser] = useState("");

  const socketRef = useRef();
  const fileInputRef = useRef();

  //get from UseFileUpload
  const { selectedFile, preview, handleFileChange, handleUpload, setPreview } =
    UseFileUpload(socketRef, SOCKET_SERVER_URL);

  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);

    //authenticate user via token
    const token = localStorage.getItem("auth_token");
    if (token) {
      socketRef.current.emit("authenticate", token);
      // handle response for authencate
      socketRef.current.on("auth_success", (message) => {
        const username = message.split(" ")[1];
        const useremail = message.split(" ")[2];
        setCurrentUser({ username });

        // fetch previous messages
        axios
          .get(`${SOCKET_SERVER_URL}/messages?userId=${useremail}`)
          .then((response) => {
            if (response.data.status === "success") {
              setMessages(response.data.data);
            }
          })
          .catch((error) => console.log("Error fetching messages", error));

        // fetch previous files
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

    //listen for incoming messages
    socketRef.current.on("receive_message", (formattedMessage) => {
      const { status, data } = formattedMessage.formattedMessage;
      if (status === "success" && data) {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        alert("message not found");
      }
    });

    //listen for incoming files
    socketRef.current.on("receive_file", (fileMessage) => {
      const { data, status } = fileMessage.fileMessage;
      if (status === "success" && data) {
        setFiles((prevFile) => [...prevFile, data]);
      } else {
        alert("Files not found");
      }
    });

    //handle typing indicator
    socketRef.current.on("user_typing", (username) => {
      setTypingUser(username);
      setTimeout(() => {
        setTypingUser(""), 2000;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleTyping = () => {
    socketRef.current.emit("user_typing", currentUser);
  };

  //function to send messgage on send button click
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

  // remove preview items----------------------------------
  const handleRemoveFile = (indexToRemove) => {
    const updated = preview.filter((_, index) => index !== indexToRemove);
    setPreview(updated);
    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = [];
    }
  };

  //all chat messages
  const allChatData = [...messages, ...files].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

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
      <div className="w-[80%] h-[80%] p-2 overflow-hidden">
        {/* typing.. */}
        {/* <div className=' py-1 px-3 bg-gray-300 mb-2'>
          {currentUser && <p>{currentUser?.username} is typing...</p>}
        </div> */}

        {/* messages.. */}
        {/* messages.. */}
        <div className="bg-white p-4 h-[85%] overflow-y-auto py-1">
          {allChatData.map((msg, index) => {
            const isCurrentUser = msg.senderName === currentUser?.username;

            const renderFile = () => {
              if (msg.mimeType?.startsWith("image/")) {
                return (
                  <img
                    src={msg.fileUrl}
                    alt={msg.originalName}
                    className="max-w-[15vw] max-h-[15vw] rounded shadow"
                  />
                );
              } else if (msg.mimeType === "application/pdf") {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    📄 View PDF
                  </a>
                );
              } else {
                return (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 underline"
                  >
                    📁 {msg.originalName}
                  </a>
                );
              }
            };

            return (
              <div
                key={msg.messageId}
                className={`p-1 mb-1 flex gap-2 overflow-hidden ${
                  isCurrentUser ? "justify-end w-[100%]" : "justify-start"
                } justify-self-${isCurrentUser ? "end" : "start"}`}
              >
                {isCurrentUser ? (
                  <>
                    <span className="text-[.5vw]">{msg.timestamp}</span>
                    {msg.messageType === "file" ? (
                      renderFile()
                    ) : (
                      <span className="text-[1.5vw] max-w-[60%] bg-blue-300 px-4 py-1 rounded-sm flex items-center justify-center">
                        {msg.content}
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
                        {msg.content}
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
      <div className="flex justify-between absolute bottom-6 bg-white w-[80%]  px-8 rounded-4xl outline outline-black">
        <form action="" className="w-full flex" onSubmit={sendMessage}>
          <input
            className="w-[70%] focus:outline-none  py-4 px-2 text-wrap"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a Message..."
          />

          {/* previews--------------------------------------------- */}
          <div className="flex flex-wrap gap-4 my-4">
            {/* {preview.map((file, index) => {
              if (file.type === "image") {
                return (
                  <div className="relative">
                    <img
                      key={index}
                      src={file.src}
                      alt={file.name}
                      className="w-[6vw] h-[4vw] rounded shadow"
                    />
                    <button type="button" className="absolute text-[.8vw] h-[1.2vw] w-[1.2vw] flex items-center justify-center p-2  right-[0.2vw] top-[0.2vw] rounded-full bg-black text-white cursor-pointer">
                      X
                    </button>
                  </div>
                );
              } else if (file.type === "pdf") {
                return (
                  <div
                    key={index}
                    className="w-[6vw] h-[4vw] flex flex-col items-center justify-center border rounded p-2 bg-red-300 relative"
                  >
                    <span role="img" aria-label="pdf" className="text-[1.2vw]">
                      📄
                    </span>
                    <p className="text-center mt-2 text-[.6vw]">{file.name}</p>
                    <button type="button" className="absolute text-[.8vw] h-[1.2vw] w-[1.2vw] flex items-center justify-center p-2  right-[0.2vw] top-[0.2vw] rounded-full bg-black text-white cursor-pointer">
                      X
                    </button>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="w-[6vw] h-[4vw] flex flex-col items-center justify-center border rounded p-2 bg-blue-300 relative"
                  >
                    <span role="img" aria-label="file" className="text-[1.2vw]">
                      📁
                    </span>
                    <p className="text-center mt-2 text-[.3vw] text-wrap">
                      {file.name}
                    </p>
                    <button type="button" className="absolute text-[.8vw] h-[1.2vw] w-[1.2vw] flex items-center justify-center p-2  right-[0.2vw] top-[0.2vw] rounded-full bg-black text-white cursor-pointer">
                      X
                    </button>
                  </div>
                );
              }
            })} */}

            {preview.map((file, index) => (
              <div key={index} className="mx-2 my-2 relative w-[8vw] h-[6vw]">
                {file.type === "image" && (
                  <img
                    src={file.src}
                    alt={file.name}
                    className="w-[100%] h-[100%] "
                  />
                )}
                {file.type === "video" && (
                  <video
                    src={file.src}
                    controls
                    className="w-[100%] h-[100%] "
                  />
                )}
                {file.type === "pdf" && (
                  <p className="w-[100%] h-[100%] text-[1vw] ">
                    {file.name} (PDF)
                  </p>
                )}
                {file.type === "other" && (
                  <p className="w-[100%] h-[100%] ">{file.name} (Other)</p>
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

          <input
            className="w-[20%] focus:outline-none text-sm  py-4 px-2"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
          />
          <button
            type="submit"
            className="w-[10%] cursor-pointer hover:font-bold"
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
