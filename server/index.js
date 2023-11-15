import express from 'express'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3500
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__filename);
console.log(__dirname);

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

const expressServer = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
  console.log(`Open in browser: http://localhost:${PORT}/`)
})

const io = new Server(expressServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false
      : ['http://localhost:5500', 'http://127.0.0.1:5500'],

  }
})

io.on('connection', socket => {
  console.log(`User ${socket.id} connected`)
  // On connection - for connected user only
  socket.emit('message', 'Welcome to Chat App <3')
  // On connection - for everyone, except user (because of broadcast)
  socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} connected`)

  // Listening for events (emits)
  socket.on('message', data => {
    console.log(data)
    io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
  })

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
    socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)} disconnected`)
  });

  socket.on('typing', (userName) => {
    socket.broadcast.emit('typing', userName)
  })
})
