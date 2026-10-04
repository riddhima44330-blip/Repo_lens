const path = require("path");

// ==========================================
// SUPPORTED SOURCE EXTENSIONS
// ==========================================

const supportedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".cs",
  ".go",
  ".rs"
];


// ==========================================
// NORMALIZE PATH
// ==========================================

function normalizePath(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .toLowerCase();
}


// ==========================================
// GET FILE NAME
// ==========================================

function getFileName(filePath) {
  return path
    .basename(filePath)
    .toLowerCase();
}


// ==========================================
// GET DISPLAY FILE NAME
// ==========================================

function getNodeLabel(filePath) {
  const normalized =
    filePath.replace(/\\/g, "/");

  return path.basename(normalized);
}


// ==========================================
// RESOLVE LOCAL IMPORT
// ==========================================

function resolveImport(
  importPath,
  sourceFile,
  sourceFiles
) {
  if (
    !importPath ||
    !importPath.startsWith(".")
  ) {
    return null;
  }

  const sourceDirectory =
    path.dirname(sourceFile);

  const resolvedPath =
    path.normalize(
      path.join(
        sourceDirectory,
        importPath
      )
    );

  const normalizedResolved =
    normalizePath(resolvedPath);


  // ========================================
  // EXACT FILE MATCH
  // ========================================

  const exactMatch =
    sourceFiles.find(
      (file) =>
        normalizePath(file.path) ===
        normalizedResolved
    );

  if (exactMatch) {
    return exactMatch.path;
  }


  // ========================================
  // TRY FILE EXTENSIONS
  // ========================================

  for (
    const extension of supportedExtensions
  ) {
    const candidate =
      normalizedResolved +
      extension;

    const match =
      sourceFiles.find(
        (file) =>
          normalizePath(file.path) ===
          candidate
      );

    if (match) {
      return match.path;
    }
  }


  // ========================================
  // TRY INDEX FILES
  // ========================================

  for (
    const extension of supportedExtensions
  ) {
    const candidate =
      normalizedResolved +
      "/index" +
      extension;

    const match =
      sourceFiles.find(
        (file) =>
          normalizePath(file.path) ===
          candidate
      );

    if (match) {
      return match.path;
    }
  }


  return null;
}


// ==========================================
// EXTRACT IMPORTS
// ==========================================

function extractImports(content) {
  const imports = [];

  let match;


  // ========================================
  // ES MODULE IMPORT
  // ========================================

  const importRegex =
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

  while (
    (match =
      importRegex.exec(content))
  ) {
    imports.push(match[1]);
  }


  // ========================================
  // REQUIRE
  // ========================================

  const requireRegex =
    /require\s*\(\s*["']([^"']+)["']\s*\)/g;

  while (
    (match =
      requireRegex.exec(content))
  ) {
    imports.push(match[1]);
  }


  // ========================================
  // DYNAMIC IMPORT
  // ========================================

  const dynamicImportRegex =
    /import\s*\(\s*["']([^"']+)["']\s*\)/g;

  while (
    (match =
      dynamicImportRegex.exec(content))
  ) {
    imports.push(match[1]);
  }


  return [
    ...new Set(imports)
  ];
}


// ==========================================
// DETERMINE FILE TYPE
// ==========================================

function getNodeType(filePath) {
  const name =
    getFileName(filePath);


  // ========================================
  // FRONTEND ENTRY FILES
  // ========================================

  if (
    name === "app.jsx" ||
    name === "app.tsx" ||
    name === "main.jsx" ||
    name === "main.tsx"
  ) {
    return "frontend";
  }


  // ========================================
  // BACKEND ENTRY FILES
  // ========================================

  if (
    name === "server.js" ||
    name === "server.ts" ||
    name === "main.js"
  ) {
    return "backend";
  }


  // ========================================
  // ROUTES / CONTROLLERS
  // ========================================

  if (
    name.includes("route") ||
    name.includes("controller")
  ) {
    return "route";
  }


  // ========================================
  // ANALYZERS / SERVICES
  // ========================================

  if (
    name.includes("analyzer") ||
    name.includes("service") ||
    name.includes("util")
  ) {
    return "logic";
  }


  // ========================================
  // TEST FILES
  // ========================================

  if (
    name.includes("test") ||
    name.includes("spec")
  ) {
    return "test";
  }


  return "module";
}


// ==========================================
// DETERMINE ARCHITECTURE CATEGORY
// ==========================================

