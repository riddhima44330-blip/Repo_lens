const fs = require("fs");
const path = require("path");

function analyzeProject(projectPath, scanResult) {
  const analysis = {
  projectName: path.basename(projectPath),
  languages: [],
  frameworks: [],
  tools: [],
  dependencies: [],
  devDependencies: [],
  scripts: {},
  packageManagers: []
};

  // --------------------------------------------------
  // 1. Detect languages from file extensions
  // --------------------------------------------------

  const languageMap = {
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".cs": "C#",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".html": "HTML",
    ".css": "CSS"
  };

  for (const extension of Object.keys(scanResult.extensions)) {
    const language = languageMap[extension];

    if (language && !analysis.languages.includes(language)) {
      analysis.languages.push(language);
    }
  }

  // --------------------------------------------------
  // 2. Find package.json files
  // --------------------------------------------------

  const packageFiles = scanResult.files.filter(
    (file) => path.basename(file) === "package.json"
  );

  for (const packageFile of packageFiles) {
    const fullPath = path.join(projectPath, packageFile);

    try {
      const packageData = JSON.parse(
        fs.readFileSync(fullPath, "utf-8")
      );

      // Dependencies
     const dependencies = packageData.dependencies || {};
const devDependencies = packageData.devDependencies || {};


for (const dependency of Object.keys(dependencies)) {

  if (!analysis.dependencies.includes(dependency)) {
    analysis.dependencies.push(dependency);
  }

}


for (const dependency of Object.keys(devDependencies)) {

  if (!analysis.devDependencies.includes(dependency)) {
    analysis.devDependencies.push(dependency);
  }

}

      // Scripts
      if (packageData.scripts) {
        analysis.scripts = {
          ...analysis.scripts,
          ...packageData.scripts
        };
      }

      // Package manager detection
      const packageDirectory = path.dirname(fullPath);

      if (
        fs.existsSync(
          path.join(packageDirectory, "package-lock.json")
        )
      ) {
        if (!analysis.packageManagers.includes("npm")) {
          analysis.packageManagers.push("npm");
        }
      }

      if (
        fs.existsSync(
          path.join(packageDirectory, "yarn.lock")
        )
      ) {
        if (!analysis.packageManagers.includes("Yarn")) {
          analysis.packageManagers.push("Yarn");
        }
      }

      if (
        fs.existsSync(
          path.join(packageDirectory, "pnpm-lock.yaml")
        )
      ) {
        if (!analysis.packageManagers.includes("pnpm")) {
          analysis.packageManagers.push("pnpm");
        }
      }

      // --------------------------------------------------
      // 3. Detect frameworks and tools
      // --------------------------------------------------

      const dependencyNames = Object.keys(dependencies);

      if (dependencyNames.includes("react")) {
        analysis.frameworks.push("React");
      }

      if (dependencyNames.includes("express")) {
        analysis.frameworks.push("Express");
      }

      if (dependencyNames.includes("next")) {
        analysis.frameworks.push("Next.js");
      }

      if (dependencyNames.includes("vue")) {
        analysis.frameworks.push("Vue");
      }

      if (dependencyNames.includes("angular")) {
        analysis.frameworks.push("Angular");
      }

      if (dependencyNames.includes("vite")) {
        analysis.tools.push("Vite");
      }

      if (dependencyNames.includes("tailwindcss")) {
        analysis.tools.push("Tailwind CSS");
      }

    } catch (error) {
      console.log(
        `Could not analyze ${packageFile}:`,
        error.message
      );
    }
  }

  return analysis;
}

module.exports = {
  analyzeProject
};