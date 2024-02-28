const express = require('express'); // импорт библиотеки express
const axios = require('axios');
const http = require('http');
const ws = require("ws");
const path = require('path'); // импорт библиотеки path для работы с путями

const app = express(); // создание экземпляра приложения express
const server = http.createServer(app); // создание HTTP-сервера
const PORT = process.env.PORT || 8081; // присвоения порта

// Используйте express.json() для парсинга JSON тела запроса
app.use(express.json());

// TODO: продумать поле для ошибки
app.post('/receive', (req, res) => {
  const message = req.body;
  console.log("body: ", message);

  sendMessageToOtherUsers(message.username, message);

  res.sendStatus(200);
});

// запуск сервера приложения
server.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
})

const wss = new ws.WebSocketServer({ server });
const users = {};

const sendMsgToTransportLevel = async (message) => {
  const response = await axios.post('http://localhost:8085/send', message);
  if (response.status !== 200) {
    message.error = 'Error from transport level by sending message';
    users[message.username].forEach(element => {
      element.send(message);
    });
  }
}

const sendMessageToOtherUsers = (username, message) => {
  for (key in users) {
    console.log(`[array] key: ${ key }, users[keys]: ${ users[key] }; username: ${ username }`);
    if (key !== username) {
      const msgString = JSON.stringify(message);
      users[key].forEach(element => {
        element.send(msgString);
      });
    }
  }
}

wss.on("connection", (websocketConnection, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const username = url.searchParams.get('username');
  if (username !== null) {
    console.log(`[open] Connected ${req.socket.remoteAddress}, username: ${username}`);

    if (username in users) {
      users[username] = [...users[username], websocketConnection]
    } else {
      users[username] = [websocketConnection];
    }
  } else {
    console.log(`[open] Connected ${req.socket.remoteAddress}`);
  }
  
  websocketConnection.on("message", async (messageString) => {
    console.log("[message] Received from " + username + ": " + messageString);
    const message = await JSON.parse(messageString);
    message.sender = message.username ?? username;

    sendMsgToTransportLevel(message);
  });

  websocketConnection.on("close", (event) => {
    console.log(username, '[close] Соединение прервано', event);

    delete users.username; // don't work
  });
});

// TODO: при удалении соединения из users учитывать, что возможно в массиве есть другие соединения этого же username
// либо удалять всех
// либо оставлять массив

// TODO: разобраться, как удалять свойство в объекте, delete users.username не работает

