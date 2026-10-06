const fs = require("fs");
const path = require("path");

// ==========================================
// HELPERS
// ==========================================

function normalize(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

// ==========================================
// FIND README
// ==========================================

function findReadme(projectPath, scan) {
  // First use the scanner result.
  // This is important for downloaded GitHub repositories.

  const scannedFiles = scan?.files || [];

  const readmeFromScan = scannedFiles.find((file) => {
    const filePath =
      typeof file === "string"
        ? file
        : file?.path || "";

    return normalize(filePath) === "readme.md";
  });

  if (readmeFromScan) {
    const filePath =
      typeof readmeFromScan === "string"
        ? readmeFromScan
        : readmeFromScan.path;

    return path.join(
      projectPath,
      filePath
    );
  }

  // Fallback: check common README names
  const candidates = [
    "README.md",
    "readme.md",
    "README.MD",
    "Readme.md"
  ];

  for (const fileName of candidates) {
    const filePath = path.join(
      projectPath,
      fileName
    );

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

// ==========================================
// TECHNOLOGY NORMALIZATION
// ==========================================

function normalizeTechnologyName(value) {
  const tech = normalize(value);

  const aliases = {
    "react.js": "react",
    "reactjs": "react",

    "node.js": "node",
    "nodejs": "node",

    "express.js": "express",

    "vite.js": "vite",

    mongodb: "mongodb",
    mongo: "mongodb",

    postgres: "postgresql",
    postgresql: "postgresql",

    mysql: "mysql",

    javascript: "javascript",
    js: "javascript",

    typescript: "typescript",
    ts: "typescript",

    python: "python",
    py: "python",

    html: "html",
    css: "css"
  };

  return aliases[tech] || tech;
}

// ==========================================
// TECHNOLOGY CLAIMS
// ==========================================

function extractTechnologyClaims(
  readmeContent,
  analysis
) {
  const mentioned = [];

  const knownTechnologies = unique([
    ...(analysis.languages || []),
    ...(analysis.frameworks || []),
    ...(analysis.tools || []),
    ...(analysis.dependencies || []),
    ...(analysis.devDependencies || [])
  ]);

  const readmeLower =
    readmeContent.toLowerCase();

  knownTechnologies.forEach(
    (technology) => {
      const normalized =
        normalizeTechnologyName(
          technology
        );

      if (
        normalized &&
        readmeLower.includes(normalized)
      ) {
        mentioned.push(normalized);
      }
    }
  );

  const commonTechnologies = [
    "react",
    "express",
    "vite",
    "node",
    "mongodb",
    "mysql",
    "postgresql",
    "python",
    "typescript",
    "javascript",
    "tailwind",
    "next.js",
    "nextjs",
    "docker",
    "redis",
    "firebase",
    "supabase",
    "prisma",
    "graphql",
    "rest api"
  ];

  commonTechnologies.forEach(
    (technology) => {
      if (
        readmeLower.includes(
          technology
        )
      ) {
        mentioned.push(
          normalizeTechnologyName(
            technology
          )
        );
      }
    }
  );

  return unique(mentioned);
}

// ==========================================
// REFERENCED PATHS
// ==========================================

function extractReferencedPaths(
  readmeContent
) {
  const references = [];

  const patterns = [
    /`([^`]+\.(?:js|jsx|ts|tsx|py|java|cpp|c|cs|go|rs|json|md|css|html))`/gi,
    /`([^`]+\/[^`]+)`/gi
  ];

  patterns.forEach((pattern) => {
    let match;

    while (
      (match =
        pattern.exec(readmeContent)) !== null
    ) {
      const value =
        match[1].trim();

      if (
        value &&
        !value.startsWith("http") &&
        !value.includes(" ")
      ) {
        references.push(value);
      }
    }
  });

  return unique(references);
}

// ==========================================
// CHECK REFERENCED FILES
// ==========================================

function checkReferencedPaths(
  projectPath,
  references,
  scan
) {
  const issues = [];

  const scannedFiles = new Set(
    (scan.files || []).map((file) => {
      const filePath =
        typeof file === "string"
          ? file
          : file?.path || "";

      return normalize(filePath);
    })
  );

  const scannedFolders = new Set(
    (scan.folders || []).map((folder) => {
      const folderPath =
        typeof folder === "string"
          ? folder
          : folder?.path || "";

      return normalize(folderPath);
    })
  );

  references.forEach(
    (reference) => {
      const normalizedReference =
        normalize(reference)
          .replace(/^\.\//, "");

      /*
       * Do not treat a generic filename such as
       * "package.json" as missing when the repository
       * contains that file inside a subdirectory.
       */

      const fileName =
        path.basename(
          normalizedReference
        );

      const fileExists =
        scannedFiles.has(
          normalizedReference
        ) ||
        [...scannedFiles].some(
          (filePath) =>
            path.basename(filePath) ===
            fileName
        ) ||
        fs.existsSync(
          path.join(
            projectPath,
            normalizedReference
          )
        );

      const folderExists =
        scannedFolders.has(
          normalizedReference
        ) ||
        fs.existsSync(
          path.join(
            projectPath,
            normalizedReference
          )
        );

      if (
        !fileExists &&
        !folderExists
      ) {
        issues.push({
          type: "missing-path",
          severity: "high",
          message:
            `README references "${reference}", ` +
            `but that path was not found in the repository.`,
          reference
        });
      }
    }
  );

  return issues;
}

// ==========================================
// CHECK README SECTIONS
// ==========================================

function checkSections(
  readmeContent
) {
  const content =
    readmeContent.toLowerCase();

  const expectedSections = [
    {
      name: "installation",
      keywords: [
        "installation",
        "install",
        "setup"
      ]
    },
    {
      name: "usage",
      keywords: [
        "usage",
        "how to run",
        "running"
      ]
    }
  ];

  const issues = [];

  expectedSections.forEach(
    (section) => {
      const found =
        section.keywords.some(
          (keyword) =>
            content.includes(keyword)
        );

      if (!found) {
        issues.push({
          type: "missing-section",
          severity: "low",
          message:
            `README does not appear to contain a "${section.name}" section.`
        });
      }
    }
  );

  return issues;
}

// ==========================================
// MAIN DRIFT ANALYSIS
// ==========================================

function analyzeDocumentationDrift(
  projectPath,
  scan,
  analysis,
  readme
) {
  const readmePath =
    findReadme(
      projectPath,
      scan
    );

  // ========================================
  // README NOT FOUND
  // ========================================

  if (!readmePath) {
    return {
      score: 0,
      status: "missing-readme",
      summary:
        "README.md was not found in the repository.",
      technologyDrift: [],
      missingPaths: [],
      missingSections: [],
      issues: [
        {
          type: "missing-readme",
          severity: "high",
          message:
            "README.md was not found in the repository."
        }
      ]
    };
  }

  // ========================================
  // READ README
  // ========================================

  let readmeContent = "";

  try {
    readmeContent =
      fs.readFileSync(
        readmePath,
        "utf8"
      );
  } catch (error) {
    return {
      score: 0,
      status: "read-error",
      summary:
        "README exists but could not be read.",
      technologyDrift: [],
      missingPaths: [],
      missingSections: [],
      issues: [
        {
          type: "read-error",
          severity: "high",
          message:
            `Could not read README: ${error.message}`
        }
      ]
    };
  }

  // ========================================
  // TECHNOLOGIES
  // ========================================

  const mentionedTechnologies =
    extractTechnologyClaims(
      readmeContent,
      analysis
    );

  const detectedTechnologies =
    unique([
      ...(analysis.languages || []),
      ...(analysis.frameworks || []),
      ...(analysis.tools || []),
      ...(analysis.dependencies || [])
    ])
      .map(
        normalizeTechnologyName
      )
      .filter(Boolean);

  const normalizedDetected =
    unique(
      detectedTechnologies
    );

  const normalizedMentioned =
    unique(
      mentionedTechnologies
    );

  // ========================================
  // TECHNOLOGY DRIFT
  // ========================================

  const staleTechnologies =
    normalizedMentioned.filter(
      (technology) =>
        !normalizedDetected.includes(
          technology
        )
    );

  const undocumentedTechnologies =
    normalizedDetected.filter(
      (technology) =>
        !normalizedMentioned.includes(
          technology
        )
    );

  const technologyDrift = [];

  staleTechnologies.forEach(
    (technology) => {
      technologyDrift.push({
        type: "stale-technology",
        severity: "high",
        technology,
        message:
          `README mentions "${technology}", ` +
          `but it was not detected in the repository.`
      });
    }
  );

  undocumentedTechnologies.forEach(
    (technology) => {
      technologyDrift.push({
        type: "undocumented-technology",
        severity: "medium",
        technology,
        message:
          `"${technology}" was detected in the repository ` +
          `but is not mentioned in the README.`
      });
    }
  );

  // ========================================
  // PATH CHECKS
  // ========================================

  const references =
    extractReferencedPaths(
      readmeContent
    );

  const pathIssues =
    checkReferencedPaths(
      projectPath,
      references,
      scan
    );

  // ========================================
  // SECTION CHECKS
  // ========================================

  const sectionIssues =
    checkSections(
      readmeContent
    );

  // ========================================
  // COMBINE ISSUES
  // ========================================

  const issues = [
    ...technologyDrift,
    ...pathIssues,
    ...sectionIssues
  ];

  // ========================================
  // SCORE
  // ========================================

  let score = 100;

  issues.forEach(
    (issue) => {
      if (
        issue.severity === "high"
      ) {
        score -= 15;
      }

      if (
        issue.severity === "medium"
      ) {
        score -= 8;
      }

      if (
        issue.severity === "low"
      ) {
        score -= 3;
      }
    }
  );

  score = Math.max(
    0,
    Math.min(100, score)
  );

  // ========================================
  // STATUS
  // ========================================

  let status = "healthy";

  if (score < 80) {
    status =
      "needs-attention";
  }

  if (score < 50) {
    status =
      "significant-drift";
  }

  // ========================================
  // RESULT
  // ========================================

  return {
    score,

    status,

    summary:
      issues.length === 0
        ? "README appears consistent with the repository."
        : `${issues.length} documentation drift issue(s) detected.`,

    readmePath,

    technologyDrift,

    missingPaths:
      pathIssues,

    missingSections:
      sectionIssues,

    issues,

    statistics: {
      totalIssues:
        issues.length,

      highSeverity:
        issues.filter(
          (issue) =>
            issue.severity ===
            "high"
        ).length,

      mediumSeverity:
        issues.filter(
          (issue) =>
            issue.severity ===
            "medium"
        ).length,

      lowSeverity:
        issues.filter(
          (issue) =>
            issue.severity ===
            "low"
        ).length,

      documentedTechnologies:
        normalizedMentioned.length,

      detectedTechnologies:
        normalizedDetected.length,

      referencedPaths:
        references.length
    }
  };
}

module.exports = {
  analyzeDocumentationDrift
};