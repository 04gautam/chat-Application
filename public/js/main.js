document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const usernameModal = document.getElementById('username-modal');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');
    const onlineUsersList = document.getElementById('online-users');
    const typingIndicator = document.getElementById('typing-indicator');

    let username = '';

    // Show username modal
    usernameModal.style.display = 'flex';

    // Handle username submission
    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        username = usernameInput.value.trim();
        if (username) {
            usernameModal.style.display = 'none';
            socket.emit('new user', username);
        }
    });

    // Handle message submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chat message', message);
            // Don't add the message here - wait for the server to broadcast it back
            messageInput.value = '';
        }
    });

    // Handle typing indicator
    messageInput.addEventListener('input', () => {
        if (messageInput.value.trim()) {
            socket.emit('typing');
        }
    });

    // Socket.io event listeners
    socket.on('chat message', (data) => {
        addMessage(data.user, data.message, data.user === username);
    });

    socket.on('user joined', (user) => {
        addNotification(`${user} joined the chat`);
    });

    socket.on('user left', (user) => {
        addNotification(`${user} left the chat`);
    });

    socket.on('online users', (users) => {
        onlineUsersList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            onlineUsersList.appendChild(li);
        });
    });

    socket.on('typing', (user) => {
        if (user !== username) {
            typingIndicator.textContent = `${user} is typing...`;
            setTimeout(() => {
                typingIndicator.textContent = '';
            }, 3000);
        }
    });

    // Helper functions
    function addMessage(user, message, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isSent ? 'sent' : 'received');
        
        const userDiv = document.createElement('div');
        userDiv.classList.add('message-user');
        userDiv.textContent = user;
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = message;
        
        messageDiv.appendChild(userDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addNotification(text) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = text;
        messagesContainer.appendChild(notification);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
