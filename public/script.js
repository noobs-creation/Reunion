//now we can call socket.io join-room event
const socket = io('/')


//using peerjs to create a peer
//due to working on local server we are defining host and port
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

//reference to video grid from room.ejs
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')

let myVideoStream;

//muting my video for myself
myVideo.muted = true

//to keep track of users
const peers = {}

//connecting video
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)

  //listening to someone when they call us
  myPeer.on('call', call => {
    //answer by sending our stream
    call.answer(stream)
    const video = document.createElement('video')
    //now responding to incoming video stream
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  //allowing to be connected to new users
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

//listening to event from server.js
socket.on('user-disconnected', userId => {
  if (peers[userId]) 
    peers[userId].close()
})

myPeer.on('open', id => {
  //sending event to server
  //here id is userid
  socket.emit('join-room', ROOM_ID, id)
})

//function connectToNewUser for  
function connectToNewUser(userId, stream) {

  //calling other user and sending our stream
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  //when they send their stream back we will use this event
  call.on('stream', userVideoStream => {
    //adding to our list of video streams
    addVideoStream(video, userVideoStream)
  })
  //when someone leaves video call
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}


//function addVideoStream for audio/video stream
function addVideoStream(video, stream) {
  //playing video
  video.srcObject = stream
  //as soon as video is loaded we need to play it
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



