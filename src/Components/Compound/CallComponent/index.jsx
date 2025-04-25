import React, { useRef, useState, useEffect } from "react";

const CallComponent = ({ socketRef, selectedUser, currentUserEmail }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // 🟢 Step 1: Start Call
  const startCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = localStream;
    localVideoRef.current.srcObject = localStream;

    peerRef.current = new RTCPeerConnection(iceServers);

    // 🔗 Send our ICE candidates to the other user
    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.emit("ice_candidate", {
          to: selectedUser,
          candidate: e.candidate,
        });
      }
    };

    // 🖥️ Show the remote stream
    peerRef.current.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    // 🔌 Add all local tracks
    localStream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStream);
    });

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socketRef.emit("call_user", {
      to: selectedUser,
      from: currentUserEmail,
      offer,
    });

    setInCall(true);
  };

  // 🔴 End Call
  const endCall = () => {
    socketRef.emit("end_call", { to: selectedUser });
    cleanup();
  };

  // 🧹 Cleanup tracks and peer
  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setInCall(false);
  };

  useEffect(() => {
    if (!socketRef) return;

    // 📞 Incoming Call Handler
    socketRef.on("incoming_call", async ({ from, offer }) => {
      console.log("call from  ", from);
      const accept = window.confirm(`Incoming call from ${from}. Accept?`);
      if (!accept) {
        socketRef.emit("decline_call", { to: from });
        return;
      }

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = localStream;
      localVideoRef.current.srcObject = localStream;

      peerRef.current = new RTCPeerConnection(iceServers);

      peerRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.emit("ice_candidate", {
            to: from,
            candidate: e.candidate,
          });
        }
      };

      peerRef.current.ontrack = (e) => {
        remoteVideoRef.current.srcObject = e.streams[0];
      };

      localStream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, localStream);
      });

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socketRef.emit("answer_call", {
        to: from,
        answer,
      });

      setInCall(true);
    });

    // ✅ Call answered by callee
    socketRef.on("call_answered", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // 📡 ICE Candidate received
    socketRef.on("ice_candidate", async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // 📞 Call ended
    socketRef.on("end_call", () => {
      alert("Call ended by the other user");
      cleanup();
    });

    return () => {
      socketRef.off("incoming_call");
      socketRef.off("call_answered");
      socketRef.off("ice_candidate");
      socketRef.off("end_call");
    };
  }, [socketRef, peerRef.current]);

  return (
    <div className="flex w-[35%] gap-2 items-start justify-between px-2 bg-transparent  absolute top-[8%]  right-[32%]  z-[2]">
      <div className="flex flex-col gap-2 items-center justify-between w-[100%] py-2 ">
        <div className="w-[100%] relative ">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-[100%] "
        />
        </div>
        <div className="w-[100%] relative ">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-[100%]" />
        </div>
        
        
      </div>
      <div className="py-2 w-[10%] relative">
        {!inCall ? (
          <button
            onClick={startCall}
            className="bg-green-500 rounded-sm text-white  px-3 py-1 cursor-pointer absolute right-[-1050%] top-[-240%]"
          >
            <i class="ri-video-on-fill"></i>
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-400 rounded-sm text-white px-3 py-1 cursor-pointer absolute right-[-1050%] top-[-240%]"
          >
            <i class="ri-video-off-fill"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default CallComponent;
