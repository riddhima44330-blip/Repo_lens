const path = require("path");


// ==========================================
// NORMALIZE PATH
// ==========================================

function normalizePath(filePath) {
  return filePath
    .replace(/\\/g, "/");
}


// ==========================================
// GET FILE NAME
// ==========================================

function getFileName(filePath) {
  return path
    .basename(filePath);
}


// ==========================================
// DETECT FILE CATEGORY
// ==========================================

function detectCategory(filePath) {

  const normalized =
    normalizePath(filePath).toLowerCase();

  const fileName =
    getFileName(filePath).toLowerCase();


  if (
    normalized.includes("/frontend/") ||
    normalized.includes("/components/") ||
    fileName.endsWith(".jsx") ||
    fileName.endsWith(".tsx")
  ) {
    return "Frontend";
  }


  if (
    normalized.includes("/routes/") ||
    fileName.includes("route")
  ) {
    return "API / Routes";
  }


  if (
    normalized.includes("/ai/") ||
    fileName.includes("ai")
  ) {
    return "AI";
  }


  if (
    normalized.includes("/analyzer/") ||
    fileName.includes("analyzer")
  ) {
    return "Analysis";
  }


  if (
    normalized.includes("/backend/") ||
    fileName === "server.js" ||
    fileName === "server.ts"
  ) {
    return "Backend";
  }


  if (
    normalized.includes("/test") ||
    fileName.includes(".test.") ||
    fileName.includes(".spec.")
  ) {
    return "Tests";
  }


  return "Other";
}


// ==========================================
// GROUP SOURCE FILES
// ==========================================

function groupSourceFiles(sourceFiles) {

  const groups = {};

  sourceFiles.forEach((file) => {

    if (!file?.path) {
      return;
    }


    const category =
      detectCategory(file.path);


    if (!groups[category]) {
      groups[category] = [];
    }


    groups[category].push(
      file.path
    );

  });


  return groups;
}


// ==========================================
// BUILD PROJECT STRUCTURE
// ==========================================

function buildStructure(
  scan
) {

  if (!scan) {
    return [];
  }


  const folders =
    scan.folders || [];

  const files =
    scan.files || [];


  return [
    ...folders.map(
      (folder) =>
        `- 📁 ${normalizePath(folder)}`
    ),

    ...files.map(
      (file) =>
        `- 📄 ${normalizePath(file)}`
    )
  ];

}


// ==========================================
// BUILD DOCUMENTATION
// ==========================================

