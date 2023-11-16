const socket = io('ws://localhost:3500')

const nameInput = document.getElementById('name')
const chatRoomInput = document.getElementById('chat-room')
const messageInput = document.getElementById('message')

const chat = document.getElementById('chat')
const chatMessages = chat.querySelector('.messages')

const userList = document.getElementById('users')
const roomList = document.getElementById('room')

const isTypingMessage = document.querySelector('.is-typing-message')

const sendMessage = (e) => {
  e.preventDefault()

  const canSendMessage = nameInput.value && chatRoomInput.value && messageInput.value

  if (canSendMessage) {
    socket.emit('send-message', {
      userName: nameInput.value,
      message: messageInput.value,
    })

    messageInput.value = ''
  }
}

const joinRoom = (e) => {
  e.preventDefault()
  if (!nameInput.value && !chatRoomInput.value) return

  socket.emit('join-room', {
    userName: nameInput.value,
    room: chatRoomInput.value,
  })

  chat.querySelector('header').innerText = `${chatRoomInput.value} Chat`
}

// Listen for message send
document
  .getElementById('send-message')
  .addEventListener('submit', sendMessage)

document
  .getElementById('join-chat')
  .addEventListener('submit', joinRoom)

messageInput.addEventListener('keypress', () => {
  socket.emit('typing', nameInput.value)
})

socket.on('send-message', (data) => {
  const { userName, time, text } = data

  const message = document.createElement('div')
  message.classList.add('message')
  const isOunMessage = userName === nameInput.value
  if(isOunMessage) message.classList.add('oun-message')


  const header = createMessageHeader(userName, time)
  const body = createMessageBody(text)
  message.append(header, body)

  chatMessages.append(message)
})

socket.on('send-info-message', (message) => {
  const infoMessage = document.createElement('p')
  infoMessage.classList.add('info-message')
  infoMessage.innerText = message
  chatMessages.append(infoMessage)
})


let isTypingMessageTimer = null
socket.on('typing', userName => {
  isTypingMessage.innerText = `${userName} is typing...`

  clearTimeout(isTypingMessageTimer)
  isTypingMessageTimer = setTimeout(() => { isTypingMessage.innerText = '' }, 1000)
})


const createMessageHeader = (userName, time) => {
  const messageHeader = document.createElement('div')
  messageHeader.classList.add('header')

  const usernameP = document.createElement('p')
  usernameP.classList.add('username')
  usernameP.innerText = userName

  const timeP = document.createElement('p')
  timeP.classList.add('time')
  timeP.innerText = time

  messageHeader.append(usernameP, timeP)
  return messageHeader
}

const createMessageBody = (text) => {
  const messageBody = document.createElement('div')
  messageBody.classList.add('body')
  messageBody.innerText = text

  return messageBody
}
