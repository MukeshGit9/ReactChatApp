import React, { useEffect, useState, useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import Header from '../../Components/Compound/Header';
import NavLink from '../../Components/Atom/NavLink';
import Profile from '../Profile';
import('dotenv').config;

// const SOCKET_SERVER_URL = 'http://192.168.0.3:11000' //backend url
const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL //backend url

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [token, setToken] = useState(null);
  const [typingUser, setTypingUser] = useState('');

  const navigate = useNavigate();

  const socketRef = useRef();


  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);

    //authenticate user via token
    const token = localStorage.getItem('auth_token');
    if (token) {
      socketRef.current.emit('authenticate', token)
      //handle response for authencate
      socketRef.current.on('auth_success', (message) => {
        const username = message.split(' ')[1];
        const useremail = message.split(' ')[2];
        setCurrentUser({ username });

        // fetch previous messages
        axios.get(`${SOCKET_SERVER_URL}/messages?userId=${useremail}`)
          .then(response => {
            if (response.data.status === 'success') {
              setMessages(response.data.data)
            }
          })
          .catch(error => console.log('Error fetching messages', error))
      })

    } else {
      navigate('/login')
    }

    //listen for incoming messages
    socketRef.current.on('receive_message', (formattedMessage) => {
      console.log("reveived message", formattedMessage.formattedMessage)
      const { status, data } = formattedMessage.formattedMessage;
      if (status === 'success' && data) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    //handle typing indicator
    socketRef.current.on('user_typing', (username) => {
      setTypingUser(username);
      setTimeout(() => { setTypingUser(''), 2000 })
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleTyping = () => {
    socketRef.current.emit('user_typing', currentUser);
  };

  //function to send messgage on send button click
  const sendMessage = () => {
    if (message.trim()) {
      const receivedId = 'receiver_mail@example.com'; //update receiver logic
      const formattedMessage = {
        content: message,
        receivedId: receivedId
      }

      socketRef.current.emit('send_message', formattedMessage)
      setMessage('');
    }
  };

  //function to send message on press enter key
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === 'Return') {
      event.preventDefault();
      sendMessage();
      // You can call any function here, like:
      // yourFunction(inputValue);
    }
  };

  return (
    <div className="flex flex-col items-center  h-screen bg-gray-200">
      <Header/>
      <div className='flex justify-between items-center w-full bg-white py-2 px-6'>
        <h2 className='text-xl text-blue-700'><Link to='/profile' path={<Profile/>}><i className="ri-user-6-fill"></i> {currentUser?.username}</Link></h2>
      </div>
      <div className='w-[80%] h-[80%] p-2 overflow-hidden'>
        {/* typing.. */}
        {/* <div className=' py-1 px-3 bg-gray-300 mb-2'>
          {currentUser && <p>{currentUser?.username} is typing...</p>}
        </div> */}

        {/* messages.. */}
        <div className='bg-white p-4 h-[85%] overflow-y-auto py-1'>
          {messages.map((msg, index) => {
            if (msg.senderName === currentUser?.username) {
              return <div key={msg.messageId} className=' p-1 mb-1 flex gap-2 overflow-hidden justify-end w-[70%] justify-self-end'>
                <span className=' text-[.5vw] '>{msg.timestamp}</span>
                <span className='text-[1.5vw] bg-blue-300 px-4 py-1 rounded-3xl flex items-center justify-center'>{msg.content}</span>
                {/* <div className='flex items-center justify-center outline outline-black rounded-full px-4 bg-black text-white'>{msg.senderName}</div> */}
              </div>
            } else {
              return <div key={msg.messageId} className=' p-1 mb-1 flex gap-2 overflow-hidden justify-start justify-self-start'>
                <div className='flex items-center justify-center outline outline-black rounded-full px-4 bg-black text-white'>{msg.senderName}</div>
                <span className='text-[1.5vw] bg-orange-300 px-4 py-1 rounded-3xl flex items-center justify-center'>{msg.content}</span>
                <span className=' text-[.5vw] '>{msg.timestamp}</span>
              </div>
            }
          })}
        </div>


      </div>

      {/* input massages.. */}
      <div className='flex justify-between absolute bottom-6 bg-white w-[80%]  px-8 rounded-4xl outline outline-black'>
        <input className='w-[90%] focus:outline-none  py-4 px-2' type="text" value={message}  onKeyDown={handleKeyDown}  onChange={(e) => setMessage(e.target.value)}  placeholder='Type a Message...' />
        <button className='w-[10%] cursor-pointer hover:font-bold'onClick={sendMessage}>Send <i className="ri-send-plane-fill"></i></button>
      </div>
    </div>
  )
}

export default ChatPage;