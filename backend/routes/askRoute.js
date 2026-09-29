const express = require("express");

const router = express.Router();

router.post("/ask", (req, res) => {
  try {
    console.log("========== ASK REQUEST ==========");
    console.log("Question:", req.body.question);
    console.log("Context received:", !!req.body.context);

    const { question, context } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    if (!context) {
      return res.status(400).json({
        error: "Repository context is required"
      });
    }

    const q = question.toLowerCase().trim();

    console.log("Normalized question:", q);

    let answer;

    // -----------------------------
    // FILE COUNT
    // -----------------------------
    if (
      q.includes("how many files") ||
      q.includes("number of files") ||
      q.includes("total files") ||
      q.includes("file count") ||
      q.includes("files does")
    ) {
      answer = `This project contains ${context.structure.totalFiles} files.`;
    }

    // -----------------------------
    // FOLDER COUNT
    // -----------------------------
    else if (
      q.includes("how many folders") ||
      q.includes("number of folders") ||
      q.includes("total folders") ||
      q.includes("folder count")
    ) {
      answer = `This project contains ${context.structure.totalFolders} folders.`;
    }

    // -----------------------------
    // LANGUAGES
    // -----------------------------
    else if (
      q.includes("what languages") ||
      q.includes("which languages") ||
      q.includes("programming languages") ||
      q.includes("languages used")
    ) {
      const languages = context.technology?.languages || [];

      if (languages.length === 0) {
        answer = "No programming languages were detected.";
      } else {
        answer = `This project uses ${languages.join(", ")}.`;
      }
    }

    // -----------------------------
    // FRAMEWORKS
    // -----------------------------
    else if (
      q.includes("what frameworks") ||
      q.includes("which frameworks") ||
      q.includes("frameworks used") ||
      q.includes("framework")
    ) {
      const frameworks = context.technology?.frameworks || [];

      if (frameworks.length === 0) {
        answer = "No frameworks were detected.";
      } else {
        answer = `The detected frameworks are ${frameworks.join(", ")}.`;
      }
    }

    // -----------------------------
    // TOOLS
    // -----------------------------
    else if (
      q.includes("what tools") ||
      q.includes("which tools") ||
      q.includes("tools used")
    ) {
      const tools = context.technology?.tools || [];

      if (tools.length === 0) {
        answer = "No development tools were detected.";
      } else {
        answer = `The detected tools are ${tools.join(", ")}.`;
      }
    }

    // -----------------------------
    // DEPENDENCIES
    // -----------------------------
    else if (
      q.includes("dependencies") ||
      q.includes("packages") ||
      q.includes("libraries")
    ) {
      const production =
        context.dependencies?.production || [];

      const development =
        context.dependencies?.development || [];

      answer =
        `This project has ${production.length} production dependencies ` +
        `and ${development.length} development dependencies.`;
    }

    // -----------------------------
    // HEALTH
    // -----------------------------
    else if (
      q.includes("health") ||
      q.includes("health score") ||
      q.includes("repository quality") ||
      q.includes("quality score")
    ) {
      answer =
        `The repository health score is ${context.health.score}/100. ` +
        `${context.health.passedChecks} checks passed and ` +
        `${context.health.failedChecks} checks need attention.`;
    }

    // -----------------------------
    // PROJECT NAME
    // -----------------------------
    else if (
      q.includes("project name") ||
      q.includes("name of the project") ||
      q.includes("what is this project")
    ) {
      answer =
        `The project is called ${context.project.name}.`;
    }

    // -----------------------------
    // README
    // -----------------------------
    else if (
      q.includes("readme") ||
      q.includes("documentation")
    ) {
      answer =
        `The README consistency score is ${context.documentation.score}/100. ` +
        `The README ${
          context.documentation.readmeExists
            ? "exists"
            : "does not exist"
        }.`;
    }

    // -----------------------------
    // PROJECT OVERVIEW
    // -----------------------------
    else if (
      q.includes("overview") ||
      q.includes("summarize") ||
      q.includes("summary")
    ) {
      answer =
        `${context.project.name} contains ` +
        `${context.structure.totalFiles} files and ` +
        `${context.structure.totalFolders} folders. ` +
        `It uses ${
          context.technology.languages.join(", ") ||
          "no detected programming languages"
        }. ` +
        `The repository health score is ` +
        `${context.health.score}/100.`;
    }

    // -----------------------------
    // DEFAULT
    // -----------------------------
    else {
      answer =
        "I can currently answer questions about files, folders, " +
        "languages, frameworks, tools, dependencies, repository " +
        "health, README documentation, and the project name.";
    }

    console.log("Answer:", answer);
    console.log("================================");

    return res.json({
      answer: answer
    });

  } catch (error) {
    console.error("ASK ROUTE ERROR:", error);

    return res.status(500).json({
      error: "Could not process question",
      details: error.message
    });
  }
});

module.exports = router;