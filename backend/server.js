require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  scanDirectory
} = require("./analyzer/scanner");

const {
  analyzeProject
} = require("./analyzer/projectAnalyzer");

const {
  analyzeHealth
} = require("./analyzer/healthAnalyzer");

const {
  analyzeReadme
} = require("./analyzer/readmeAnalyzer");

const {
  generateContext
} = require("./analyzer/contextGenerator");

const {
  readSourceFiles
} = require("./analyzer/sourceAnalyzer");

const {
  createRepository
} = require("./repositoryStore");

const {
  downloadRepository
} = require("./repositoryDownloader");

const askRoute = require("./routes/askRoute");
const architectureRoute = require("./routes/architectureRoute");
const codeTourRoute = require("./routes/codeTourRoute");
const documentationRoute = require("./routes/documentationRoute");
const driftRoute = require("./routes/driftRoute");
const dependencyRoute = require("./routes/dependencyRoute");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(
  express.json({
    limit: "50mb"
  })
);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api", askRoute);
app.use("/api", architectureRoute);
app.use("/api", codeTourRoute);
app.use("/api", documentationRoute);
app.use("/api", driftRoute);
app.use("/api", dependencyRoute);

// ==========================================
// REPOSITORY SCAN
// ==========================================

app.get("/api/scan", async (req, res) => {
  let projectPath = null;

  try {
    console.log("=================================");
    console.log("REPOSITORY SCAN REQUEST");
    console.log("=================================");

    const repositoryUrl = req.query.url;

    if (!repositoryUrl) {
      return res.status(400).json({
        error: "GitHub repository URL is required"
      });
    }

    console.log(
      "Repository URL:",
      repositoryUrl
    );

    // ========================================
    // STEP 1 — DOWNLOAD REPOSITORY
    // ========================================

    console.log(
      "STEP 1: Downloading repository..."
    );

    projectPath =
      await downloadRepository(
        repositoryUrl
      );

    console.log(
      "Repository downloaded to:",
      projectPath
    );

    // ========================================
    // STEP 2 — SCAN
    // ========================================

    console.log(
      "STEP 2: Scanning repository..."
    );

    const scanResult =
      scanDirectory(
        projectPath
      );

    console.log(
      "Files found:",
      scanResult.files.length
    );

    console.log(
      "Folders found:",
      scanResult.folders.length
    );

    // ========================================
    // STEP 3 — PROJECT ANALYSIS
    // ========================================

    console.log(
      "STEP 3: Analyzing project..."
    );

    const analysis =
      analyzeProject(
        projectPath,
        scanResult
      );

    console.log(
      "Project:",
      analysis.projectName
    );

    console.log(
      "Languages:",
      analysis.languages
    );

    console.log(
      "Frameworks:",
      analysis.frameworks
    );

    // ========================================
    // STEP 4 — HEALTH
    // ========================================

    console.log(
      "STEP 4: Checking repository health..."
    );

    const health =
      analyzeHealth(
        projectPath,
        scanResult,
        analysis
      );

    console.log(
      "Health score:",
      health.score
    );

    // ========================================
    // STEP 5 — README
    // ========================================

    console.log(
      "STEP 5: Checking README..."
    );

    const readme =
      analyzeReadme(
        projectPath,
        scanResult,
        analysis
      );

    console.log(
      "README score:",
      readme.score
    );

    // ========================================
    // STEP 6 — SOURCE FILES
    // ========================================

    console.log(
      "STEP 6: Reading source files..."
    );

    const sourceFiles =
      readSourceFiles(
        projectPath
      );

    console.log(
      "Source files loaded:",
      sourceFiles.length
    );

    // ========================================
    // STEP 7 — CONTEXT
    // ========================================

    console.log(
      "STEP 7: Generating repository context..."
    );

    const context =
      generateContext(
        scanResult,
        analysis,
        health,
        readme,
        sourceFiles
      );

    // IMPORTANT:
    // Store the actual downloaded filesystem
    // path so later analysis features such as
    // Documentation Drift can access README/files.

    context.projectPath =
      projectPath;

    console.log(
      "Context generated."
    );

    console.log(
      "Context source files:",
      context.sourceCode?.totalFiles
    );

    console.log(
      "Repository filesystem path:",
      context.projectPath
    );

    // ========================================
    // STEP 8 — STORE REPOSITORY
    // ========================================

    console.log(
      "STEP 8: Storing repository context..."
    );

    const repositoryId =
      createRepository(
        context
      );

    console.log(
      "Repository ID:",
      repositoryId
    );

    console.log(
      "Repository analysis completed."
    );

    console.log(
      "================================="
    );

    return res.json({
      repositoryId,
      repositoryUrl,
      scan: scanResult,
      analysis,
      health,
      readme,
      context
    });

  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "SCAN ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    return res.status(500).json({
      error:
        "Could not analyze repository",
      details:
        error.message
    });
  }
});

// ==========================================
// UNKNOWN API ROUTES
// ==========================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    error:
      "API endpoint not found"
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    "================================="
  );

  console.log(
    `RepoLens backend running on port ${PORT}`
  );

  console.log(
    "Repository scan: GET /api/scan?url=<github-url>"
  );

  console.log(
    "Ask RepoLens: POST /api/ask"
  );

  console.log(
    "Source Code Intelligence: ENABLED"
  );

  console.log(
    "Backend Repository Context: ENABLED"
  );

  console.log(
    "GitHub Repository Scanning: ENABLED"
  );

  console.log(
    "================================="
  );
});