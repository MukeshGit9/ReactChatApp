// import React, { useEffect, useState, useRef, createContext } from "react";
// import socketIOClient from "socket.io-client";

// const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL; // Make sure this is set in .env

// export const SocketContext = createContext(null);

// const SocketProvider = ({ children }) => {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     // Initialize the socket connection
//     socketRef.current = socketIOClient(SOCKET_SERVER_URL);

//     return () => {
//       // Disconnect on cleanup
//       if (socketRef.current) {
//         console.log("Socket-Connection Done!!")
//       }
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;
