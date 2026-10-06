const fs = require("fs");
const path = require("path");

function normalizePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/")
    .toLowerCase();
}

function unique(values) {
  return [...new Set(values)];
}

/* -------------------------------------------------------
   README DETECTION
------------------------------------------------------- */

function findReadme(projectPath, scan) {
  const scanFiles = scan?.files || [];

  const scannerReadme = scanFiles.find((file) => {
    const filePath =
      typeof file === "string"
        ? file
        : file?.path || "";

    return (
      normalizePath(filePath) === "readme.md" ||
      normalizePath(filePath).endsWith("/readme.md")
    );
  });

  if (scannerReadme) {
    return typeof scannerReadme === "string"
      ? scannerReadme
      : scannerReadme.path;
  }

  if (projectPath) {
    const possibleNames = [
      "README.md",
      "readme.md",
      "Readme.md"
    ];

    for (const name of possibleNames) {
      const fullPath = path.join(projectPath, name);

      if (fs.existsSync(fullPath)) {
        return name;
      }
    }
  }

  return null;
}

/* -------------------------------------------------------
   README READING
------------------------------------------------------- */

function readReadme(projectPath, readmePath) {
  if (!projectPath || !readmePath) {
    return "";
  }

  try {
    const fullPath = path.join(
      projectPath,
      readmePath
    );

    if (!fs.existsSync(fullPath)) {
      return "";
    }

    return fs.readFileSync(fullPath, "utf8");
  } catch (error) {
    return "";
  }
}

/* -------------------------------------------------------
   TECHNOLOGY NORMALIZATION
------------------------------------------------------- */

function normalizeTechnology(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.js$/i, "")
    .replace(/\s+/g, " ");
}

/* -------------------------------------------------------
   README TECHNOLOGY CLAIMS
------------------------------------------------------- */

function extractTechnologyClaims(readme) {
  const claims = [];

  if (!readme) {
    return claims;
  }

  /*
   * IMPORTANT:
   * Do not include single-letter "c".
   *
   * README text commonly contains the letter "c"
   * inside normal English words, which creates false
   * technology detections.
   */

  const knownTechnologies = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "go",
    "rust",

    "react",
    "next.js",
    "nextjs",
    "express",
    "node.js",
    "node",

    "vite",
    "webpack",
    "tailwind",
    "bootstrap",

    "mongodb",
    "mysql",
    "postgresql",
    "postgres",
    "sqlite",

    "openai",
    "prisma",
    "leaflet",

    "docker",
    "vercel",
    "netlify"
  ];

  const lower = readme.toLowerCase();

  for (const technology of knownTechnologies) {
    if (
      lower.includes(
        technology.toLowerCase()
      )
    ) {
      claims.push(
        normalizeTechnology(technology)
      );
    }
  }

  return unique(claims);
}

/* -------------------------------------------------------
   README PATH REFERENCES
------------------------------------------------------- */

