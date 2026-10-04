const express = require("express");

const {
  findRelevantFiles
} = require("../analyzer/relevantFileFinder");

const {
  explainCodeFile
} = require("../analyzer/codeExplainer");

const {
  askCodebaseAI
} = require("../ai/codebaseAI");

const {
  getRepository
} = require("../repositoryStore");

const router = express.Router();

router.post("/ask", async (req, res) => {

  try {

    console.log("========== ASK REQUEST ==========");

    const {
      question,
      repositoryId
    } = req.body;

    console.log(
      "Question:",
      question
    );

    console.log(
      "Repository ID:",
      repositoryId
    );

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !question ||
      !question.trim()
    ) {

      return res.status(400).json({
        error: "Question is required"
      });

    }

    if (!repositoryId) {

      return res.status(400).json({
        error: "Repository ID is required"
      });

    }

    // ==========================================
    // GET REPOSITORY CONTEXT
    // ==========================================

    const context =
      getRepository(repositoryId);

    if (!context) {

      return res.status(404).json({
        error:
          "Repository context not found. Please scan the repository again."
      });

    }

    console.log(
      "Repository context retrieved"
    );

    // ==========================================
    // GET SOURCE FILES
    // ==========================================

    const sourceFiles =
      context.sourceCode?.files || [];

    console.log(
      "Source files available:",
      sourceFiles.length
    );

    // ==========================================
    // FIND RELEVANT FILES
    // ==========================================

    const relevantFiles =
      findRelevantFiles(
        question,
        sourceFiles
      );

    console.log(
      "Relevant files found:",
      relevantFiles.length
    );

    if (
      relevantFiles.length > 0
    ) {

      console.log(
        "Relevant files:",
        relevantFiles.map(
          (file) => file.path
        )
      );

    }

    // ==========================================
    // NO RELEVANT FILES
    // ==========================================

    if (
      relevantFiles.length === 0
    ) {

      return res.json({

        answer:
          "I couldn't find relevant source files for this question.",

        relevantFiles: []

      });

    }

    // ==========================================
    // SELECT TOP FILES
    // ==========================================

    const topRelevantFiles =
      relevantFiles.slice(0, 3);

    console.log(
      "Files sent to AI:",
      topRelevantFiles.map(
        (file) => file.path
      )
    );

    // ==========================================
    // ASK AI
    // ==========================================

    try {

      console.log(
        "Sending repository context to AI..."
      );

      const aiAnswer =
        await askCodebaseAI(
          question,
          topRelevantFiles,
          context
        );

      console.log(
        "AI response received"
      );

      return res.json({

        answer: aiAnswer,

        source: "ai",

        relevantFiles:
          relevantFiles.map(
            (file) => ({
              path: file.path,
              score: file.score
            })
          )

      });

    } catch (aiError) {

      console.error(
        "AI ERROR:",
        aiError
      );

      // ==========================================
      // DETERMINISTIC FALLBACK
      // ==========================================

      console.log(
        "Falling back to deterministic code explanation..."
      );

      const topFile =
        relevantFiles[0];

      const explanation =
        explainCodeFile(
          topFile
        );

      const additionalFiles =
        relevantFiles
          .slice(1, 3)
          .map(
            (file) => file.path
          );

      let fallbackAnswer =
        `${explanation}\n\n` +
        `Relevant file: ${topFile.path}`;

      if (
        additionalFiles.length > 0
      ) {

        fallbackAnswer +=
          `\n\nOther potentially related files:\n` +
          additionalFiles
            .map(
              (file) => `• ${file}`
            )
            .join("\n");

      }

      return res.json({

        answer: fallbackAnswer,

        source: "fallback",

        aiError:
          aiError.message,

        relevantFiles:
          relevantFiles.map(
            (file) => ({
              path: file.path,
              score: file.score
            })
          )

      });

    }

  } catch (error) {

    console.error(
      "ASK ROUTE ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Could not process question",

      details:
        error.message

    });

  }

});

module.exports = router;