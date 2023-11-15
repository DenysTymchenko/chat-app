const socket = io('ws://localhost:3500')

const messageInput = document.querySelector('input')
const isTypingMessage = document.querySelector('.is-typing-message')

const sendMessage = (e) => {
  e.preventDefault()

  if (messageInput.value) {
    socket.emit('message', messageInput.value)
    messageInput.value = ''
  }
}

// Listen for message send
document
  .querySelector('form')
  .addEventListener('submit', sendMessage)

socket.on('message', (data) => {
  isTypingMessage.innerText = ''

  const message = document.createElement('li')
  message.innerText = data
  document.querySelector('.messages-list').append(message)
})

// Listen for message typing
messageInput.addEventListener('keypress', () => {
  socket.emit('typing', socket.id.substring(0, 5))
})

let isTypingMessageTimer = null
socket.on('typing', userName => {
  isTypingMessage.innerText = `${userName} is typing...`

  clearTimeout(isTypingMessageTimer)
  isTypingMessageTimer = setTimeout(() => {isTypingMessage.innerText = ''}, 1000)
})
