import { useState } from "react";

function TreeNode({
  name,
  isFolder,
  children,
  onSelectFile,
  selectedFile,
  isSelected,
  level = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile?.(name);
    }
  };

  const getFileIcon = (fileName) => {
    if (isFolder) return "📁";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap = {
      py: "🐍",
      js: "⚡",
      jsx: "⚛️",
      ts: "💙",
      tsx: "💙",
      json: "📋",
      md: "📝",
      css: "🎨",
      html: "🌐",
      txt: "📄",
      yml: "⚙️",
      yaml: "⚙️",
      sh: "💻",
      env: "🔑",
    };
    return iconMap[ext] || "📄";
  };

  const hasChildren = children && Object.keys(children).length > 0;
  const isFile = !isFolder;

  return (
    <div className="tree-node" style={{ paddingLeft: `${level * 12}px` }}>
      <div
        className={`tree-item ${isSelected ? "selected" : ""} ${
          isFile ? "file" : "folder"
        }`}
        onClick={handleClick}
      >
        {isFolder && hasChildren && (
          <span className={`tree-arrow ${isOpen ? "open" : ""}`}>▸</span>
        )}
        {isFolder && !hasChildren && <span className="tree-arrow empty">▸</span>}
        {isFile && <span className="tree-arrow empty">▸</span>}

        <span className="tree-icon">{getFileIcon(name)}</span>
        <span className="tree-label">{name}</span>
      </div>

      {isFolder && isOpen && hasChildren && (
        <div className="tree-children">
          {Object.entries(children).map(([childName, childValue]) => (
            <TreeNode
              key={childName}
              name={childName}
              isFolder={!!childValue}
              children={childValue}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
              isSelected={selectedFile === childName}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
