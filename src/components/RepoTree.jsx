import React from "react";
import "../styles/RepoTree.css";

function RepoTree({ data }) {
  if (!data) return null;

  const renderTree = (node) => {
    return (
      <ul className="tree">
        {Object.entries(node).map(([name, value]) => (
          <li key={name} className={value ? "folder" : "file"}>
            <span>{name}</span>
            {value && renderTree(value)}
          </li>
        ))}
      </ul>
    );
  };

  return <div className="repo-container">{renderTree(data)}</div>;
}

export default RepoTree;
