const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  analyzeDocumentationDrift
} = require("../analyzer/driftAnalyzer");

const router = express.Router();

router.post(
  "/documentation-drift",
  async (req, res) => {
    try {
      console.log(
        "========== DOCUMENTATION DRIFT REQUEST =========="
      );

      const {
        repositoryId,
        projectPath
      } = req.body;

      if (!repositoryId) {
        return res.status(400).json({
          error: "Repository ID is required"
        });
      }

      if (!projectPath) {
        return res.status(400).json({
          error: "Repository path is required"
        });
      }

      const context =
        getRepository(repositoryId);

      if (!context) {
        return res.status(404).json({
          error:
            "Repository context not found. Please scan the repository again."
        });
      }

      console.log(
        "Repository:",
        projectPath
      );

      // ------------------------------------------
      // SAFELY GET REPOSITORY ANALYSIS
      // ------------------------------------------

      const scan =
        context.scan || {};

      const analysis =
        context.analysis ||
        context.projectAnalysis ||
        context.project ||
        {
          languages: [],
          frameworks: [],
          tools: [],
          dependencies: [],
          devDependencies: []
        };

      const documentation =
        context.documentation || {};

      console.log(
        "Drift analysis languages:",
        analysis.languages || []
      );

      const result =
        analyzeDocumentationDrift(
          projectPath,
          scan,
          analysis,
          documentation
        );

      console.log(
        "Documentation drift score:",
        result.score
      );

      console.log(
        "Documentation drift issues:",
        result.issues.length
      );

      return res.json(result);

    } catch (error) {
      console.error(
        "DOCUMENTATION DRIFT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Could not analyze documentation drift",

        details:
          error.message
      });
    }
  }
);

module.exports = router;