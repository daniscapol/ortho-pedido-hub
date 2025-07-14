import { useState } from 'react';

export const useSupportChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return {
    isChatOpen,
    toggleChat,
    openChat,
    closeChat
  };
};