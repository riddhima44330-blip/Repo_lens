const path = require("path");

// ==========================================
// STOP WORDS
// ==========================================

const stopWords = new Set([
  "the",
  "and",
  "for",
  "how",
  "does",
  "what",
  "where",
  "which",
  "when",
  "this",
  "that",
  "with",
  "from",
  "into",
  "about",
  "can",
  "you",
  "tell",
  "me",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "of",
  "to",
  "a",
  "an"
]);

// ==========================================
// QUESTION INTENTS
// ==========================================

const intentRules = [
  // ------------------------------------------
  // REPOSITORY SCANNING
  // ------------------------------------------
  {
    keywords: [
      "scan",
      "scanning",
      "scanner",
      "discover",
      "discovering",
      "repository scan",
      "files detected"
    ],

    paths: [
      "scanner"
    ]
  },

  // ------------------------------------------
  // REPOSITORY HEALTH
  // ------------------------------------------
  {
    keywords: [
      "health",
      "quality",
      "score",
      "checks",
      "repository health"
    ],

    paths: [
      "healthanalyzer"
    ]
  },

  // ------------------------------------------
  // README / DOCUMENTATION
  // ------------------------------------------
  {
    keywords: [
      "readme",
      "documentation",
      "document",
      "consistency"
    ],

    paths: [
      "readmeanalyzer",
      "readme"
    ]
  },

  // ------------------------------------------
  // PROJECT / TECHNOLOGY
  // ------------------------------------------
  {
    keywords: [
      "project",
      "framework",
      "language",
      "dependencies",
      "package",
      "technology"
    ],

    paths: [
      "projectanalyzer",
      "package.json"
    ]
  },

  // ------------------------------------------
  // FILE TREE / PROJECT STRUCTURE
  // ------------------------------------------
  {
    keywords: [
      "file tree",
      "tree",
      "folder tree",
      "repository structure",
      "project structure"
    ],

    paths: [
      "filetree",
      "scanner",
      "app.jsx"
    ]
  },

  // ------------------------------------------
  // FRONTEND
  // ------------------------------------------
  {
    keywords: [
      "frontend",
      "interface",
      "ui",
      "user interface",
      "react",
      "component"
    ],

    paths: [
      "app.jsx",
      "src",
      "filetree"
    ]
  },

  // ------------------------------------------
  // BACKEND / API
  // ------------------------------------------
  {
    keywords: [
      "backend",
      "api",
      "server",
      "endpoint",
      "route",
      "request"
    ],

    paths: [
      "server.js",
      "routes",
      "askroute"
    ]
  },

  // ------------------------------------------
  // ASK REPOLENS
  // ------------------------------------------
  {
    keywords: [
      "ask",
      "question",
      "chat",
      "answer",
      "ask repolens"
    ],

    paths: [
      "askroute",
      "codebaseai",
      "relevantfilefinder"
    ]
  },

  // ------------------------------------------
  // SOURCE CODE / CODE ANALYSIS
  // ------------------------------------------
  {
    keywords: [
      "source code",
      "source",
      "read files",
      "code analysis"
    ],

    paths: [
      "sourceanalyzer",
      "relevantfilefinder"
    ]
  },

  // ------------------------------------------
  // CONTEXT GENERATION
  // ------------------------------------------
  {
    keywords: [
      "context",
      "repository context",
      "context generation"
    ],

    paths: [
      "contextgenerator",
      "repositorystore"
    ]
  }
];

// ==========================================
// TOKENIZE QUESTION
// ==========================================

