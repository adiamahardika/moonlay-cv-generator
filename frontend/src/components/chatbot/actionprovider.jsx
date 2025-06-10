import React from "react";
import axios from "axios";

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handle_response = async (message) => {
    // Convert the message to uppercase
    const upperCaseMessage = message.toUpperCase();

    try {
      // Convert the uppercase message to a JSON string
      const user_query = JSON.stringify(upperCaseMessage);
     const data = { query: message };
      console.log("Ini" + import.meta.env.VITE_BACKEND_URL)
      // Make the POST request to the Flask backend
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api`, data);

      // Save the bot's response to a variable
      const botResponse = response.data.bot_response;

      console.log(botResponse);

      // Create the bot message using the saved response
      const botMessage = createChatBotMessage(botResponse);

      // Use the botMessage variable as needed, for example, updating state
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handle_response,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
