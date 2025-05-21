import { createChatBotMessage } from "react-chatbot-kit"; 
import BotAvatar from "./botavatar.jsx";

const config = {
  initialMessages: [createChatBotMessage(`Hello, how can I help you today?`)],
  customStyles: {},
  customComponents: {
    botAvatar: (props) => <BotAvatar {...props} />, // Use custom BotAvatar component
  },
};



export default config;