function generateDocumentation(
  context
) {

  const analysis =
    context.analysis || {};

  const scan =
    context.scan || {};

  const health =
    context.health || {};

  const readme =
    context.documentation || {};

  const sourceFiles =
    context.sourceCode?.files || [];


  const projectName =
    analysis.projectName ||
    context.project?.name ||
    "Unknown Project";


  const languages =
    analysis.languages || [];


  const frameworks =
    analysis.frameworks || [];


  const tools =
    analysis.tools || [];


  const dependencies =
    analysis.dependencies || [];


  const devDependencies =
    analysis.devDependencies || [];


  const groups =
    groupSourceFiles(
      sourceFiles
    );


  // ========================================
  // PROJECT OVERVIEW
  // ========================================

  let documentation = "";


  documentation +=
    `# ${projectName}\n\n`;


  documentation +=
    `## 📌 Project Overview\n\n`;


  documentation +=
    `RepoLens-generated documentation for **${projectName}**.\n\n`;


  documentation +=
    `This repository contains **${scan.files?.length || 0} files** across **${scan.folders?.length || 0} folders**.\n\n`;


  // ========================================
  // TECHNOLOGY STACK
  // ========================================

  documentation +=
    `## 🛠️ Technology Stack\n\n`;


  if (languages.length > 0) {

    documentation +=
      `### Languages\n\n`;

    languages.forEach(
      (language) => {

        documentation +=
          `- ${language}\n`;

      }
    );

    documentation += "\n";
  }


  if (frameworks.length > 0) {

    documentation +=
      `### Frameworks\n\n`;

    frameworks.forEach(
      (framework) => {

        documentation +=
          `- ${framework}\n`;

      }
    );

    documentation += "\n";
  }


  if (tools.length > 0) {

    documentation +=
      `### Tools\n\n`;

    tools.forEach(
      (tool) => {

        documentation +=
          `- ${tool}\n`;

      }
    );

    documentation += "\n";
  }


  // ========================================
  // ARCHITECTURE
  // ========================================

  documentation +=
    `## 🏗️ Architecture\n\n`;


  documentation +=
    `The repository is organized into the following major areas:\n\n`;


  Object.entries(groups)
    .forEach(
      ([category, files]) => {

        documentation +=
          `### ${category}\n\n`;

        files
          .slice(0, 15)
          .forEach(
            (file) => {

              documentation +=
                `- \`${normalizePath(file)}\`\n`;

            }
          );

        documentation += "\n";

      }
    );


  // ========================================
  // PROJECT STRUCTURE
  // ========================================

  documentation +=
    `## 📁 Project Structure\n\n`;


  const structure =
    buildStructure(
      scan
    );


  documentation +=
    structure
      .slice(0, 100)
      .join("\n");


  documentation +=
    "\n\n";


  // ========================================
  // DEPENDENCIES
  // ========================================

  documentation +=
    `## 📦 Dependencies\n\n`;


  if (dependencies.length > 0) {

    documentation +=
      `### Production Dependencies\n\n`;

    dependencies.forEach(
      (dependency) => {

        documentation +=
          `- \`${dependency}\`\n`;

      }
    );

    documentation += "\n";

  }


  if (devDependencies.length > 0) {

    documentation +=
      `### Development Dependencies\n\n`;

    devDependencies.forEach(
      (dependency) => {

        documentation +=
          `- \`${dependency}\`\n`;

      }
    );

    documentation += "\n";

  }


  // ========================================
  // HEALTH
  // ========================================

  documentation +=
    `## 🩺 Repository Health\n\n`;


  documentation +=
    `Health Score: **${health.score ?? "Unknown"}/100**\n\n`;


  documentation +=
    `- Passed checks: ${health.passedChecks ?? 0}\n`;


  documentation +=
    `- Checks needing attention: ${health.failedChecks ?? 0}\n\n`;


  // ========================================
  // README CONSISTENCY
  // ========================================

  documentation +=
    `## 📖 README Consistency\n\n`;


  documentation +=
    `Documentation consistency score: **${readme.score ?? "Unknown"}/100**\n\n`;


  if (
    readme.mismatches &&
    readme.mismatches.length > 0
  ) {

    documentation +=
      `### Potential inconsistencies\n\n`;


    readme.mismatches
      .forEach(
        (item) => {

          documentation +=
            `- ⚠️ ${item.message}\n`;

        }
      );

    documentation += "\n";

  } else {

    documentation +=
      `No README technology mismatches were detected.\n\n`;

  }


  // ========================================
  // DEVELOPER STARTING POINT
  // ========================================

  documentation +=
    `## 🧭 Developer Starting Point\n\n`;


  documentation +=
    `When exploring this repository, start with the main application entry points and then follow the API and analysis modules.\n\n`;


  if (
    sourceFiles.some(
      (file) =>
        getFileName(file.path)
          .toLowerCase() ===
        "app.jsx"
    )
  ) {

    documentation +=
      `1. \`App.jsx\` — Main frontend application.\n`;

  }


  if (
    sourceFiles.some(
      (file) =>
        getFileName(file.path)
          .toLowerCase() ===
        "server.js"
    )
  ) {

    documentation +=
      `2. \`server.js\` — Backend entry point.\n`;

  }


  documentation +=
    `3. Explore the API routes.\n`;


  documentation +=
    `4. Explore the repository analyzers.\n`;


  documentation +=
    `5. Explore the AI modules.\n\n`;


  documentation +=
    `---\n\n`;


  documentation +=
    `Generated automatically by **RepoLens**.\n`;


  return {
    projectName,
    markdown: documentation,
    source: "deterministic"
  };

}


module.exports = {
  generateDocumentation
};