const path = require("path");


// ==========================================
// FILE IMPORT HELPERS
// ==========================================

function normalizePath(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .toLowerCase();
}


function getFileName(filePath) {
  return path
    .basename(filePath)
    .toLowerCase();
}


// ==========================================
// DETECT FILE ROLE
// ==========================================

function detectRole(filePath) {
  const normalized =
    normalizePath(filePath);

  const fileName =
    getFileName(filePath);


  // ========================================
  // FRONTEND ENTRY
  // ========================================

  if (
    fileName === "app.jsx" ||
    fileName === "app.tsx"
  ) {
    return {
      role: "Frontend Entry Point",
      description:
        "Main frontend application component."
    };
  }


  // ========================================
  // FRONTEND ENTRY
  // ========================================

  if (
    fileName === "main.jsx" ||
    fileName === "main.tsx"
  ) {
    return {
      role: "Frontend Bootstrap",
      description:
        "Initializes and mounts the frontend application."
    };
  }


  // ========================================
  // BACKEND SERVER
  // ========================================

  if (
    fileName === "server.js" ||
    fileName === "server.ts"
  ) {
    return {
      role: "Backend Entry Point",
      description:
        "Starts the backend server and connects the repository analysis system."
    };
  }


  // ========================================
  // ROUTES
  // ========================================

  if (
    normalized.includes("/routes/") ||
    fileName.includes("route")
  ) {
    return {
      role: "API Route",
      description:
        "Handles an API request and connects the frontend with backend logic."
    };
  }


  // ========================================
  // AI
  // ========================================

  if (
    normalized.includes("/ai/") ||
    fileName.includes("ai")
  ) {
    return {
      role: "AI Module",
      description:
        "Provides AI-powered analysis or explanation functionality."
    };
  }


  // ========================================
  // ANALYZERS
  // ========================================

  if (
    normalized.includes("/analyzer/") ||
    fileName.includes("analyzer")
  ) {
    return {
      role: "Analysis Module",
      description:
        "Analyzes repository files, structure, health, or source code."
    };
  }


  // ========================================
  // REPOSITORY STORE
  // ========================================

  if (
    fileName === "repositorystore.js" ||
    fileName === "repositorystore.ts"
  ) {
    return {
      role: "Repository Context Store",
      description:
        "Stores the analyzed repository context for later requests."
    };
  }


  // ========================================
  // COMPONENT
  // ========================================

  if (
    normalized.includes("/components/") ||
    fileName.includes("component")
  ) {
    return {
      role: "Frontend Component",
      description:
        "Reusable user-interface component."
    };
  }


  // ========================================
  // GENERIC JSX
  // ========================================

  if (
    fileName.endsWith(".jsx") ||
    fileName.endsWith(".tsx")
  ) {
    return {
      role: "Frontend Module",
      description:
        "Frontend module responsible for part of the user interface."
    };
  }


  // ========================================
  // GENERIC BACKEND
  // ========================================

  if (
    normalized.includes("/backend/")
  ) {
    return {
      role: "Backend Module",
      description:
        "Backend module responsible for repository processing or application logic."
    };
  }


  // ========================================
  // DEFAULT
  // ========================================

  return {
    role: "Project Module",
    description:
      "Module containing part of the project's implementation."
  };
}


// ==========================================
// CALCULATE IMPORT COUNTS
// ==========================================

function calculateImportance(
  file,
  sourceFiles,
  graph
) {
  const normalizedPath =
    normalizePath(file.path);


  const node =
    graph?.nodes?.find(
      (item) =>
        normalizePath(
          item.filePath
        ) === normalizedPath
    );


  if (!node) {
    return 0;
  }


  const nodeId =
    node.id;


  // ========================================
  // OUTGOING DEPENDENCIES
  // ========================================

  const outgoing =
    (graph.edges || []).filter(
      (edge) =>
        edge.source === nodeId
    ).length;


  // ========================================
  // INCOMING DEPENDENCIES
  // ========================================

  const incoming =
    (graph.edges || []).filter(
      (edge) =>
        edge.target === nodeId
    ).length;


  // ========================================
  // ROLE IMPORTANCE
  // ========================================

  const role =
    detectRole(file.path).role;


  let roleScore = 0;


  if (
    role === "Frontend Entry Point"
  ) {
    roleScore += 40;
  }


  if (
    role === "Backend Entry Point"
  ) {
    roleScore += 40;
  }


  if (
    role === "API Route"
  ) {
    roleScore += 25;
  }


  if (
    role === "AI Module"
  ) {
    roleScore += 20;
  }


  if (
    role === "Analysis Module"
  ) {
    roleScore += 20;
  }


  if (
    role === "Repository Context Store"
  ) {
    roleScore += 20;
  }


  // ========================================
  // DEPENDENCY SCORE
  // ========================================

  const dependencyScore =
    incoming * 10 +
    outgoing * 5;


  return (
    roleScore +
    dependencyScore
  );
}


// ==========================================
// BUILD TOUR
// ==========================================

function buildCodeTour(
  sourceFiles,
  graph
) {
  if (
    !Array.isArray(sourceFiles) ||
    sourceFiles.length === 0
  ) {
    return {
      title: "Developer Code Tour",
      description:
        "No source files were found.",
      steps: []
    };
  }


  const scoredFiles =
    sourceFiles
      .filter(
        (file) =>
          file &&
          file.path
      )
      .map(
        (file) => {

          const role =
            detectRole(
              file.path
            );

          const importance =
            calculateImportance(
              file,
              sourceFiles,
              graph
            );

          return {
            path: file.path,
            role: role.role,
            description:
              role.description,
            importance
          };
        }
      );


  // ========================================
  // REMOVE VERY LOW VALUE FILES
  // ========================================

  const meaningfulFiles =
    scoredFiles.filter(
      (file) =>
        file.importance > 0
    );


  // ========================================
  // SORT BY IMPORTANCE
  // ========================================

  meaningfulFiles.sort(
    (a, b) =>
      b.importance -
      a.importance
  );


  // ========================================
  // CREATE TOUR STEPS
  // ========================================

  const steps =
    meaningfulFiles
      .slice(0, 8)
      .map(
        (file, index) => ({
          step:
            index + 1,

          path:
            file.path,

          role:
            file.role,

          description:
            file.description,

          importance:
            file.importance
        })
      );


  return {
    title:
      "Developer Code Tour",

    description:
      "A recommended reading order for understanding this repository.",

    steps
  };
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  buildCodeTour,
  detectRole
};