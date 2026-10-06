const fs = require("fs");
const path = require("path");

// ==========================================
// BUILT-IN NODE MODULES
// ==========================================

const BUILTIN_MODULES = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib"
]);

// ==========================================
// PATH NORMALIZATION
// ==========================================

function normalizePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .toLowerCase();
}

// ==========================================
// GET PACKAGE NAME
// ==========================================

function getPackageName(importPath) {
  if (!importPath) {
    return null;
  }

  const value = importPath.trim();

  // Ignore local imports
  if (
    value.startsWith(".") ||
    value.startsWith("/") ||
    value.startsWith("@/")
  ) {
    return null;
  }

  const parts = value.split("/");

  // Scoped package
  if (value.startsWith("@")) {
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }

    return value;
  }

  return parts[0];
}

// ==========================================
// EXTRACT IMPORTS
// ==========================================

function extractImports(content) {
  const imports = new Set();

  if (!content) {
    return [];
  }

  const patterns = [
    // require("package")
    /require\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,

    // import x from "package"
    /from\s+["'`]([^"'`]+)["'`]/g,

    // import("package")
    /import\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,

    // import "package"
    /import\s+["'`]([^"'`]+)["'`]/g
  ];

  for (const pattern of patterns) {
    let match;

    while (
      (match = pattern.exec(content)) !== null
    ) {
      const packageName =
        getPackageName(match[1]);

      // Prevent false positives caused by
      // mentioning "package" in analyzer text.
      if (
        packageName === "package" ||
        packageName === "package.json"
      ) {
        continue;
      }

      if (
        packageName &&
        !BUILTIN_MODULES.has(packageName)
      ) {
        imports.add(packageName);
      }
    }
  }

  return [...imports];
}

// ==========================================
// FILE CLASSIFICATION
// ==========================================

function isTestFile(filePath) {
  const normalized =
    normalizePath(filePath);

  return (
    normalized.includes("/test/") ||
    normalized.includes("/tests/") ||
    normalized.includes(".test.") ||
    normalized.includes(".spec.") ||
    normalized.endsWith("_test.js") ||
    normalized.endsWith("_test.ts")
  );
}

function isConfigFile(filePath) {
  const normalized =
    normalizePath(filePath);

  return (
    normalized.includes("vite.config") ||
    normalized.includes("webpack.config") ||
    normalized.includes("babel.config") ||
    normalized.includes("eslint.config") ||
    normalized.includes("next.config") ||
    normalized.includes("tailwind.config") ||
    normalized.includes("postcss.config")
  );
}

// ==========================================
// FIND PACKAGE.JSON FILES
// ==========================================

function findPackageFiles(context) {
  const files =
    context?.structure?.files ||
    context?.scan?.files ||
    [];

  const packageFiles = [];

  for (const file of files) {
    const filePath =
      typeof file === "string"
        ? file
        : file?.path || "";

    if (
      normalizePath(filePath).endsWith(
        "package.json"
      )
    ) {
      packageFiles.push(filePath);
    }
  }

  return packageFiles;
}

// ==========================================
// READ PACKAGE.JSON
// ==========================================

function readPackageJson(
  projectPath,
  packageFile
) {
  try {
    if (!projectPath) {
      return null;
    }

    const fullPath =
      path.join(
        projectPath,
        packageFile
      );

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content =
      fs.readFileSync(
        fullPath,
        "utf8"
      );

    return JSON.parse(content);

  } catch (error) {
    console.error(
      "Could not read package.json:",
      packageFile,
      error.message
    );

    return null;
  }
}

// ==========================================
// BUILD PACKAGE REGISTRY
// ==========================================

function buildPackageRegistry(context) {
  const projectPath =
    context?.projectPath;

  const packageFiles =
    findPackageFiles(context);

  const production =
    new Map();

  const development =
    new Map();

  for (const packageFile of packageFiles) {
    const packageJson =
      readPackageJson(
        projectPath,
        packageFile
      );

    if (!packageJson) {
      continue;
    }

    const packageDirectory =
      path.dirname(packageFile);

    const dependencies =
      packageJson.dependencies ||
      {};

    const devDependencies =
      packageJson.devDependencies ||
      {};

    for (const [name, version] of Object.entries(
      dependencies
    )) {
      production.set(name, {
        name,
        version,
        packageFile:
          normalizePath(packageFile),
        packageDirectory:
          normalizePath(packageDirectory)
      });
    }

    for (const [name, version] of Object.entries(
      devDependencies
    )) {
      development.set(name, {
        name,
        version,
        packageFile:
          normalizePath(packageFile),
        packageDirectory:
          normalizePath(packageDirectory)
      });
    }
  }

  return {
    production,
    development,
    packageFiles
  };
}

// ==========================================
// CHECK WHETHER DEPENDENCY BELONGS TO FILE
// ==========================================

function packageMatchesFile(
  dependency,
  usagePath
) {
  const directory =
    normalizePath(
      dependency?.packageDirectory
    );

  const normalizedPath =
    normalizePath(
      usagePath
    );

  // Root package.json
  if (
    !directory ||
    directory === "."
  ) {
    return true;
  }

  return (
    normalizedPath === directory ||
    normalizedPath.startsWith(
      `${directory}/`
    )
  );
}

// ==========================================
// BUILD USAGE MAP
// ==========================================

function buildUsageMap(context) {
  const usageMap =
    new Map();

  const sourceFiles =
    context?.sourceCode?.files ||
    [];

  for (const file of sourceFiles) {
    const filePath =
      file?.path || "";

    const content =
      file?.content || "";

    const imports =
      extractImports(content);

    for (const packageName of imports) {
      if (!usageMap.has(packageName)) {
        usageMap.set(
          packageName,
          []
        );
      }

      usageMap
        .get(packageName)
        .push({
          path: filePath,

          isTest:
            isTestFile(filePath),

          isConfig:
            isConfigFile(filePath)
        });
    }
  }

  return usageMap;
}

// ==========================================
// ANALYZE DEPENDENCY GROUP
// ==========================================

function analyzeDependencyGroup(
  dependencies,
  usageMap,
  type
) {
  const results = [];

  for (const dependency of dependencies) {
    const usages =
      usageMap.get(
        dependency.name
      ) || [];

    const relevantUsages =
      usages.filter(
        (usage) =>
          packageMatchesFile(
            dependency,
            usage.path
          )
      );

    const runtimeUsages =
      relevantUsages.filter(
        (usage) =>
          !usage.isTest &&
          !usage.isConfig
      );

    const testUsages =
      relevantUsages.filter(
        (usage) =>
          usage.isTest
      );

    const configUsages =
      relevantUsages.filter(
        (usage) =>
          usage.isConfig
      );

    const used =
      relevantUsages.length > 0;

    const runtimeUsed =
      runtimeUsages.length > 0;

    const files =
      relevantUsages.map(
        (usage) =>
          usage.path
      );

    results.push({
      name: dependency.name,

      version:
        dependency.version,

      type,

      category:
        type === "production"
          ? "production"
          : "development",

      packageFile:
        dependency.packageFile,

      used,

      runtimeUsed,

      usageCount:
        relevantUsages.length,

      importCount:
        relevantUsages.length,

      files,

      importedFrom:
        files,

      message: used
        ? `"${dependency.name}" is used by the repository.`
        : `"${dependency.name}" is declared but was not detected in source imports.`,

      testUsage:
        testUsages.length,

      configUsage:
        configUsages.length
    });
  }

  return results;
}

// ==========================================
// ANALYZE NPM SCRIPTS
// ==========================================

function analyzeScripts(
  context,
  usageMap
) {
  const packageFiles =
    findPackageFiles(context);

  const results = [];

  for (const packageFile of packageFiles) {
    const packageJson =
      readPackageJson(
        context.projectPath,
        packageFile
      );

    if (!packageJson) {
      continue;
    }

    const scripts =
      packageJson.scripts ||
      {};

    for (const [scriptName, command] of Object.entries(
      scripts
    )) {
      const usedPackages = [];

      usageMap.forEach(
        (_usages, packageName) => {
          if (
            String(command).includes(
              packageName
            )
          ) {
            usedPackages.push(
              packageName
            );
          }
        }
      );

      results.push({
        packageFile:
          normalizePath(
            packageFile
          ),

        script:
          scriptName,

        command,

        dependencies:
          usedPackages
      });
    }
  }

  return results;
}

// ==========================================
// MAIN DEPENDENCY ANALYZER
// ==========================================

function analyzeDependencies(context) {
  const {
    production,
    development,
    packageFiles
  } =
    buildPackageRegistry(
      context
    );

  const usageMap =
    buildUsageMap(
      context
    );

  // ========================================
  // PRODUCTION
  // ========================================

  const productionResults =
    analyzeDependencyGroup(
      [...production.values()],
      usageMap,
      "production"
    );

  // ========================================
  // DEVELOPMENT
  // ========================================

  const developmentResults =
    analyzeDependencyGroup(
      [...development.values()],
      usageMap,
      "development"
    );

  // ========================================
  // ALL DECLARED DEPENDENCIES
  // ========================================

  const allDeclared =
    new Set([
      ...production.keys(),
      ...development.keys()
    ]);

  // ========================================
  // POTENTIALLY UNUSED
  // ========================================

  const potentiallyUnused = [];

  [
    ...productionResults,
    ...developmentResults
  ].forEach(
    (dependency) => {
      if (!dependency.used) {
        potentiallyUnused.push({
          ...dependency,

          category:
            dependency.type === "production"
              ? "production"
              : "development",

          message:
            `"${dependency.name}" is declared but was not detected in source imports. It may still be used dynamically or through configuration.`
        });
      }
    }
  );

  // ========================================
  // MISSING DEPENDENCIES
  // ========================================

  const missingMap =
    new Map();

  usageMap.forEach(
    (usages, packageName) => {

      // Already declared
      if (
        allDeclared.has(
          packageName
        )
      ) {
        return;
      }

      // Node built-in
      if (
        BUILTIN_MODULES.has(
          packageName
        )
      ) {
        return;
      }

      const runtimeUsages =
        usages.filter(
          (usage) =>
            !usage.isTest &&
            !usage.isConfig
        );

      // Ignore test/config-only imports
      if (
        runtimeUsages.length === 0
      ) {
        return;
      }

      const files =
        runtimeUsages.map(
          (usage) =>
            usage.path
        );

      missingMap.set(
        packageName,
        {
          name:
            packageName,

          severity:
            "high",

          category:
            "missing",

          message:
            `"${packageName}" is imported in the repository but is not declared in package.json.`,

          files,

          importedFrom:
            files
        }
      );
    }
  );

  const missing =
    [...missingMap.values()];

  // ========================================
  // DEV DEPENDENCY RUNTIME USAGE
  // ========================================

  const devDependencyRuntimeUsage =
    developmentResults.filter(
      (dependency) =>
        dependency.runtimeUsed
    );

  // ========================================
  // SCRIPT USAGE
  // ========================================

  const scriptUsage =
    analyzeScripts(
      context,
      usageMap
    );

  // ========================================
  // SCORE
  // ========================================

  let score = 100;

  score -=
    missing.length * 15;

  score -=
    potentiallyUnused.length * 5;

  score -=
    devDependencyRuntimeUsage.length * 5;

  score =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );

  // ========================================
  // STATUS
  // ========================================

  let status =
    "healthy";

  if (score < 80) {
    status =
      "needs-attention";
  }

  if (score < 50) {
    status =
      "significant-issues";
  }

  // ========================================
  // SUMMARY
  // ========================================

  let summary;

  if (missing.length > 0) {
    summary =
      `${missing.length} missing dependency issue(s) detected.`;
  } else if (
    potentiallyUnused.length > 0
  ) {
    summary =
      `${potentiallyUnused.length} potentially unused dependency issue(s) detected.`;
  } else {
    summary =
      "Dependency usage looks healthy.";
  }

  // ========================================
  // STATISTICS
  // ========================================

  const allResults = [
    ...productionResults,
    ...developmentResults
  ];

  const usedDependencies =
    allResults.filter(
      (dependency) =>
        dependency.used
    ).length;

  // ========================================
  // FINAL RESULT
  // ========================================

  return {
    score,

    status,

    summary,

    production:
      productionResults,

    development:
      developmentResults,

    potentiallyUnused,

    missing,

    devDependencyRuntimeUsage,

    scriptUsage,

    packageFiles,

    statistics: {
      totalDependencies:
        allResults.length,

      productionDependencies:
        productionResults.length,

      developmentDependencies:
        developmentResults.length,

      usedDependencies,

      unusedDependencies:
        potentiallyUnused.length,

      missingDependencies:
        missing.length,

      runtimeDevDependencies:
        devDependencyRuntimeUsage.length
    }
  };
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  analyzeDependencies
};