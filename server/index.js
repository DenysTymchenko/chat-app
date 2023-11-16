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
  console.log(`\nServer started on port ${PORT}`)
  console.log(`Open in browser: http://localhost:${PORT}/\n`)
})

// state
const usersState = {
  users: [],
  setUsers: function(newUsers) {
    this.users = newUsers;
  }
}

const io = new Server(expressServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false
      : ['http://localhost:5500', 'http://127.0.0.1:5500'],

  }
})

io.on('connection', socket => {
  console.log(`User ${socket.id} connected`)
  socket.emit('send-info-message', 'Type in your name and desired chat room to join conversation')

  socket.on('join-room', ({ userName, room }) => {
    // If user was connected to some room previously - disconect him from there
    //const prevRoom = getUser(socket.id)?.room
    //if (prevRoom) {
    //  socket.leave(prevRoom)
    //  io.to(prevRoom).emit('message', buildMsg(ADMIN, `${userName} has left the room`))
    //}

    const user = AddNewUserToTheRoom(socket.id, userName, room)
    socket.join(user.room)
    socket.emit('send-info-message', (`You have joined the ${user.room} chat room`))
    socket.broadcast.to(user.room).emit('send-info-message', `${user.name} has joined the chat`)

    // Update users list for chat room
    io.to(user.room).emit('usersList', { users: getUsersInRoom(user.room) })

    // Update users list for everyone
    io.emit('roomsList', { rooms: getAllActiveRooms() })
  })

  // Listening for events (emits)
  socket.on('disconnect', () => {
    const user = getUser(socket.id)
    if (!user) return

    removeUser(socket.id)
    io.to(user.room).emit('send-info-message', `${user.name} has left the chat`)
    io.to(user.room).emit('usersList', { users: getUsersInRoom(user.room) })
    io.emit('roomsList', { rooms: getAllActiveRooms() })

    console.log(`${user.name} with socket id: ${socket.id} - disconnected`)
  });

  socket.on('send-message', ({ userName, message }) => {
    const room = getUser(socket.id)?.room
    if (!room) return

    io.to(room).emit('send-message', buildMsg(userName, message))
  })
})

const buildMsg = (userName, text) => {
  console.log('check')
  return {
    userName,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(new Date())
  }
}

// User functions
const AddNewUserToTheRoom = (id, name, room) => {
  const user = { id, name, room }

  usersState.setUsers([
    ...usersState.users.filter(user => user.id !== id),
    user
  ])

  return user
}

const removeUser = (id) => {
  usersState.setUsers(
    [...usersState.users.filter(user => user.id !== id)]
  )
}

const getUser = (id) => {
  return usersState.users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
  return usersState.users.filter(user => user.room === room)
}

const getAllActiveRooms = () => {
  return Array.from(new Set(usersState.users.map(user => user.room)))
}
