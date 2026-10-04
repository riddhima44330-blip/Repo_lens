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
  "does",
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
      "scanner",
      "server",
      "sourceanalyzer"
    ]
  },

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

    // Exact filename/path token
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

  const totalScore =
    pathScore +
    contentScore +
    intentScore +
    fileTypeScore;

  return {
    totalScore,
    pathScore,
    contentScore,
    intentScore,
    fileTypeScore
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
          path: scores.pathScore,
          content: scores.contentScore,
          intent: scores.intentScore,
          fileType: scores.fileTypeScore
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

        return b.score - a.score;

      }

      // Tie breaker:
      // shorter paths are usually
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

module.exports = {
  findRelevantFiles
};