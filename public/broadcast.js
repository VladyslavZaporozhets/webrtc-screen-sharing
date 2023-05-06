const peerConnections = {};
// var roomID = "zC2YdU8dw9E8F";
var broadcasterstream =null;
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
 function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters[Math.floor(Math.random() * characters.length)];
    }
    return randomString;
  }
  var roomID = generateRandomString(20);
  document.getElementById('roomID').innerHTML = 'https://pitchhelper.onrender.com/?roomID=' + roomID

const socket = io.connect("https://pitchhelper.onrender.com");
// const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = broadcasterstream;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
 
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

// Get camera and microphone
const videoElement = document.querySelector("video");
getStream();
  
 

function getStream() {
 
  const constraints = {
    audio: false,
    video: true,
    preferCurrentTab : true
  };
  return navigator.mediaDevices
    .getDisplayMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  // videoElement.srcObject = stream;
  // stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  broadcasterstream = stream;
  socket.emit("broadcaster",roomID);
}

function handleError(error) {
  console.error("Error: ", error);
}