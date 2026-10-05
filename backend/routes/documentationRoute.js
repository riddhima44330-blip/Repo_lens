const express = require("express");

const {
  getRepository
} = require("../repositoryStore");

const {
  generateDocumentation
} = require("../analyzer/documentationGenerator");


const router =
  express.Router();


// ==========================================
// DOCUMENTATION GENERATOR
// ==========================================

router.post(
  "/documentation",
  async (req, res) => {

    try {

      console.log(
        "========== DOCUMENTATION REQUEST =========="
      );


      // ======================================
      // GET REPOSITORY ID
      // ======================================

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


      console.log(
        "Repository context found"
      );


      // ======================================
      // GENERATE DOCUMENTATION
      // ======================================

      const documentation =
        generateDocumentation(
          context
        );


      console.log(
        "Documentation generated"
      );


      console.log(
        "Documentation length:",
        documentation.markdown.length
      );


      // ======================================
      // RETURN RESULT
      // ======================================

      return res.json({

        projectName:
          documentation.projectName,

        markdown:
          documentation.markdown,

        source:
          documentation.source

      });

    }


    catch (error) {

      console.error(
        "DOCUMENTATION ERROR:",
        error
      );


      return res.status(500).json({

        error:
          "Could not generate documentation",

        details:
          error.message

      });

    }

  }
);


module.exports = router;