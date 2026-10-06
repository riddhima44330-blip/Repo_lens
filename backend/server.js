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


// ==========================================
// SERVER PORT
// ==========================================

const PORT = process.env.PORT || 5000;


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
// API ROUTES
// ==========================================

app.use("/api", askRoute);
app.use("/api", architectureRoute);
app.use("/api", codeTourRoute);
app.use("/api", documentationRoute);
app.use("/api", driftRoute);
app.use("/api", dependencyRoute);


// ==========================================
// ANALYZE GITHUB REPOSITORY
// ==========================================

app.get("/api/scan", async (req, res) => {
  let projectPath = null;

  try {
    console.log("=================================");
    console.log("REPOSITORY SCAN REQUEST");
    console.log("=================================");

    // ---------------------------------
    // Get GitHub repository URL
    // ---------------------------------

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


    // ---------------------------------
    // 1. Download repository
    // ---------------------------------

    console.log(
      "STEP 1: Downloading repository..."
    );

    projectPath =
      await downloadRepository(repositoryUrl);

    console.log(
      "Repository downloaded to:",
      projectPath
    );


    // ---------------------------------
    // 2. Scan repository
    // ---------------------------------

    console.log(
      "STEP 2: Scanning repository..."
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
    // 3. Analyze project
    // ---------------------------------

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


    // ---------------------------------
    // 4. Analyze repository health
    // ---------------------------------

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


    // ---------------------------------
    // 5. Analyze README
    // ---------------------------------

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


    // ---------------------------------
    // 6. Read source files
    // ---------------------------------

    console.log(
      "STEP 6: Reading source files..."
    );

    const sourceFiles =
      readSourceFiles(projectPath);

    console.log(
      "Source files loaded:",
      sourceFiles.length
    );


    // ---------------------------------
    // 7. Generate repository context
    // ---------------------------------

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

    console.log(
      "Context generated."
    );

    console.log(
      "Context source files:",
      context.sourceCode?.totalFiles
    );


    // ---------------------------------
    // 8. Store repository context
    // ---------------------------------

    console.log(
      "STEP 8: Storing repository context..."
    );

    const repositoryId =
      createRepository(context);

    console.log(
      "Repository ID:",
      repositoryId
    );


    // ---------------------------------
    // 9. Return analysis
    // ---------------------------------

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
      error: "Could not analyze repository",
      details: error.message
    });
  }
});


// ==========================================
// UNKNOWN API ROUTES
// ==========================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    error: "API endpoint not found"
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