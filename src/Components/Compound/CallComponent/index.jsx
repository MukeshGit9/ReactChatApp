import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import io from "socket.io-client";

import("dotenv").config;
const socket = io(import.meta.env.VITE_SERVER_URL); // replace with your backend URL

const CallComponent = ({ currentUser, users }) => {
  const [peerId, setPeerId] = useState("");
  const [callIncoming, setCallIncoming] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [peer, setPeer] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();
  const currentCall = useRef();

  useEffect(() => {
    const p = new Peer();
    setPeer(p);


    p.on("open", (id) => {
      setPeerId(id);
      socket.emit("join", currentUser._id);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (myVideo.current) myVideo.current.srcObject = stream;

      p.on("call", (call) => {
        setCallIncoming(call);
      });
    });

    socket.on("incoming_call", ({ from, signal, name }) => {
      setCallIncoming({ from, signal, name });
    });

    socket.on("call_accepted", ({ signal }) => {
      currentCall.current?.peerConnection?.signal(signal);
    });

    socket.on("call_ended", () => {
      endCall();
    });
  }, []);

  const callUser = async (targetUser) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(targetUser.peerId, stream);
    currentCall.current = call;

    call.on("stream", (remoteStream) => {
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    call.on("close", () => {
      endCall();
    });

    socket.emit("call_user", {
      to: targetUser._id,
      from: currentUser._id,
      name: currentUser.username,
      signal: peerId,
    });

    setCallAccepted(true);
  };

  const answerCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(callIncoming.signal, stream);

    currentCall.current = call;

    call.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    call.on("close", () => {
      endCall();
    });

    socket.emit("answer_call", {
      to: callIncoming.from,
      signal: peerId,
    });

    setCallAccepted(true);
    setCallIncoming(null);
  };

  const endCall = () => {
    currentCall.current?.close();
    setCallIncoming(null);
    setCallAccepted(false);
    socket.emit("end_call", { to: callIncoming?.from });
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2">Video Chat</h2>
      <div className="flex gap-4">
        <video ref={myVideo} autoPlay playsInline muted className="w-48 h-32 border" />
        <video ref={userVideo} autoPlay playsInline className="w-48 h-32 border" />
      </div>

      <div className="mt-4">
        {users.map((user) =>
          user._id !== currentUser._id ? (
            <button
              key={user._id}
              className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
              onClick={() => callUser(user)}
            >
              Call {user.username}
            </button>
          ) : null
        )}
      </div>

      {callIncoming && !callAccepted && (
        <div className="mt-4 bg-yellow-200 p-3 rounded">
          <p>📞 Incoming call from {callIncoming.name}</p>
          <button onClick={answerCall} className="bg-green-500 text-white px-4 py-1 mr-2 rounded">
            Accept
          </button>
          <button onClick={endCall} className="bg-red-500 text-white px-4 py-1 rounded">
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default CallComponent;
