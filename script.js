/* eslint-disable no-trailing-spaces */
const COLORS = [];
const TYPING_TIMER_LENGTH = 400;
const checkHighlightName = (text, username) => {
  const index = text.indexOf(`@${username}`);
  if (index > -1) {
    return text.replace(username, `<span class="highlight-username">@${username}</span>`);
  }
  return text;
};


(function () {
  const userHeader = document.getElementById('user-header');
  const nameInput = document.getElementById('name-input');
  const userNameButton = document.getElementById('submit-name-button');
  const messages = document.getElementById('messages');
  const users = document.getElementById('users');
  const text = document.getElementById('message-text');
  const textButton = document.getElementById('submit-text-button');

  const typing = false;

  let userName = 'Mr. Nobody';
  userHeader.innerText = userName;

  const socket = io.connect();

  userNameButton.addEventListener('click', () => {
    userName = nameInput.value || 'Mr. Nobody';
    userHeader.innerText = userName;
    const user = {
      username: userName,
      nickname: `anon${this.connection}`,
      status: 'just appeared',
      connection: '',
    };
    socket.emit('user connected', user);
  });

  textButton.addEventListener('click', () => {
    const data = {
      sender: userName,
      text: text.value,
    };
    text.value = '';
    socket.emit('chat message', data);
  });


  socket.on('chat history', (history) => {
    messages.innerHTML = '';
    for (const i in history) {
      if (history.hasOwnProperty(i)) {
        const item = document.createElement('li');
        item.innerText = `${history[i].sender}: \n${history[i].text}`;
        messages.appendChild(item);
      }
    }
  });
  socket.on('chat message to u', (msg) => {
    const item = document.createElement('li');
    item.innerHTML
  });
  socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.innerText = `${(msg.sender === 'server') ? '' : `${msg.sender}: \n`}${msg.text}`;
    messages.appendChild(item);
  });


  socket.on('fresh user list', (userList) => {
    users.innerHTML = '';
    for (const i in userList) {
      if (userList.hasOwnProperty(i)) {
        const item = document.createElement('li');
        item.innerText = `${userList[i].username}: ${userList[i].status}`;
        users.appendChild(item);
      }
    }
  });


  socket.on('user disconnected', (user) => {
    const item = document.createElement('li');
    item.innerText = `${user.username} went offline`;
    messages.appendChild(item);
  });
}());

