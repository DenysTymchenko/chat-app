const socket = io('ws://localhost:3500')

const sendMessage = (e) => {
  e.preventDefault()

  const messageInput = document.querySelector('input')

  if(messageInput.value) {
    socket.emit('message', messageInput.value)
    messageInput.value = ''
  }
}

document
  .querySelector('form')
  .addEventListener('submit', sendMessage)

// Listen messages
socket.on('message', (data) => {
  const message = document.createElement('li')
  message.innerText = data
  document.querySelector('.messages-list').append(message)
})
