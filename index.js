/* eslint-disable semi,no-trailing-spaces */
// eslint-disable-next-line import/newline-after-import
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3030;
const messages = [];
const users = [];


app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/script.js', (req, res) => {
  res.sendFile(`${__dirname}/script.js`);
});

app.use(express.static(`${__dirname}/public`));
app.use('/public', express.static(`${__dirname}/public`));

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('user connected', (user) => {
    const index = users.map(obj => obj.username).indexOf(user.username);
    if (index > -1) {
      users[index].status = 'just appeared';
    } else {
      user.connection = socket.id;
      users.push(user);
    }
    console.log(users);
    io.emit('fresh user list', users);
  });

  setTimeout(() => {
    const index = users.map(obj => obj.connection).indexOf(socket.id);
    console.log(index);
    users[index].status = 'online';
    socket.emit('fresh user list', users);
  }, 15000);

  socket.on('chat message', (msg) => {
    messages.push(msg);
    if (messages.length > 100) {
      messages.shift();
    }
    for (const user in users) {
      io.to(user.connection).emit(
        (msg.text.indexOf(`@${user.nickname}`) > -1) ? 'chat message to u' : 'chat message',
        msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const index = users.map(obj => obj.connection).indexOf(socket.id);
    users[index].status = 'offline';
    messages.push({
      sender: 'server',
      text: `${users[index].username} went offline`,
    });
    io.emit('fresh user list', users);
    io.emit('user disconnected', users[index]);
  });

  socket.on('typing', (user) => {
    io.emit('typing', user);
  });

  socket.on('stop typing', (user) => {
    io.emit('stop typing', user);
  });

  socket.emit('chat history', messages);
  socket.emit('fresh user list', users);
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});


const highlightAndSendMessage = (msg, nickname) => {
  if (msg.text.indexOf(`@${nickname}`) > -1) {
     msg.text.replace(`@${nickname}`, `<span class="highlight-username">@${nickname}</span>`);
  }
}