const path = require("path");

function explainCodeFile(file) {
  const filePath = file.path.toLowerCase();
  const content = file.content || "";

  // ==========================================
  // SCANNER
  // ==========================================

  if (
    filePath.includes("scanner.js") ||
    filePath.includes("scanner.ts")
  ) {
    return (
      `The file ${file.path} contains the repository scanning logic. ` +
      `It recursively walks through the project directory and examines ` +
      `files and folders. It ignores directories such as node_modules, ` +
      `.git, dist, build, and coverage so unnecessary generated or dependency ` +
      `files are not included. For each file, it records the relative path ` +
      `and tracks its file extension. The scanner returns the collected ` +
      `files, folders, and extension statistics to the rest of RepoLens.`
    );
  }

  // ==========================================
  // ASK ROUTE
  // ==========================================

  if (
    filePath.includes("askroute.js") ||
    filePath.includes("askroute.ts")
  ) {
    return (
      `The file ${file.path} handles questions sent to the Ask RepoLens API. ` +
      `It receives a question and repository context through a POST request, ` +
      `validates the request, searches the repository context, and generates ` +
      `an answer. It also uses the relevant-file finder to identify source ` +
      `files related to questions about the codebase.`
    );
  }

  // ==========================================
  // SERVER
  // ==========================================

  if (
    path.basename(filePath) === "server.js" ||
    path.basename(filePath) === "server.ts"
  ) {
    return (
      `The file ${file.path} is the main backend entry point. ` +
      `It creates the Express server, enables CORS and JSON request handling, ` +
      `registers the Ask RepoLens API route, and exposes the repository scanning ` +
      `endpoint at /api/scan. The scan endpoint connects the scanner, project ` +
      `analyzer, health analyzer, README analyzer, source analyzer, and context ` +
      `generator into one repository-analysis pipeline.`
    );
  }

  // ==========================================
  // FRONTEND APP
  // ==========================================

  if (
    filePath.endsWith("src\\app.jsx") ||
    filePath.endsWith("src/app.jsx") ||
    filePath.endsWith("src\\app.js") ||
    filePath.endsWith("src/app.js")
  ) {
    return (
      `The file ${file.path} is the main React frontend component. ` +
      `It manages the repository path, analysis results, user questions, ` +
      `and RepoLens answers using React state. It communicates with the backend ` +
      `through /api/scan to analyze repositories and /api/ask to ask questions. ` +
      `It also renders the dashboard containing repository statistics, health, ` +
      `README consistency, dependencies, and the project file tree.`
    );
  }

  // ==========================================
  // FILE TREE
  // ==========================================

  if (
    filePath.includes("filetree.jsx") ||
    filePath.includes("filetree.js")
  ) {
    return (
      `The file ${file.path} implements the interactive project file tree. ` +
      `It converts the flat list of repository files and folders into a nested ` +
      `tree structure and renders folders and files recursively. Folders can be ` +
      `expanded or collapsed so users can explore the repository structure.`
    );
  }

  // ==========================================
  // CONTEXT GENERATOR
  // ==========================================

  if (
    filePath.includes("contextgenerator")
  ) {
    return (
      `The file ${file.path} creates the structured context used by RepoLens. ` +
      `It combines project information, technologies, dependencies, repository ` +
      `structure, health results, README information, and source-code information ` +
      `into one context object. This context can then be used by the question-answering layer.`
    );
  }

  // ==========================================
  // PROJECT ANALYZER
  // ==========================================

  if (
    filePath.includes("projectanalyzer")
  ) {
    return (
      `The file ${file.path} analyzes the technologies and configuration of the ` +
      `repository. It detects programming languages, frameworks, tools, dependencies, ` +
      `development dependencies, scripts, and package managers from the project files.`
    );
  }

  // ==========================================
  // HEALTH ANALYZER
  // ==========================================

  if (
    filePath.includes("healthanalyzer")
  ) {
    return (
      `The file ${file.path} evaluates the quality of the repository using a set of ` +
      `checks such as README availability, .gitignore, package configuration, lock files, ` +
      `tests, and project scripts. It combines these checks into an overall repository health score.`
    );
  }

  // ==========================================
  // README ANALYZER
  // ==========================================

  if (
    filePath.includes("readmeanalyzer")
  ) {
    return (
      `The file ${file.path} analyzes the repository README and compares technologies ` +
      `mentioned in the documentation with technologies detected in the actual repository. ` +
      `It produces a README consistency score and identifies potential documentation mismatches.`
    );
  }

  // ==========================================
  // SOURCE ANALYZER
  // ==========================================

  if (
    filePath.includes("sourceanalyzer")
  ) {
    return (
      `The file ${file.path} reads source-code files from the repository. ` +
      `It recursively searches through the project, ignores dependency and build directories, ` +
      `filters files by supported extensions, skips very large files, and stores the file path, ` +
      `extension, size, and source-code content for later analysis.`
    );
  }

  // ==========================================
  // GENERIC JAVASCRIPT EXPLANATION
  // ==========================================

  if (
    filePath.endsWith(".js") ||
    filePath.endsWith(".jsx") ||
    filePath.endsWith(".ts") ||
    filePath.endsWith(".tsx")
  ) {
    const functions =
      content.match(
        /(?:function\s+|const\s+)([A-Za-z_$][\w$]*)\s*(?:=|\()/g
      ) || [];

    const imports =
      content.match(
        /(?:require\(["']([^"']+)["']\)|from\s+["']([^"']+)["'])/g
      ) || [];

    let explanation =
      `The file ${file.path} is a ${path.extname(file.path)} source file. `;

    if (imports.length > 0) {
      explanation +=
        `It contains ${imports.length} detected import or dependency reference(s). `;
    }

    if (functions.length > 0) {
      explanation +=
        `It contains several functions or function-like declarations that contribute to its implementation. `;
    }

    explanation +=
      `RepoLens can use this file as source context when answering questions about the codebase.`;

    return explanation;
  }

  // ==========================================
  // GENERIC FALLBACK
  // ==========================================

  return (
    `The file ${file.path} is part of the repository. ` +
    `RepoLens identified it as relevant to the question, but a detailed ` +
    `file-specific explanation has not been generated yet.`
  );
}

module.exports = {
  explainCodeFile
};