import { useState } from "react";

function buildTree(files, folders) {
  const root = {
    name: "root",
    type: "folder",
    children: {}
  };

  const addPath = (path, type) => {
    const parts = path.split("\\");
    let current = root;

    parts.forEach((part, index) => {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: index === parts.length - 1 ? type : "folder",
          children: {}
        };
      }

      current = current.children[part];
    });
  };

  folders.forEach((folder) => {
    addPath(folder, "folder");
  });

  files.forEach((file) => {
    addPath(file, "file");
  });

  return root;
}


function TreeNode({ node, level = 0 }) {

  const [expanded, setExpanded] = useState(level === 0);

  const children = Object.values(node.children || {});

  const folders = children.filter(
    (child) => child.type === "folder"
  );

  const files = children.filter(
    (child) => child.type === "file"
  );


  return (
    <div>

      {node.name !== "root" && (
        <div
          className="tree-item"
          style={{
            paddingLeft: `${level * 20}px`
          }}
          onClick={() => {
            if (node.type === "folder") {
              setExpanded(!expanded);
            }
          }}
        >

          <span className="tree-icon">
            {node.type === "folder"
              ? expanded
                ? "📂"
                : "📁"
              : "📄"}
          </span>

          <span>{node.name}</span>

        </div>
      )}


      {expanded && (
        <>

          {folders.map((folder) => (
            <TreeNode
              key={folder.name}
              node={folder}
              level={level + 1}
            />
          ))}


          {files.map((file) => (
            <TreeNode
              key={file.name}
              node={file}
              level={level + 1}
            />
          ))}

        </>
      )}

    </div>
  );
}


function FileTree({ files, folders }) {

  const tree = buildTree(files, folders);

  return (
    <div className="file-tree">

      <TreeNode node={tree} />

    </div>
  );
}


export default FileTree;