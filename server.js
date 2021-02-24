const express = require('express')
const app = express()

const server = require('http').Server(app)

const io = require('socket.io')(server)

//for dynamic url we are using uuid
const { v4: uuidV4 } = require('uuid')

//setting express server
//rendering views 
app.set('view engine', 'ejs')
//all js and css will be stored in public
app.use(express.static('public'))

//going to homepage creates a brand new room
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

// :room dynamic var
//req.params.room gets value from url
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

//will run anytime anyone connects
//
io.on('connection', socket => {
  //listening to event when someone joins room
  //sends userid and roomid

  socket.on('join-room', (roomId, userId) => {
    //joining room
    socket.join(roomId)
    //sending message to room
    //broadcast sends message to everyone else in the room except me
    //another event and passing userid
    socket.to(roomId).broadcast.emit('user-connected', userId)
    //this will get called when someone leaves or disconnects
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

//starts server on port 3000
server.listen(3000)