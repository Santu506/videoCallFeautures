import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
 
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // console.log("remote stream", remoteStream);
  // console.log("my stream", myStream);
  
  

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            // muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );

};

export default RoomPage;


   
//   const [myStream, setMyStream] = useState();
//   const [remoteStream, setRemoteStream] = useState();
//   const [remoteSocketID, setRemoteSocketID] = useState(null);
//   const socket = useSocket();

// const handleNewUserJoined = useCallback(async(data)=>{
//       const {emailId,id} = data;
//       setRemoteSocketID(id);
      
//   },[]);


// const handleCallUser = useCallback(async () => {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: true,
//   });
//   const offer = await peer.getOffer();

//   socket.emit("user:call", { to: remoteSocketID, offer });
//   setMyStream(stream);
// },[socket,remoteSocketID])
    
// const handleIncommingCall = useCallback(async({from,offer})=>{
//   setRemoteSocketID(from);
//   const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
//   setMyStream(stream);
//   console.log('incomming call',offer);
//   const ans = await peer.getAnswer(offer);
//   socket.emit('call:accepted',{to:from,ans});
// },[socket]);

// const sendStreams = useCallback(() => {
//   for (const track of myStream.getTracks()) {
//     peer.peer.addTrack(track, myStream);
//   }
// }, [myStream]);

// const handleCallAccepted = useCallback(async({from,ans})=>{
//   console.log('call accepted',from,"dsdcds:",ans);
  
//   await peer.setLocalDescription(ans);
//   console.log('call accepted',from,ans);
//   sendStreams();
// },[sendStreams]);

// const handleNegotiationNeeded = useCallback(async()=>{
//   const offer = await peer.getOffer();
//   socket.emit('peer:nego:needed',{to:remoteSocketID,offer});
// },[remoteSocketID,socket]);


// // const handleTrackAdded = useCallback(async(ev)=>{
// //   const remoteStream = ev.streams;
// //   console.log('remote stream',remoteStream);
  
// //   setRemoteStream(remoteStream[0]);
// // },[]);

// const handleIncommingNegotiation = useCallback(async({from,offer})=>{
//   const ans = await peer.getAnswer(offer);
//   socket.emit('peer:nego:done',{to:from,ans});
// },[socket]);

// const handleNegotiationFinal = useCallback(async({ans})=>{
//   await peer.setLocalDescription(ans);
// },[]);

// useEffect(()=>{
//   peer.peer.addEventListener('negotiationneeded',handleNegotiationNeeded);
//   return ()=>{
//       peer.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded);
//   }
// },[handleNegotiationNeeded]);

//   useEffect(()=>{
//     peer.peer.addEventListener("track",async(ev)=>{
//         const remoteStream = ev.streams;
//         // console.log('remote stream',remoteStream);
        
//         setRemoteStream(remoteStream[0]);
//     });
    
//   },[])

//   useEffect(()=>{
//       socket.on('user:joined',handleNewUserJoined);
//       socket.on('incomming:call',handleIncommingCall);
//       socket.on('call:accepted',handleCallAccepted);
//       socket.on('peer:nego:needed',handleIncommingNegotiation);
//       socket.on('peer:nego:final',handleNegotiationFinal);
//       return ()=>{
//           socket.off('user:joined',handleNewUserJoined);
//           socket.off('incomming:call',handleIncommingCall);
//           socket.off('call:accepted',handleCallAccepted);
//           socket.off('peer:nego:needed',handleIncommingNegotiation);
//           socket.off('peer:nego:final',handleNegotiationFinal);
//       }
//   },[socket,
//     handleNewUserJoined,
//     handleIncommingCall,
//     handleCallAccepted,
//     handleIncommingNegotiation,
//     handleNegotiationFinal]);
  
  
 
//     console.log("my stream",myStream);
//     console.log("remote stream",remoteStream);
    
//   return (
//     <div className='room-container'>
//       <h1>Room page</h1>

//       {/* <button onClick={getUserMediaStream}>Grant Permission</button> */}
//       {myStream && <button onClick={sendStreams}>Send Stream</button>}
//       <h4>{remoteSocketID? "Connected":"No one in room"}</h4>
//       {remoteSocketID && <button onClick={handleCallUser}>Call</button>}
//       {
//         myStream &&
//         <>
//         <h3>my Stream</h3>
//         <ReactPlayer playing url={myStream} muted={true} height="100px"
//             width="200px"/>
//         </>
//       }
//       {
//         remoteStream &&
//         <>
//         <h3>Remote Stream</h3>
//         <ReactPlayer playing url={remoteStream} muted={true} height="100px"
//             width="200px"/>
//         </>
//       }
        
//     </div>
//   )
  
// };

// export default RoomPage;
