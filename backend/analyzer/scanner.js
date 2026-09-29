const fs = require("fs");
const path = require("path");

const ignoredFolders = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage"
]);

function scanDirectory(directory) {
  const result = {
    files: [],
    folders: [],
    extensions: {}
  };

  function walk(currentPath, relativePath = "") {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const itemRelativePath = path.join(relativePath, item);

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        if (ignoredFolders.has(item)) {
          continue;
        }

        result.folders.push(itemRelativePath);

        walk(fullPath, itemRelativePath);
      } else {
        result.files.push(itemRelativePath);

        const extension = path.extname(item).toLowerCase();

        if (extension) {
          result.extensions[extension] =
            (result.extensions[extension] || 0) + 1;
        }
      }
    }
  }

  walk(directory);

  return result;
}

module.exports = {
  scanDirectory
};