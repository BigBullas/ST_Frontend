import express from 'express' // импорт библиотеки express
import axios from 'axios'
import http from 'http'
import ws, { type WebSocket } from 'ws'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'

const PORT: number = 8081 // присвоения порта

// const PORT_TRANSPORT_LEVEL = 8080
const PORT_TRANSPORT_LEVEL = 8085

// const HOSTNAME = '192.168.146.193'
const HOSTNAME = 'localhost'

const HOSTNAME_TRANSPORT_LEVEL = 'localhost'
// const HOSTNAME_TRANSPORT_LEVEL = '192.168.146.106'

interface Message {
  id?: number
  username: string
  data?: string
  send_time?: string
  error?: string
}

type Users = Record<string, Array<{
  id: number
  ws: WebSocket
}>>

const app = express() // создание экземпляра приложения express
const server = http.createServer(app) // создание HTTP-сервера

// Используйте express.json() для парсинга JSON тела запроса
app.use(express.json())

const swaggerFile = JSON.parse(fs.readFileSync('./swagger/output.json').toString())
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// TODO: продумать поле для ошибки
app.post('/receive', (req: { body: Message }, res: { sendStatus: (arg0: number) => void }) => {
  // #swagger.description = 'Receive new message'
  // #swag
  // тело запроса
  /* #swagger.parameters['message'] = {
   in: 'body',
   description: 'New message',
   type: 'object',
   required: true,
   schema: { $ref: '#/definitions/Message' }
  } */
  /* #swagger.responses[200] = {} */

  const message: Message = req.body
  console.log('body: ', message)

  sendMessageToOtherUsers(message.username, message)
  res.sendStatus(200)
})

// запуск сервера приложения
server.listen(PORT, HOSTNAME, () => {
  console.log(`Server started at http://${HOSTNAME}:${PORT}`)
})

const wss = new ws.WebSocketServer({ server })
const users: Users = {}

const sendMsgToTransportLevel = async (message: Message): Promise<void> => {
  const response = await axios.post(`http://${HOSTNAME_TRANSPORT_LEVEL}:${PORT_TRANSPORT_LEVEL}/send`, message)
  if (response.status !== 200) {
    message.error = 'Error from transport level by sending message'
    users[message.username].forEach(element => {
      if (message.id === element.id) {
        element.ws.send(JSON.stringify(message))
      }
    })
  }
  console.log('Response from transport level: ', response)
}

function sendMessageToOtherUsers (username: string, message: Message): void {
  const msgString = JSON.stringify(message)
  for (const key in users) {
    console.log(`[array] key: ${key}, users[keys]: ${JSON.stringify(users[key])} username: ${username}`)
    if (key !== username) {
      users[key].forEach(element => {
        element.ws.send(msgString)
      })
    }
  }
}

wss.on('connection', (websocketConnection: WebSocket, req: Request) => {
  if (req.url.length === 0) {
    console.log(`Error: req.url = ${req.url}`)
    return
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const url = new URL(req?.url, `http://${req.headers.host}`)
  const username = url.searchParams.get('username')

  if (username !== null) {
    console.log(`[open] Connected, username: ${username}`)

    if (username in users) {
      users[username] = [...users[username], { id: users[username].length, ws: websocketConnection }]
    } else {
      users[username] = [{ id: 1, ws: websocketConnection }]
    }

    // TODO: здесь надо отправлять сообщение пользователю с id его соединения и типом INFO (везде добавить типы сообщений)
  } else {
    console.log('[open] Connected')
  }

  websocketConnection.on('message', (messageString: string) => {
    // TODO: проверить, есть ли ошибка на этом месте (раньше было: (messageString) типа RawData)
    console.log('[message] Received from ' + username + ': ' + messageString)

    const message: Message = JSON.parse(messageString)
    message.username = message.username ?? username

    void sendMsgToTransportLevel(message)
  })

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete users.username // don't work
  })
})

// TODO: при удалении соединения из users учитывать, что возможно в массиве есть другие соединения этого же username
// либо удалять всех
// либо оставлять массив

// TODO: разобраться, как удалять свойство в объекте, delete users.username не работает
