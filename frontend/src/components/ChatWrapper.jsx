import { useRef, useEffect } from "react";
import AIChat from "./AIChat";
import PromptChips from "./PromptChips";
import "../styles/ChatWrapper.css";

function ChatWrapper({ treeData, isDarkMode }) {
  const chatRef = useRef(null);

  const handlePromptSelect = (prompt) => {
    // Get the textarea from AIChat and set the prompt
    const textarea = chatRef.current?.querySelector("textarea");
    if (textarea) {
      textarea.value = prompt;
      textarea.focus();
      // Trigger change event so React state updates
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);
    }
  };

  return (
    <div className={`chat-wrapper ${isDarkMode ? "dark" : ""}`}>
      <div className="chat-wrapper-header">
        <h3>AI Assistant</h3>
        <span className="chat-subtitle">Ask me about this repository</span>
      </div>

      <div className="chat-wrapper-content" ref={chatRef}>
        <AIChat />
      </div>

      {/* {treeData && (
        <div className="chat-wrapper-prompts">
          <PromptChips onSelectPrompt={handlePromptSelect} />
        </div>
      )} */}
    </div>
  );
}

export default ChatWrapper;
