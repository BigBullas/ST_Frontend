import React, { useEffect, useState } from 'react';
import { useUser } from './hooks/useUser'
import './App.css';

// const HOSTNAME = '192.168.146.193';
const HOSTNAME = 'localhost';

type Message = {
  id?: number, 
  username?: string,
  data?: string,
  send_time?: string,
  error?: string,
}

function App() {
  const { login, setUser, resetUser } = useUser();
  const [userName, setUsername] = useState(login);
  const [isLogin, setIslogin] = useState<boolean>(false);

  const [message, setMessage] = useState<Message>({data: ''});
  const [messageArray, setMessageArray] = useState<Message[]>([]);

  const [ws, setWs] = useState<WebSocket | undefined>();

  // убрать перед итоговой версией
  useEffect(() => {
    console.log('messageArray: ', messageArray);
  }, [messageArray]);

  const createWebSocket = (url: string) => {
    const ws = new WebSocket(url);
  
    ws.onopen = function() {
      console.log("WebSocket connection opened, user: ", userName);
    };
  
    ws.onmessage = function(event) {
      const msgString = event.data;
      const message = JSON.parse(msgString);

      console.log("Message from server:", message);
      
      setMessageArray(currentMsgArray => [...currentMsgArray, message]);
    };
  
    ws.onclose = function() {
      console.log("WebSocket connection closed");
    };
  
    ws.onerror = function(event) {
      console.error("WebSocket error:", event);
    };
  
    return ws;
  }

  useEffect(() => {
    if (login) {
      setIslogin(true);
      setWs(createWebSocket(`ws://${HOSTNAME}:8081/?username=${encodeURIComponent(login)}`));
    } else {
      setWs(new WebSocket(`ws://${HOSTNAME}:8081`));
    }
  }, [])

  const handleChangeMessage = (event: any) => {
    const newMsg: Message = {
      data: event.target.value,
      username: userName,
      send_time: String(new Date()),
    }
    setMessage(newMsg);
  }

  const handleClickSendMessBtn = () => {
    if (userName && ws) {
      message.send_time = '2024-02-23T13:45:41Z';
      const msgJSON = JSON.stringify(message);
      ws.send(msgJSON);
      setMessageArray(currentMsgArray => [...currentMsgArray, message]);
    }
  }

  const handleChangeLogin = (event: any) => {
    setUsername(event.target.value);
  }

  const handleClickSignInBtn = () => {
    setIslogin(true);
    setUser({
      userInfo : {
        Data: {
          login: userName,
        }
      }
    });
    if (ws) {
      ws.close(1000, 'User enter userName');
    } else {
      console.log('ws.close(1000, User enter userName); dont work');
    }
    setWs(createWebSocket(`ws://${HOSTNAME}:8081/?username=${encodeURIComponent(userName)}`));
  }

  const handleClickLogoutBtn = () => {
    setIslogin(false);
    resetUser();
    if (ws) {
      ws.close(4000, userName);
    } else {
      console.log("ws.close(4000, 'User logout'); don't work");
    }
    setUsername('');
  }

  // TODO: добавить нормальный вид даты

  return (
    <div className="App" style={{padding: '0 1.5em 2em 1.5em'}}>
      <header className="">
       dfghjkl
      </header>

      <div>
        <input
          placeholder='Введите свой логин'
          value={ userName }
          onChange={ handleChangeLogin }
          disabled= { isLogin }
        >
        </input>
        { !!isLogin ? (
            <div onClick={ handleClickLogoutBtn }>Выйти</div> 
        ) : (
            <div onClick={ handleClickSignInBtn }>Войти</div>
        )}
      </div>
      <div>
        { messageArray.length > 0 ? (
          <div>
            {messageArray.map((item, index) => {return !item.error ? (
              <div key={ index }>
                <div>от { item.username ?? 'Анон' } </div>
                <div>Сообщение: { item.data }</div>
                <div>{ item.send_time ?? String(new Date()) }</div>
              </div>
            ) : (
              <div key={ index }>
                <div>от { item.username ?? 'Анон' } </div>
                <div>Ошибка при отправке: { item.error }</div>
                <div>{ item.send_time ?? String(new Date()) }</div>
              </div>
            )})}
          </div>
        ) : (
          <div>
            <h2>
              Здесь будут сообщения
            </h2>
          </div>
        ) }

        <div>
          <input 
            placeholder='Введите сообщение'
            value={ message.data }
            onChange={ handleChangeMessage }
            disabled = { !isLogin }
            >
          </input>
          <div onClick={ handleClickSendMessBtn }>Отправить</div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
