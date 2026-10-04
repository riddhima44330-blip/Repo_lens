const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  findRelevantFiles
} = require("../analyzer/relevantFileFinder");

const {
  explainArchitecture
} = require("../ai/architectureAI");

const {
  architectureExplainer
} = require("../analyzer/architectureExplainer");

const {
  buildArchitectureGraph
} = require("../analyzer/architectureGraphAnalyzer");

const router = express.Router();

router.post(
  "/architecture",
  async (req, res) => {
    try {
      console.log(
        "========== ARCHITECTURE REQUEST =========="
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

      const sourceFiles =
        context.sourceCode?.files || [];

      console.log(
        "Source files available:",
        sourceFiles.length
      );

      // ==========================================
      // BUILD DYNAMIC ARCHITECTURE GRAPH
      // ==========================================

      const graph =
        buildArchitectureGraph(
          sourceFiles
        );

      console.log(
        "Architecture nodes:",
        graph.nodes.length
      );

      console.log(
        "Architecture edges:",
        graph.edges.length
      );

      // ==========================================
      // FIND RELEVANT FILES FOR AI
      // ==========================================

      const relevantFiles =
        findRelevantFiles(
          "repository architecture frontend backend API data flow AI analyzer",
          sourceFiles
        );

      const topFiles =
        relevantFiles.slice(0, 8);

      // ==========================================
      // TRY AI
      // ==========================================

      if (
        topFiles.length > 0
      ) {
        try {
          console.log(
            "Attempting AI architecture analysis..."
          );

          const answer =
            await explainArchitecture(
              context,
              topFiles
            );

          return res.json({
            answer,

            source: "ai",

            graph,

            relevantFiles:
              topFiles.map(
                (file) => ({
                  path: file.path,
                  score: file.score
                })
              )
          });

        } catch (aiError) {

          console.error(
            "AI ARCHITECTURE ERROR:",
            aiError.message
          );

          console.log(
            "Using deterministic architecture explanation."
          );
        }
      }

      // ==========================================
      // DETERMINISTIC FALLBACK
      // ==========================================

      const fallbackAnswer =
        architectureExplainer(
          context,
          sourceFiles
        );

      return res.json({
        answer:
          fallbackAnswer,

        source:
          "deterministic",

        graph,

        relevantFiles:
          topFiles.map(
            (file) => ({
              path: file.path,
              score: file.score
            })
          )
      });

    } catch (error) {

      console.error(
        "ARCHITECTURE ROUTE ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Could not generate architecture explanation",

        details:
          error.message
      });
    }
  }
);

module.exports = router;