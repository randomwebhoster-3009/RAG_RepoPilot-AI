import "../styles/PromptChips.css";

function PromptChips({ onSelectPrompt }) {
  const prompts = [
    "Summarize this repository",
    "What does this project do?",
    "Explain folder structure",
    "List the main files",
  ];

  return (
    <div className="prompt-chips">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          className="prompt-chip"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

export default PromptChips;
