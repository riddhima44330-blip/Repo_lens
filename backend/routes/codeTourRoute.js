const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  buildArchitectureGraph
} = require("../analyzer/architectureGraphAnalyzer");

const {
  buildCodeTour
} = require("../analyzer/codeTourAnalyzer");


const router =
  express.Router();


// ==========================================
// CODE TOUR
// ==========================================

router.post(
  "/code-tour",
  async (req, res) => {

    try {

      console.log(
        "========== CODE TOUR REQUEST =========="
      );


      const {
        repositoryId
      } = req.body;


      // ======================================
      // VALIDATE REPOSITORY ID
      // ======================================

      if (!repositoryId) {

        return res.status(400).json({
          error:
            "Repository ID is required"
        });

      }


      // ======================================
      // GET REPOSITORY CONTEXT
      // ======================================

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


      const sourceFiles =
        context.sourceCode?.files ||
        [];


      console.log(
        "Source files:",
        sourceFiles.length
      );


      // ======================================
      // BUILD ARCHITECTURE GRAPH
      // ======================================

      const graph =
        buildArchitectureGraph(
          sourceFiles
        );


      // ======================================
      // BUILD CODE TOUR
      // ======================================

      const tour =
        buildCodeTour(
          sourceFiles,
          graph
        );


      console.log(
        "Code tour steps:",
        tour.steps.length
      );


      return res.json({
        ...tour,
        source:
          "deterministic"
      });

    }

    catch (error) {

      console.error(
        "CODE TOUR ERROR:",
        error
      );


      return res.status(500).json({

        error:
          "Could not generate developer code tour",

        details:
          error.message

      });

    }

  }
);


module.exports = router;