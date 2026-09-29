const fs = require("fs");
const path = require("path");

function analyzeReadme(projectPath, scanResult, analysis) {

  const readmeFile = scanResult.files.find(
    (file) => path.basename(file).toLowerCase() === "readme.md"
  );

  if (!readmeFile) {
    return {
      exists: false,
      score: 0,
      message: "README.md not found",
      mentionedTechnologies: [],
      detectedTechnologies: [],
      mismatches: []
    };
  }


  const readmePath = path.join(
    projectPath,
    readmeFile
  );

  const readmeContent = fs.readFileSync(
    readmePath,
    "utf-8"
  ).toLowerCase();


  const detectedTechnologies = [
    ...analysis.languages,
    ...analysis.frameworks,
    ...analysis.tools
  ].map((item) => item.toLowerCase());


  const mentionedTechnologies = [];

  const technologiesToCheck = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "react",
    "express",
    "next.js",
    "vue",
    "angular",
    "vite",
    "tailwind css",
    "node.js",
    "mongodb",
    "mysql",
    "postgresql",
    "sqlite"
  ];


  for (const technology of technologiesToCheck) {

    if (readmeContent.includes(technology)) {

      mentionedTechnologies.push(technology);

    }

  }


  const mismatches = [];

  for (const technology of mentionedTechnologies) {

    const detected = detectedTechnologies.some(
      (detectedTechnology) =>
        detectedTechnology.includes(technology) ||
        technology.includes(detectedTechnology)
    );

    if (!detected) {

      mismatches.push({
        technology,
        message: `${technology} is mentioned in README but was not detected`
      });

    }

  }


  const score = Math.max(
    0,
    100 - mismatches.length * 20
  );


  return {
    exists: true,
    score,
    message:
      mismatches.length === 0
        ? "README appears consistent with detected technologies"
        : "Potential README inconsistencies detected",
    mentionedTechnologies,
    detectedTechnologies,
    mismatches
  };
}


module.exports = {
  analyzeReadme
};