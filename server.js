const express = require("express");
const app = express();

// let broadcaster;
const port = 4000;

const http = require("http");
const server = http.createServer(app);
var  BroadcasterGroup = {}
var  Wather2Server = {}
 const io = require("socket.io")(server, {
   cors: {
     origin: "*"
   }});

app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  socket.on("broadcaster", (roomID) => {
     
    try{
        let broadcaster = socket.id;
        BroadcasterGroup[roomID] = broadcaster
        socket.broadcast.emit("broadcaster",roomID);
    }catch(err){
      console.log("broadcaster",err)
    }
  });

  socket.on("watcher", (roomID) => {
    
    
    try{
        Wather2Server[roomID] = socket.id
        
        if(BroadcasterGroup[roomID])
            socket.to(BroadcasterGroup[roomID]).emit("watcher", socket.id);
    }catch(err){
      console.log("watcher",err)
    }
  
  });
  
  socket.on("offer", (id, message) => {
    try{
      socket.to(id).emit("offer", socket.id, message);
    }catch(err){
      console.log("offer",err)
    }
  });
  
  socket.on("answer", (id, message) => {
    try{
        socket.to(id).emit("answer", socket.id, message);
    }catch(err){
      console.log("answer",err)
    }
  });
  
  socket.on("candidate", (id, message) => {
      try{
          socket.to(id).emit("candidate", socket.id, message);
      }catch(err){
        console.log("candidate", err)
      }
  });
  
  socket.on("disconnect", () => {
    try{
        if(Wather2Server[socket.id])
        socket.to(Wather2Server[socket.id]).emit("disconnectPeer", socket.id);
    }catch(err){
      console.log("disconnect",err)
    }
  });

});
server.listen(port, () => console.log(`Server is running on port ${port}`));