function extractReferencedPaths(readme) {
  if (!readme) {
    return [];
  }

  const references = [];

  /*
   * Markdown links
   */

  const markdownLinks =
    /\[[^\]]*\]\(([^)]+)\)/g;

  let match;

  while (
    (match = markdownLinks.exec(readme)) !== null
  ) {
    const value =
      match[1]
        .split("#")[0]
        .trim();

    if (value) {
      references.push(value);
    }
  }

  /*
   * Backtick references
   */

  const backtickPaths =
    /`([^`]+)`/g;

  while (
    (match = backtickPaths.exec(readme)) !== null
  ) {
    const value =
      match[1].trim();

    if (
      value.includes("/") ||
      value.includes("\\") ||
      value.includes(".json") ||
      value.includes(".js") ||
      value.includes(".jsx") ||
      value.includes(".ts") ||
      value.includes(".tsx")
    ) {
      references.push(value);
    }
  }

  return unique(
    references
      .map((value) =>
        value
          .replace(/^['"]|['"]$/g, "")
          .replace(/\/$/, "")
      )
      .filter(Boolean)
  );
}

/* -------------------------------------------------------
   REPOSITORY FILE LIST
------------------------------------------------------- */

function buildRepositoryFiles(scan) {
  const files = scan?.files || [];

  return files
    .map((file) =>
      typeof file === "string"
        ? file
        : file?.path || ""
    )
    .filter(Boolean)
    .map(normalizePath);
}

/* -------------------------------------------------------
   PATH EXISTENCE CHECK
------------------------------------------------------- */

function referencedPathExists(
  reference,
  repositoryFiles
) {
  let normalizedReference =
    normalizePath(reference)
      .replace(/^\.\//, "")
      .replace(/^\//, "");

  if (!normalizedReference) {
    return true;
  }

  /*
   * External links are not repository paths.
   */

  if (
    normalizedReference.startsWith(
      "http://"
    ) ||
    normalizedReference.startsWith(
      "https://"
    ) ||
    normalizedReference.startsWith(
      "mailto:"
    )
  ) {
    return true;
  }

  /*
   * README anchors are valid.
   */

  if (
    normalizedReference.startsWith("#")
  ) {
    return true;
  }

  /*
   * Exact repository path.
   */

  if (
    repositoryFiles.includes(
      normalizedReference
    )
  ) {
    return true;
  }

  /*
   * Path may be written without ./.
   */

  if (
    repositoryFiles.some(
      (file) =>
        file.endsWith(
          `/${normalizedReference}`
        )
    )
  ) {
    return true;
  }

  /*
   * IMPORTANT:
   *
   * Generic filenames such as:
   *
   * package.json
   * package-lock.json
   * README.md
   *
   * may exist in multiple folders.
   *
   * Therefore a basename match is considered valid.
   */

  const basename =
    path
      .basename(normalizedReference)
      .toLowerCase();

  if (
    basename === normalizedReference
  ) {
    const matchingFiles =
      repositoryFiles.filter(
        (file) =>
          path
            .basename(file)
            .toLowerCase() === basename
      );

    if (
      matchingFiles.length > 0
    ) {
      return true;
    }
  }

  /*
   * Also support references such as:
   *
   * backend/package.json
   * replens/package.json
   */

  const matchingSuffix =
    repositoryFiles.some(
      (file) =>
        file.endsWith(
          `/${normalizedReference}`
        )
    );

  if (matchingSuffix) {
    return true;
  }

  return false;
}

/* -------------------------------------------------------
   TECHNOLOGY MISMATCH DETECTION
------------------------------------------------------- */

function detectTechnologyMismatches(
  readmeClaims,
  analysis
) {
  const detected = [
    ...(analysis?.languages || []),
    ...(analysis?.frameworks || []),
    ...(analysis?.tools || [])
  ].map(normalizeTechnology);

  const normalizedDetected =
    unique(detected);

  const mismatches = [];

  for (const technology of readmeClaims) {
    const normalized =
      normalizeTechnology(
        technology
      );

    const aliases = {
      "next.js": [
        "next.js",
        "nextjs"
      ],

      nextjs: [
        "next.js",
        "nextjs"
      ],

      "node.js": [
        "node.js",
        "node"
      ],

      node: [
        "node.js",
        "node"
      ],

      postgres: [
        "postgres",
        "postgresql"
      ],

      postgresql: [
        "postgres",
        "postgresql"
      ]
    };

    const possibleNames =
      aliases[normalized] ||
      [normalized];

    const exists =
      possibleNames.some(
        (name) =>
          normalizedDetected.includes(
            name
          )
      );

    if (!exists) {
      mismatches.push(
        `README mentions "${technology}", but it was not detected in the repository.`
      );
    }
  }

  return mismatches;
}

/* -------------------------------------------------------
   MAIN ANALYZER
------------------------------------------------------- */

function analyzeDocumentationDrift(
  projectPath,
  scan,
  analysis,
  documentation
) {
  const issues = [];

  /*
   * Find README
   */

  const readmePath =
    findReadme(
      projectPath,
      scan
    );

  if (!readmePath) {
    return {
      score: 0,

      status:
        "significant-drift",

      summary:
        "README.md was not found in the repository.",

      readmePath: null,

      issues: [
        {
          severity: "high",

          type:
            "missing-readme",

          message:
            "README.md was not found in the repository."
        }
      ],

      statistics: {
        totalIssues: 1,
        high: 1,
        medium: 0,
        low: 0
      }
    };
  }

  /*
   * Read README
   */

  const readme =
    readReadme(
      projectPath,
      readmePath
    );

  if (!readme) {
    return {
      score: 0,

      status:
        "significant-drift",

      summary:
        "README.md exists but could not be read.",

      readmePath,

      issues: [
        {
          severity: "high",

          type:
            "unreadable-readme",

          message:
            "README.md exists but could not be read."
        }
      ],

      statistics: {
        totalIssues: 1,
        high: 1,
        medium: 0,
        low: 0
      }
    };
  }

  /*
   * Technology consistency
   */

  const technologyClaims =
    extractTechnologyClaims(
      readme
    );

  const technologyMismatches =
    detectTechnologyMismatches(
      technologyClaims,
      analysis
    );

  technologyMismatches.forEach(
    (message) => {
      issues.push({
        severity: "medium",

        type:
          "technology-mismatch",

        message
      });
    }
  );

  /*
   * Referenced repository paths
   */

  const referencedPaths =
    extractReferencedPaths(
      readme
    );

  const repositoryFiles =
    buildRepositoryFiles(
      scan
    );

  for (
    const reference of referencedPaths
  ) {
    /*
     * Ignore external URLs.
     */

    if (
      reference.startsWith(
        "http://"
      ) ||
      reference.startsWith(
        "https://"
      ) ||
      reference.startsWith("#")
    ) {
      continue;
    }

    /*
     * Ignore common example values.
     */

    if (
      reference ===
        "example.com" ||
      reference ===
        "localhost:3000" ||
      reference ===
        "localhost:5000"
    ) {
      continue;
    }

    const exists =
      referencedPathExists(
        reference,
        repositoryFiles
      );

    if (!exists) {
      issues.push({
        severity: "high",

        type:
          "missing-path",

        message:
          `README references "${reference}", but that path was not found in the repository.`
      });
    }
  }

  /*
   * Calculate score
   */

  let score = 100;

  for (
    const issue of issues
  ) {
    if (
      issue.severity ===
      "high"
    ) {
      score -= 15;
    } else if (
      issue.severity ===
      "medium"
    ) {
      score -= 8;
    } else {
      score -= 3;
    }
  }

  score =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );

  /*
   * Status
   */

  let status =
    "healthy";

  if (score < 80) {
    status =
      "needs-attention";
  }

  if (score < 50) {
    status =
      "significant-drift";
  }

  /*
   * Summary
   */

  let summary;

  if (
    issues.length === 0
  ) {
    summary =
      "Documentation looks healthy.";
  } else if (
    score >= 80
  ) {
    summary =
      `${issues.length} documentation drift issue(s) detected.`;
  } else {
    summary =
      `${issues.length} documentation consistency issue(s) detected.`;
  }

  /*
   * Statistics
   */

  const high =
    issues.filter(
      (issue) =>
        issue.severity ===
        "high"
    ).length;

  const medium =
    issues.filter(
      (issue) =>
        issue.severity ===
        "medium"
    ).length;

  const low =
    issues.filter(
      (issue) =>
        issue.severity ===
        "low"
    ).length;

  /*
   * Final result
   */

  return {
    score,

    status,

    summary,

    readmePath,

    technologyClaims,

    detectedTechnologies: [
      ...(analysis?.languages || []),
      ...(analysis?.frameworks || []),
      ...(analysis?.tools || [])
    ],

    referencedPaths,

    issues,

    statistics: {
      totalIssues:
        issues.length,

      high,

      medium,

      low
    }
  };
}

module.exports = {
  analyzeDocumentationDrift
};