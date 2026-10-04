const fs = require("fs");
const path = require("path");

const ignoredFolders = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
  "target"
]);

const supportedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".md"
]);

const MAX_FILE_SIZE = 200 * 1024;

function readSourceFiles(projectPath) {
  const sourceFiles = [];

  console.log("=================================");
  console.log("SOURCE ANALYZER");
  console.log("Project:", projectPath);
  console.log("=================================");

  function walk(currentPath, relativePath = "") {
    let items;

    try {
      items = fs.readdirSync(currentPath, {
        withFileTypes: true
      });
    } catch (error) {
      console.error(
        "Cannot read directory:",
        currentPath
      );
      console.error(error.message);
      return;
    }

    for (const item of items) {
      const fullPath = path.join(
        currentPath,
        item.name
      );

      const itemRelativePath = path.join(
        relativePath,
        item.name
      );

      // -----------------------------
      // DIRECTORY
      // -----------------------------

      if (item.isDirectory()) {
        if (ignoredFolders.has(item.name)) {
          continue;
        }

        walk(
          fullPath,
          itemRelativePath
        );

        continue;
      }

      // -----------------------------
      // FILE
      // -----------------------------

      if (!item.isFile()) {
        continue;
      }

      const extension = path
        .extname(item.name)
        .toLowerCase();

      console.log(
        "Checking:",
        itemRelativePath,
        "=>",
        extension
      );

      // Skip unsupported files
      if (!supportedExtensions.has(extension)) {
        continue;
      }

      let stats;

      try {
        stats = fs.statSync(fullPath);
      } catch {
        continue;
      }

      // Skip very large files
      if (stats.size > MAX_FILE_SIZE) {
        console.log(
          "Skipping large file:",
          itemRelativePath
        );
        continue;
      }

      try {
        const content = fs.readFileSync(
          fullPath,
          "utf8"
        );

        sourceFiles.push({
          path: itemRelativePath,
          extension,
          size: stats.size,
          content
        });

        console.log(
          "✓ Added:",
          itemRelativePath
        );

      } catch (error) {
        console.error(
          "Could not read:",
          itemRelativePath
        );

        console.error(
          error.message
        );
      }
    }
  }

  walk(projectPath);

  console.log("---------------------------------");
  console.log(
    "TOTAL SOURCE FILES:",
    sourceFiles.length
  );
  console.log("---------------------------------");

  return sourceFiles;
}

module.exports = {
  readSourceFiles
};