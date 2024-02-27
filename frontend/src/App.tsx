import React, { useEffect, useState } from 'react';
import { useUser } from './hooks/useUser'
import logo from './logo.svg';
import './App.css';
import { current } from '@reduxjs/toolkit';

type Message = {
  sender?: string,
  text: string,
  date?: string,
}

function App() {
  const { login, setUser, resetUser } = useUser();
  const [userName, setUsername] = useState(login);
  const [isLogin, setIslogin] = useState<boolean>(false);

  const [message, setMessage] = useState<Message>({text: ''});
  const [messageArray, setMessageArray] = useState<Message[]>([]);

  const [ws, setWs] = useState<WebSocket | undefined>();

  useEffect(() => {
    console.log('messageArray: ', messageArray);
  }, [messageArray]); // Зависимость от messageArray

  const createWebSocket = (url: string) => {
    const ws = new WebSocket(url);
  
    ws.onopen = function() {
      console.log("WebSocket connection opened, user: ", userName);
    };
  
    ws.onmessage = function(event) {
      const msgString = event.data;
      // Преобразование массива чисел в строку
      // const dataString = String.fromCharCode.apply(null, bufferObject.data);
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
      setWs(createWebSocket(`ws://localhost:8081/?username=${encodeURIComponent(login)}`));
    } else {
      setWs(new WebSocket('ws://localhost:8081'));
    }
  }, [])

  const handleChangeMessage = (event: any) => {
    const newMsg: Message = {
      text: event.target.value,
      sender: userName,
      date: String(new Date()),
    }
    setMessage(newMsg);
  }

  const handleClickSendMessBtn = () => {
    if (userName && ws) {
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
    setWs(createWebSocket(`ws://localhost:8081/?username=${encodeURIComponent(userName)}`));
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
            {messageArray.map((item, index) => (
              <div key={ index }>
                <div>от { item.sender ?? 'Анон' } </div>
                <div>Сообщение: { item.text }</div>
                <div>{ item.date ?? String(new Date()) }</div>
              </div>
            ))}
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
            value={ message.text }
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
