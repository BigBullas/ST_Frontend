const express = require('express'); // импорт библиотеки express
const http = require('http');
const ws = require("ws");
const path = require('path'); // импорт библиотеки path для работы с путями
const app = express(); // создание экземпляра приложения express
const server = http.createServer(app); // создание HTTP-сервера
const PORT = process.env.PORT || 8081; // присвоения порта

// // Получение абсолютного пути до родительской папки
// const parentDirectoryPath = path.dirname(__dirname);

// // настройка для передачи статических файлов (__dirname - текущая директория)
// // метод join используется для соединения путей с учётом особенностей операционной системы
// app.use(express.static(path.join(parentDirectoryPath, 'frontend'), {
//   setHeaders: (res, path) => {
//     if (path.endsWith('.tsx')) {
//       res.setHeader('Content-Type', 'application/typescript');
//     }
//   }
// }));

// // по корневому запросу отдаем файл index.html из папки ./frontend
// app.get('/', (req, res) => {
//   res.sendFile(path.join(parentDirectoryPath, 'frontend', 'index.html'));
// });

// Используйте express.json() для парсинга JSON тела запроса
app.use(express.json());

// описание long polling запроса
app.post('/receive', (req, res) => {
  let body = req.body;
  console.log("body: ", body);
  res.sendStatus(200);
})

// запуск сервера приложения
server.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
})

const wss = new ws.WebSocketServer({ server });
// const messages = [];
const users = {};

wss.on("connection", (websocketConnection, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const username = url.searchParams.get('username');
  if (username !== null) {
    console.log(`[open] Connected ${req.socket.remoteAddress}, username: ${username}`);

    if (username in users) {
      users[username] = [...users[username], ws]
      // users[username].push(ws);
    } else {
      users[username] = ws;
    }
  } else {
    console.log(`[open] Connected ${req.socket.remoteAddress}`);
  }
  
  console.log(users);

  websocketConnection.on("message", (message) => {
      console.log("[message] Received from " + username + ": " + message);

      users.forEach(element => {
        if (element.username !== username) {
          use
        } 
      });

      // messages.push(message);
  });

  websocketConnection.on("close", (event) => {
    if (event.wasClean) {
      console.log(username, `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
      // например, сервер убил процесс или сеть недоступна
      // обычно в этом случае event.code 1006
      console.log(username, '[close] Соединение прервано', event);
    }
  });
});

// TODO: раскидать соединения в объект
// TODO: научиться отправлять сообщения определённому клиенту
// TODO: в будущем отправлять сообщения всем клиентам кроме отправителя

// TODO: настроить отправку сообщений со стороны фронта
// TODO: настроить выход из веб сокет соединения со стороны фронта
// TODO: то же самое со стороны бэке (удалять из объекта)

// TODO: научиться дёргать ручку Миши
