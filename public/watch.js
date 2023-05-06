let peerConnection;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomID = urlParams.get('roomID')
// var roomID = "zC2YdU8dw9E8F";
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};
 
const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
 
socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
    document.getElementById("loadingGif").style.display = "none";
    document.getElementById("loadingH1").style.display = "none";
    document.getElementById("video").style.display = "block";

  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher",roomID);
});

socket.on("broadcaster", (ID) => {
  if(ID == roomID)
      socket.emit("watcher",roomID);
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
 