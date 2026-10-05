const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  analyzeDependencies
} = require("../analyzer/dependencyAnalyzer");

const router = express.Router();

router.post(
  "/dependencies",
  async (req, res) => {
    try {
      console.log(
        "========== DEPENDENCY INTELLIGENCE REQUEST =========="
      );

      const {
        repositoryId
      } = req.body;

      if (!repositoryId) {
        return res.status(400).json({
          error:
            "Repository ID is required"
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

      const result =
        analyzeDependencies(
          context
        );

      console.log(
        "Dependency score:",
        result.score
      );

      console.log(
        "Missing dependencies:",
        result.missing.length
      );

      console.log(
        "Potentially unused:",
        result.potentiallyUnused.length
      );

      return res.json({
        ...result,
        source: "deterministic"
      });

    } catch (error) {
      console.error(
        "DEPENDENCY INTELLIGENCE ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Could not analyze dependencies",

        details:
          error.message
      });
    }
  }
);

module.exports = router;