function tokenizeQuestion(question) {
  return question
    .toLowerCase()
    .replace(/[^\w\s.-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length > 2 &&
        !stopWords.has(word)
    );
}

// ==========================================
// GET QUESTION INTENTS
// ==========================================

function detectIntents(question) {
  const normalized =
    question.toLowerCase();

  const intents = [];

  for (const rule of intentRules) {
    const matched =
      rule.keywords.some(
        (keyword) =>
          normalized.includes(keyword)
      );

    if (matched) {
      intents.push(rule);
    }
  }

  return intents;
}

// ==========================================
// PATH MATCH SCORE
// ==========================================

function calculatePathScore(
  filePath,
  tokens
) {
  const normalizedPath =
    filePath.toLowerCase();

  let score = 0;

  for (const token of tokens) {
    if (
      normalizedPath.includes(token)
    ) {
      score += 8;
    }
  }

  return score;
}

// ==========================================
// CONTENT MATCH SCORE
// ==========================================

function calculateContentScore(
  content,
  tokens
) {
  const normalizedContent =
    content.toLowerCase();

  let score = 0;

  for (const token of tokens) {
    if (
      normalizedContent.includes(token)
    ) {
      score += 2;
    }
  }

  return score;
}

// ==========================================
// INTENT PATH SCORE
// ==========================================

function calculateIntentScore(
  filePath,
  intents
) {
  const normalizedPath =
    filePath.toLowerCase();

  let score = 0;

  for (const intent of intents) {
    for (const targetPath of intent.paths) {
      if (
        normalizedPath.includes(
          targetPath.toLowerCase()
        )
      ) {
        score += 15;
      }
    }
  }

  return score;
}

// ==========================================
// SPECIAL FILE SIGNALS
// ==========================================

function calculateFileTypeScore(
  filePath
) {
  const normalizedPath =
    filePath.toLowerCase();

  let score = 0;

  // Main backend entry point
  if (
    normalizedPath.endsWith(
      "server.js"
    )
  ) {
    score += 3;
  }

  // Main frontend entry point
  if (
    normalizedPath.endsWith(
      "app.jsx"
    )
  ) {
    score += 3;
  }

  // Analyzer files
  if (
    normalizedPath.includes(
      "analyzer"
    )
  ) {
    score += 2;
  }

  return score;
}

// ==========================================
// SPECIAL INTENT SCORE
// ==========================================

function calculateSpecialIntentScore(
  question,
  filePath
) {
  const normalizedQuestion =
    question.toLowerCase();

  const normalizedPath =
    filePath.toLowerCase();

  let score = 0;

  // ==========================================
  // REPOSITORY SCANNING
  // ==========================================

  const scanningQuestion =
    /\b(scan|scanning|scanner|repository scan|discover|discovering)\b/i.test(
      normalizedQuestion
    );

  if (scanningQuestion) {
    // scanner.js is the actual scanning logic
    if (
      normalizedPath.includes(
        "scanner"
      )
    ) {
      score += 100;
    }

    // server.js only starts/uses the backend
    if (
      normalizedPath.endsWith(
        "server.js"
      )
    ) {
      score -= 30;
    }

    // sourceAnalyzer is not the repository scanner
    if (
      normalizedPath.includes(
        "sourceanalyzer"
      )
    ) {
      score -= 10;
    }
  }

  // ==========================================
  // BACKEND ARCHITECTURE
  // ==========================================

  const backendQuestion =
    /\bbackend\b/i.test(
      normalizedQuestion
    );

  if (backendQuestion) {
    // server.js is the main backend entry point
    if (
      normalizedPath.endsWith(
        "server.js"
      )
    ) {
      score += 100;
    }

    // Routes are part of the backend
    if (
      normalizedPath.includes(
        "routes"
      )
    ) {
      score += 20;
    }

    // Ask route is one backend route
    if (
      normalizedPath.includes(
        "askroute"
      )
    ) {
      score += 10;
    }
  }

  // ==========================================
  // ASK REPOLENS
  // ==========================================

  const askQuestion =
    normalizedQuestion.includes(
      "ask repolens"
    ) ||
    normalizedQuestion.includes(
      "ask repo"
    ) ||
    (
      normalizedQuestion.includes(
        "question"
      ) &&
      normalizedQuestion.includes(
        "answer"
      )
    );

  if (askQuestion) {
    if (
      normalizedPath.includes(
        "askroute"
      )
    ) {
      score += 80;
    }

    if (
      normalizedPath.includes(
        "codebaseai"
      )
    ) {
      score += 60;
    }

    if (
      normalizedPath.includes(
        "relevantfilefinder"
      )
    ) {
      score += 40;
    }
  }

  // ==========================================
  // FILE TREE
  // ==========================================

  const fileTreeQuestion =
    normalizedQuestion.includes(
      "file tree"
    ) ||
    normalizedQuestion.includes(
      "folder tree"
    ) ||
    normalizedQuestion.includes(
      "project structure"
    ) ||
    normalizedQuestion.includes(
      "repository structure"
    );

  if (fileTreeQuestion) {
    if (
      normalizedPath.includes(
        "filetree"
      )
    ) {
      score += 80;
    }

    if (
      normalizedPath.endsWith(
        "app.jsx"
      )
    ) {
      score += 50;
    }

    if (
      normalizedPath.includes(
        "scanner"
      )
    ) {
      score += 20;
    }
  }

  return score;
}

// ==========================================
// CALCULATE TOTAL SCORE
// ==========================================

function calculateScore(
  question,
  file
) {
  const tokens =
    tokenizeQuestion(question);

  const intents =
    detectIntents(question);

  const pathScore =
    calculatePathScore(
      file.path,
      tokens
    );

  const contentScore =
    calculateContentScore(
      file.content,
      tokens
    );

  const intentScore =
    calculateIntentScore(
      file.path,
      intents
    );

  const fileTypeScore =
    calculateFileTypeScore(
      file.path
    );

  const specialIntentScore =
    calculateSpecialIntentScore(
      question,
      file.path
    );

  const totalScore =
    pathScore +
    contentScore +
    intentScore +
    fileTypeScore +
    specialIntentScore;

  return {
    totalScore,
    pathScore,
    contentScore,
    intentScore,
    fileTypeScore,
    specialIntentScore
  };
}

// ==========================================
// FIND RELEVANT FILES
// ==========================================

function findRelevantFiles(
  question,
  sourceFiles
) {
  if (
    !question ||
    !sourceFiles ||
    !Array.isArray(sourceFiles)
  ) {
    return [];
  }

  const results = [];

  for (const file of sourceFiles) {
    if (
      !file ||
      !file.path ||
      typeof file.content !== "string"
    ) {
      continue;
    }

    const scores =
      calculateScore(
        question,
        file
      );

    if (
      scores.totalScore > 0
    ) {
      results.push({
        path: file.path,

        score:
          scores.totalScore,

        content: file.content,

        scoreBreakdown: {
          path:
            scores.pathScore,

          content:
            scores.contentScore,

          intent:
            scores.intentScore,

          fileType:
            scores.fileTypeScore,

          specialIntent:
            scores.specialIntentScore
        }
      });
    }
  }

  // ==========================================
  // SORT BY RELEVANCE
  // ==========================================

  results.sort(
    (a, b) => {
      if (
        b.score !== a.score
      ) {
        return (
          b.score -
          a.score
        );
      }

      // Shorter paths are usually
      // more specific
      return (
        a.path.length -
        b.path.length
      );
    }
  );

  // ==========================================
  // RETURN TOP RESULTS
  // ==========================================

  return results.slice(0, 5);
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  findRelevantFiles
};