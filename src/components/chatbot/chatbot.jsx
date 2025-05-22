import { Chatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config.jsx';
import MessageParser from './messageparser.jsx';
import ActionProvider from './actionprovider.jsx';
import React, { useState } from 'react';
import './chatbot.css';

export default function Moonlayai() {
  const [showBot, toggleBot] = useState(false);
  const [key, setKey] = useState(0); // Used to re-render Chatbot

  const saveMessages = (messages, HTMLString) => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  };

  const loadMessages = () => {
    const messages = JSON.parse(localStorage.getItem('chat_messages'));
    return messages;
  };

  const clearMessages = () => {
    localStorage.removeItem('chat_messages');
    setKey((prevKey) => prevKey + 1); // Update key to re-render Chatbot
  };

  return (
    <>
      <div className="btn-container">
        <button className="default-btn-clear" onClick={clearMessages}>
          Clear Messages
        </button>
      </div>
      <div>
        <Chatbot
          key={key} // Add the key prop to force re-render
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          messageHistory={loadMessages()}
          saveMessages={saveMessages}
        />
      </div>
    </>
  );
}
