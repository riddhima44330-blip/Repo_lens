const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  analyzeDocumentationDrift
} = require("../analyzer/driftAnalyzer");

const router = express.Router();

// ==========================================
// DOCUMENTATION DRIFT
// ==========================================

router.post(
  "/documentation-drift",
  async (req, res) => {

    try {

      console.log(
        "========== DOCUMENTATION DRIFT REQUEST =========="
      );

      const {
        repositoryId
      } = req.body;

      // ========================================
      // VALIDATE REPOSITORY ID
      // ========================================

      if (!repositoryId) {
        return res.status(400).json({
          error:
            "Repository ID is required"
        });
      }

      // ========================================
      // GET STORED CONTEXT
      // ========================================

      const context =
        getRepository(
          repositoryId
        );

      if (!context) {
        return res.status(404).json({
          error:
            "Repository context not found. Please scan the repository again."
        });
      }

      // ========================================
      // GET ACTUAL DOWNLOADED PATH
      // ========================================

      const projectPath =
        context.projectPath;

      if (!projectPath) {

        return res.status(500).json({
          error:
            "Repository filesystem path is not available. Please scan the repository again."
        });

      }

      console.log(
        "Repository filesystem path:",
        projectPath
      );

      // ========================================
      // SCAN DATA
      // ========================================

      const scan =
        context.scan || {};

      // ========================================
      // PROJECT ANALYSIS
      // ========================================

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

      // ========================================
      // DOCUMENTATION DATA
      // ========================================

      const documentation =
        context.documentation || {};

      console.log(
        "Drift analysis languages:",
        analysis.languages || []
      );

      // ========================================
      // RUN DRIFT ANALYSIS
      // ========================================

      const result =
        analyzeDocumentationDrift(
          projectPath,
          scan,
          analysis,
          documentation
        );

      // ========================================
      // LOG RESULT
      // ========================================

      console.log(
        "Documentation drift score:",
        result.score
      );

      console.log(
        "Documentation drift issues:",
        result.issues?.length || 0
      );

      console.log(
        "README path:",
        result.readmePath || "Not found"
      );

      // ========================================
      // RETURN RESULT
      // ========================================

      return res.json(
        result
      );

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