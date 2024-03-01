const express = require('express'); // импорт библиотеки express
const axios = require('axios');
const http = require('http');

const app = express(); // создание экземпляра приложения express
const server = http.createServer(app); // создание HTTP-сервера
const PORT = process.env.PORT || 8085; // присвоения порта
// const HOSTNAME = '192.168.146.193';
const HOSTNAME = 'localhost';

app.use(express.json());

app.post('/send', async (req, res) => {
  const message = req.body;
  console.log("body: ", message);

  const response = await sendMsgToWebSocketServer(message);
  if (response.status !== 200) {
    res.sendStatus(403);
  }
  res.sendStatus(200);
});

const sendMsgToWebSocketServer = async (message) => {
  const response = await axios.post(`http://${HOSTNAME}:8081/receive`, message);
  return response;
}

// запуск сервера приложения
server.listen(PORT, HOSTNAME, () => {
  console.log(`Server started at http://${HOSTNAME}:${PORT}`);
})