function getArchitectureCategory(
  filePath
) {
  const normalized =
    filePath
      .replace(/\\/g, "/")
      .toLowerCase();

  const fileName =
    path.basename(normalized);


  // ========================================
  // FRONTEND
  // ========================================

  if (
    normalized.includes("/src/") &&
    (
      fileName.endsWith(".jsx") ||
      fileName.endsWith(".tsx")
    )
  ) {
    return "frontend";
  }

  if (
    normalized.includes("/frontend/") ||
    normalized.includes("frontend/") ||
    normalized.includes("/components/") ||
    normalized.includes("components/") ||
    normalized.includes("/pages/") ||
    normalized.includes("pages/") ||
    normalized.includes("/views/") ||
    normalized.includes("views/")
  ) {
    return "frontend";
  }


  // ========================================
  // API / ROUTES
  // ========================================

  if (
    normalized.includes("/routes/") ||
    normalized.includes("routes/") ||
    normalized.includes("/route") ||
    normalized.includes("route.") ||
    normalized.includes("/api/") ||
    normalized.includes("api/") ||
    normalized.includes("controller")
  ) {
    return "api";
  }


  // ========================================
  // BACKEND
  // ========================================

  if (
    fileName === "server.js" ||
    fileName === "server.ts" ||
    normalized.includes("/backend/") ||
    normalized.includes("backend/") ||
    normalized.includes("/server/")
  ) {
    return "backend";
  }


  // ========================================
  // AI
  // ========================================

  if (
    normalized.includes("/ai/") ||
    normalized.includes("ai/") ||
    fileName.includes("ai")
  ) {
    return "ai";
  }


  // ========================================
  // DATA / STORAGE
  // ========================================

  if (
    normalized.includes("/database/") ||
    normalized.includes("database/") ||
    normalized.includes("/db/") ||
    normalized.includes("db/") ||
    normalized.includes("/models/") ||
    normalized.includes("models/") ||
    normalized.includes("/store/") ||
    normalized.includes("store/") ||
    fileName.includes("repository")
  ) {
    return "data";
  }


  // ========================================
  // LOGIC / SERVICES
  // ========================================

  if (
    normalized.includes("/analyzer/") ||
    normalized.includes("analyzer/") ||
    normalized.includes("/services/") ||
    normalized.includes("services/") ||
    normalized.includes("/utils/") ||
    normalized.includes("utils/") ||
    normalized.includes("/utility/") ||
    normalized.includes("utility/") ||
    normalized.includes("/lib/")
  ) {
    return "logic";
  }


  // ========================================
  // TESTS
  // ========================================

  if (
    fileName.includes("test") ||
    fileName.includes("spec") ||
    normalized.includes("/__tests__/") ||
    normalized.includes("__tests__/")
  ) {
    return "test";
  }


  // ========================================
  // CONFIGURATION
  // ========================================

  if (
    fileName === "package.json" ||
    fileName === "vite.config.js" ||
    fileName === "vite.config.ts" ||
    fileName === "tsconfig.json" ||
    fileName.includes("config")
  ) {
    return "config";
  }


  // ========================================
  // OTHER
  // ========================================

  return "other";
}


// ==========================================
// NODE ICON
// ==========================================

function getNodeIcon(type) {
  switch (type) {

    case "frontend":
      return "🖥️";

    case "backend":
      return "⚙️";

    case "route":
      return "🔌";

    case "logic":
      return "🧠";

    case "test":
      return "🧪";

    default:
      return "📄";
  }
}


// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {
  switch (category) {

    case "frontend":
      return "🖥️";

    case "backend":
      return "⚙️";

    case "api":
      return "🔌";

    case "logic":
      return "🧠";

    case "ai":
      return "🤖";

    case "data":
      return "💾";

    case "test":
      return "🧪";

    case "config":
      return "⚙️";

    default:
      return "📄";
  }
}


// ==========================================
// BUILD ARCHITECTURE GRAPH
// ==========================================

function buildArchitectureGraph(
  sourceFiles
) {
  if (
    !Array.isArray(sourceFiles) ||
    sourceFiles.length === 0
  ) {
    return {
      nodes: [],
      edges: []
    };
  }


  const nodes = [];

  const edges = [];

  const nodeMap = new Map();


  // ========================================
  // CREATE NODES
  // ========================================

  sourceFiles.forEach(
    (file, index) => {

      if (
        !file ||
        !file.path
      ) {
        return;
      }


      const type =
        getNodeType(
          file.path
        );


      const category =
        getArchitectureCategory(
          file.path
        );


      const node = {

        id:
          `file-${index}`,

        filePath:
          file.path,

        type,

        category,

        label:
          getNodeLabel(
            file.path
          ),

        icon:
          getCategoryIcon(
            category
          ),

        subtitle:
          file.path

      };


      nodes.push(node);


      nodeMap.set(
        normalizePath(
          file.path
        ),
        node.id
      );

    }
  );


  // ========================================
  // CREATE EDGES
  // ========================================

  sourceFiles.forEach(
    (file) => {

      if (
        !file ||
        !file.path ||
        typeof file.content !==
          "string"
      ) {
        return;
      }


      const imports =
        extractImports(
          file.content
        );


      const sourceNodeId =
        nodeMap.get(
          normalizePath(
            file.path
          )
        );


      if (!sourceNodeId) {
        return;
      }


      imports.forEach(
        (importPath) => {

          const targetPath =
            resolveImport(
              importPath,
              file.path,
              sourceFiles
            );


          if (!targetPath) {
            return;
          }


          const targetNodeId =
            nodeMap.get(
              normalizePath(
                targetPath
              )
            );


          if (!targetNodeId) {
            return;
          }


          // ==================================
          // PREVENT DUPLICATE EDGES
          // ==================================

          const edgeExists =
            edges.some(
              (edge) =>
                edge.source ===
                  sourceNodeId &&
                edge.target ===
                  targetNodeId
            );


          if (edgeExists) {
            return;
          }


          edges.push({

            id:
              `edge-${edges.length}`,

            source:
              sourceNodeId,

            target:
              targetNodeId,

            label:
              "imports"

          });

        }
      );

    }
  );


  // ========================================
  // RETURN GRAPH
  // ========================================

  return {
    nodes,
    edges
  };
}


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

  buildArchitectureGraph,

  extractImports,

  getArchitectureCategory,

  getNodeType

};