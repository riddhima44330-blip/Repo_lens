const express = require("express");
const cors = require("cors");

const { scanDirectory } = require("./analyzer/scanner");
const { analyzeProject } = require("./analyzer/projectAnalyzer");
const { analyzeHealth } = require("./analyzer/healthAnalyzer");
const { analyzeReadme } = require("./analyzer/readmeAnalyzer");
const { generateContext } = require("./analyzer/contextGenerator");

const askRoute = require("./routes/askRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Register Ask RepoLens route
app.use("/api", askRoute);

// Backend status
app.get("/", (req, res) => {
  res.json({
    message: "RepoLens backend is running 🚀"
  });
});

// Repository scanner
app.get("/api/scan", (req, res) => {
  try {
    const projectPath = req.query.path;

    if (!projectPath) {
      return res.status(400).json({
        error: "Project path is required"
      });
    }

    const scanResult = scanDirectory(projectPath);

    const analysis = analyzeProject(
      projectPath,
      scanResult
    );

    const health = analyzeHealth(
      projectPath,
      scanResult,
      analysis
    );

    const readme = analyzeReadme(
      projectPath,
      scanResult,
      analysis
    );

    const context = generateContext(
      scanResult,
      analysis,
      health,
      readme
    );

    return res.json({
      scan: scanResult,
      analysis,
      health,
      readme,
      context
    });

  } catch (error) {
    console.error("SCAN ERROR:", error);

    return res.status(500).json({
      error: "Could not scan repository",
      details: error.message
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `RepoLens backend running on http://localhost:${PORT}`
  );

  console.log("Repository scan: GET /api/scan");
  console.log("Ask RepoLens: POST /api/ask");
});