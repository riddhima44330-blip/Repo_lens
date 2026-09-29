const path = require("path");

function analyzeHealth(projectPath, scanResult, analysis) {

  const checks = [];

  // -------------------------
  // Documentation
  // -------------------------

  const hasReadme = scanResult.files.some(
    (file) => path.basename(file).toLowerCase() === "readme.md"
  );

  checks.push({
    name: "README",
    category: "Documentation",
    passed: hasReadme,
    message: hasReadme
      ? "README.md found"
      : "README.md is missing"
  });


  // -------------------------
  // Git configuration
  // -------------------------

  const hasGitignore = scanResult.files.some(
    (file) => path.basename(file).toLowerCase() === ".gitignore"
  );

  checks.push({
    name: ".gitignore",
    category: "Configuration",
    passed: hasGitignore,
    message: hasGitignore
      ? ".gitignore found"
      : ".gitignore is missing"
  });


  // -------------------------
  // Package configuration
  // -------------------------

  const hasPackageJson = scanResult.files.some(
    (file) => path.basename(file) === "package.json"
  );

  checks.push({
    name: "Package Configuration",
    category: "Configuration",
    passed: hasPackageJson,
    message: hasPackageJson
      ? "package.json found"
      : "package.json is missing"
  });


  // -------------------------
  // Lock file
  // -------------------------

  const hasLockFile = scanResult.files.some(
    (file) => {
      const name = path.basename(file);

      return (
        name === "package-lock.json" ||
        name === "yarn.lock" ||
        name === "pnpm-lock.yaml"
      );
    }
  );

  checks.push({
    name: "Dependency Lock File",
    category: "Dependencies",
    passed: hasLockFile,
    message: hasLockFile
      ? "Dependency lock file found"
      : "No dependency lock file found"
  });


  // -------------------------
  // Tests
  // -------------------------

  const hasTests = scanResult.files.some(
    (file) => {
      const lower = file.toLowerCase();

      return (
        lower.includes("test") ||
        lower.includes("spec")
      );
    }
  );

  checks.push({
    name: "Tests",
    category: "Testing",
    passed: hasTests,
    message: hasTests
      ? "Test files detected"
      : "No test files detected"
  });


  // -------------------------
  // Scripts
  // -------------------------

  const scriptCount = Object.keys(
    analysis.scripts || {}
  ).length;

  const hasScripts = scriptCount > 0;

  checks.push({
    name: "Project Scripts",
    category: "Configuration",
    passed: hasScripts,
    message: hasScripts
      ? `${scriptCount} project script(s) found`
      : "No project scripts found"
  });


  // -------------------------
  // Calculate score
  // -------------------------

  const passedChecks = checks.filter(
    (check) => check.passed
  ).length;

  const score = Math.round(
    (passedChecks / checks.length) * 100
  );


  return {
    score,
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    checks
  };
}


module.exports = {
  analyzeHealth
};