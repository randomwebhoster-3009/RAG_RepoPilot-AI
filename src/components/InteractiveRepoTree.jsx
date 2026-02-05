import { useState } from "react";
import TreeNode from "./TreeNode";
import "../styles/InteractiveRepoTree.css";

function InteractiveRepoTree({ data }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!data) {
    return (
      <div className="interactive-tree-container">
        <div className="tree-empty">No repository loaded</div>
      </div>
    );
  }

  return (
    <div className="interactive-tree-container">
      {Object.entries(data).map(([name, value]) => (
        <TreeNode
          key={name}
          name={name}
          isFolder={!!value}
          children={value}
          onSelectFile={setSelectedFile}
          selectedFile={selectedFile}
          isSelected={selectedFile === name}
          level={0}
        />
      ))}
    </div>
  );
}

export default InteractiveRepoTree;
