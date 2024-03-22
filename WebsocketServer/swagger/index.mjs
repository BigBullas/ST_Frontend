import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import swaggerAutogen from 'swagger-autogen'

const _dirname = dirname(fileURLToPath(import.meta.url))
console.log('_dirname', _dirname)

const doc = {
  // общая информация
  info: {
    title: 'WebChat API',
    description: 'WebChat Application Level API'
  },
  // что-то типа моделей
  definitions: {
    // модель задачи
    Message: {
      id: 1,
      username: 'Test123',
      data: 'Test message',
      send_time: '2024-02-23T13:45:41Z',
      error: 'Error from transport level by sending message'
    }
  },
  host: 'localhost:8081',
  schemes: ['http']
}

// путь и название генерируемого файла
const outputFile = join(_dirname, 'output.json')
// массив путей к роутерам
const endpointsFiles = [join(_dirname, '../index.ts')]

void swaggerAutogen(/* options */)(outputFile, endpointsFiles, doc).then(
  ({ success }) => {
    console.log(`Generated: ${success}`)
  }
)
