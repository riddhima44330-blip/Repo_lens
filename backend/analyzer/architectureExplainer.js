const path = require("path");

// ==========================================
// ARCHITECTURE EXPLAINER
// ==========================================

function architectureExplainer(
  context,
  sourceFiles
) {
  const projectName =
    context.project?.name || "Unknown Project";

  const languages =
    context.technology?.languages || [];

  const frameworks =
    context.technology?.frameworks || [];

  const tools =
    context.technology?.tools || [];

  const files =
    sourceFiles || [];

  const filePaths =
    files.map((file) =>
      file.path.replace(/\\/g, "/")
    );

  // ==========================================
  // IMPORTANT FILE DETECTION
  // ==========================================

  const findFile = (name) => {
    return filePaths.find(
      (file) =>
        path.basename(file).toLowerCase() ===
        name.toLowerCase()
    );
  };

  const scanner =
    findFile("scanner.js");

  const server =
    findFile("server.js");

  const askRoute =
    findFile("askRoute.js");

  const architectureRoute =
    findFile("architectureRoute.js");

  const repositoryStore =
    findFile("repositoryStore.js");

  const sourceAnalyzer =
    findFile("sourceAnalyzer.js");

  const projectAnalyzer =
    findFile("projectAnalyzer.js");

  const healthAnalyzer =
    findFile("healthAnalyzer.js");

  const readmeAnalyzer =
    findFile("readmeAnalyzer.js");

  const contextGenerator =
    findFile("contextGenerator.js");

  const relevantFileFinder =
    findFile("relevantFileFinder.js");

  const codebaseAI =
    findFile("codebaseAI.js");

  const architectureAI =
    findFile("architectureAI.js");

  const app =
    findFile("App.jsx");

  const fileTree =
    findFile("FileTree.jsx");

  // ==========================================
  // COMPONENTS
  // ==========================================

  const components = [];

  if (app) {
    components.push(
      `• Frontend UI — ${app}`
    );
  }

  if (fileTree) {
    components.push(
      `• Project Structure Viewer — ${fileTree}`
    );
  }

  if (server) {
    components.push(
      `• Backend Server — ${server}`
    );
  }

  if (scanner) {
    components.push(
      `• Repository Scanner — ${scanner}`
    );
  }

  if (
    projectAnalyzer ||
    healthAnalyzer ||
    readmeAnalyzer ||
    sourceAnalyzer
  ) {
    components.push(
      "• Repository Analysis Layer"
    );
  }

  if (contextGenerator) {
    components.push(
      `• Context Generator — ${contextGenerator}`
    );
  }

  if (repositoryStore) {
    components.push(
      `• Repository Context Store — ${repositoryStore}`
    );
  }

  if (relevantFileFinder) {
    components.push(
      `• Relevant File Finder — ${relevantFileFinder}`
    );
  }

  if (askRoute) {
    components.push(
      `• Ask RepoLens API — ${askRoute}`
    );
  }

  if (codebaseAI) {
    components.push(
      `• Codebase AI — ${codebaseAI}`
    );
  }

  if (architectureAI) {
    components.push(
      `• Architecture AI — ${architectureAI}`
    );
  }

  // ==========================================
  // DATA FLOW
  // ==========================================

  const scanFlow = [];

  if (app) {
    scanFlow.push(app);
  }

  if (server) {
    scanFlow.push("/api/scan");
    scanFlow.push(server);
  }

  if (scanner) {
    scanFlow.push(scanner);
  }

  if (projectAnalyzer) {
    scanFlow.push(projectAnalyzer);
  }

  if (healthAnalyzer) {
    scanFlow.push(healthAnalyzer);
  }

  if (readmeAnalyzer) {
    scanFlow.push(readmeAnalyzer);
  }

  if (sourceAnalyzer) {
    scanFlow.push(sourceAnalyzer);
  }

  if (contextGenerator) {
    scanFlow.push(contextGenerator);
  }

  if (repositoryStore) {
    scanFlow.push(repositoryStore);
  }

  const askFlow = [];

  if (app) {
    askFlow.push(app);
  }

  if (askRoute) {
    askFlow.push("/api/ask");
    askFlow.push(askRoute);
  }

  if (repositoryStore) {
    askFlow.push(repositoryStore);
  }

  if (relevantFileFinder) {
    askFlow.push(relevantFileFinder);
  }

  if (codebaseAI) {
    askFlow.push(codebaseAI);
  }

  // ==========================================
  // DEVELOPER STARTING POINTS
  // ==========================================

  const startingPoints = [];

  if (app) {
    startingPoints.push(
      `1. ${app} — Start here to understand the frontend and user interactions.`
    );
  }

  if (server) {
    startingPoints.push(
      `2. ${server} — Understand how the backend API is assembled.`
    );
  }

  if (scanner) {
    startingPoints.push(
      `3. ${scanner} — Understand how repositories are scanned.`
    );
  }

  if (contextGenerator) {
    startingPoints.push(
      `4. ${contextGenerator} — Understand how repository information is prepared for intelligence features.`
    );
  }

  if (askRoute) {
    startingPoints.push(
      `5. ${askRoute} — Understand how Ask RepoLens questions are processed.`
    );
  }

  // ==========================================
  // RESULT
  // ==========================================

  let answer = "";

  answer +=
    `## Architecture Overview\n\n`;

  answer +=
    `${projectName} is analyzed as a repository intelligence application. `;

  if (languages.length > 0) {
    answer +=
      `The detected languages are ${languages.join(", ")}. `;
  }

  if (frameworks.length > 0) {
    answer +=
      `The detected frameworks include ${frameworks.join(", ")}. `;
  }

  if (tools.length > 0) {
    answer +=
      `Detected tools include ${tools.join(", ")}.`;
  }

  answer += "\n\n";

  answer +=
    `## Major Components\n\n`;

  if (components.length > 0) {
    answer += components.join("\n");
  } else {
    answer +=
      "No major architecture components could be identified.";
  }

  answer += "\n\n";

  answer +=
    `## Data Flow\n\n`;

  if (scanFlow.length > 0) {
    answer +=
      `### Repository Analysis Flow\n\n`;

    answer +=
      scanFlow.join(" → ");
  }

  if (askFlow.length > 0) {
    answer +=
      `\n\n### Ask RepoLens Flow\n\n`;

    answer +=
      askFlow.join(" → ");
  }

  answer += "\n\n";

  answer +=
    `## Frontend\n\n`;

  if (app) {
    answer +=
      `${app} is the main frontend entry point. ` +
      `It allows the user to provide a repository path, ` +
      `start repository analysis, ask questions, and request architecture analysis.`;
  } else {
    answer +=
      "A main frontend entry point could not be identified.";
  }

  if (fileTree) {
    answer +=
      ` The project structure is displayed through ${fileTree}.`;
  }

  answer += "\n\n";

  answer +=
    `## Backend\n\n`;

  if (server) {
    answer +=
      `${server} is the main backend entry point. ` +
      `It exposes the repository scanning API and connects the analysis modules and routes.`;
  }

  if (askRoute) {
    answer +=
      ` ${askRoute} handles Ask RepoLens requests.`;
  }

  if (architectureRoute) {
    answer +=
      ` ${architectureRoute} handles architecture analysis requests.`;
  }

  answer += "\n\n";

  answer +=
    `## AI / Intelligence Layer\n\n`;

  if (
    relevantFileFinder ||
    codebaseAI ||
    architectureAI
  ) {
    answer +=
      "RepoLens contains a repository intelligence layer that identifies relevant source files and can pass them to AI services for analysis.";

    if (relevantFileFinder) {
      answer +=
        ` ${relevantFileFinder} performs relevant-file retrieval.`;
    }

    if (codebaseAI) {
      answer +=
        ` ${codebaseAI} provides AI-powered codebase question answering.`;
    }

    if (architectureAI) {
      answer +=
        ` ${architectureAI} provides AI-powered architecture explanations.`;
    }
  } else {
    answer +=
      "No dedicated AI intelligence files were detected.";
  }

  answer += "\n\n";

  answer +=
    `## Developer Starting Points\n\n`;

  if (startingPoints.length > 0) {
    answer +=
      startingPoints.join("\n");
  } else {
    answer +=
      "No recommended starting points could be identified.";
  }

  answer += "\n\n";

  answer +=
    `---\n\n`;

  answer +=
    `This architecture explanation was generated from the repository structure and detected source files without using an external AI API.`;

  return answer;
}

module.exports = {
  architectureExplainer
};