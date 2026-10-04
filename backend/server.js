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

const askRoute = require("./routes/askRoute");
const architectureRoute =
  require("./routes/architectureRoute");

const app = express();

const PORT = 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(
  express.json({
    limit: "50mb"
  })
);

// ==========================================
// ASK REPO LENS ROUTE
// ==========================================

app.use("/api", askRoute);
app.use("/api", architectureRoute);

// ==========================================
// ANALYZE REPOSITORY
// ==========================================

app.get("/api/scan", (req, res) => {
  try {
    console.log("=================================");
    console.log("REPOSITORY SCAN REQUEST");
    console.log("=================================");

    // ---------------------------------
    // Get repository path
    // ---------------------------------

    const projectPath = req.query.path;

    if (!projectPath) {
      return res.status(400).json({
        error: "Repository path is required"
      });
    }

    console.log(
      "Project path:",
      projectPath
    );

    // ---------------------------------
    // 1. Scan repository
    // ---------------------------------

    console.log(
      "STEP 1: Scanning repository..."
    );

    const scanResult =
      scanDirectory(projectPath);

    console.log(
      "Files found:",
      scanResult.files.length
    );

    console.log(
      "Folders found:",
      scanResult.folders.length
    );

    // ---------------------------------
    // 2. Analyze project
    // ---------------------------------

    console.log(
      "STEP 2: Analyzing project..."
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

    // ---------------------------------
    // 3. Analyze repository health
    // ---------------------------------

    console.log(
      "STEP 3: Checking repository health..."
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

    // ---------------------------------
    // 4. Analyze README
    // ---------------------------------

    console.log(
      "STEP 4: Checking README..."
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

    // ---------------------------------
    // 5. Read source files
    // ---------------------------------

    console.log(
      "STEP 5: Reading source files..."
    );

    const sourceFiles =
      readSourceFiles(
        projectPath
      );

    console.log(
      "Source files loaded:",
      sourceFiles.length
    );

    // ---------------------------------
    // 6. Generate repository context
    // ---------------------------------

    console.log(
      "STEP 6: Generating repository context..."
    );

    const context =
      generateContext(
        scanResult,
        analysis,
        health,
        readme,
        sourceFiles
      );

    console.log(
      "Context generated."
    );

    console.log(
      "Context source files:",
      context.sourceCode?.totalFiles
    );

    // ---------------------------------
    // 7. Store repository context
    // ---------------------------------

    console.log(
      "STEP 7: Storing repository context..."
    );

    const repositoryId =
      createRepository(context);

    console.log(
      "Repository ID:",
      repositoryId
    );

    // ---------------------------------
    // 8. Return repository information
    // ---------------------------------

    console.log(
      "Repository analysis completed."
    );

    console.log(
      "================================="
    );

    return res.json({

      repositoryId,

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
        "Failed to scan repository",

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
    `RepoLens backend running on http://localhost:${PORT}`
  );

  console.log(
    "Repository scan: GET /api/scan"
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
    "================================="
  );

});