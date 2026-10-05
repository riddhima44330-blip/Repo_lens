const path = require("path");

// Node.js built-in modules.
// These must NOT be treated as missing dependencies.
const BUILTIN_MODULES = new Set([
  "assert",
  "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "dns/promises",
  "domain",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "path/posix",
  "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "readline/promises",
  "repl",
  "stream",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "sys",
  "timers",
  "timers/promises",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "util/types",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib"
]);

function normalizePath(value) {
  return String(value || "")
    .replace(/\\/g, "/");
}

function getPackageName(importPath) {
  if (!importPath) {
    return null;
  }

  if (
    importPath.startsWith(".") ||
    importPath.startsWith("/") ||
    importPath.startsWith("#")
  ) {
    return null;
  }

  if (
    importPath.startsWith("node:")
  ) {
    return null;
  }

  if (
    BUILTIN_MODULES.has(importPath)
  ) {
    return null;
  }

  // Scoped package:
  // @scope/package/subpath
  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");

    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }

    return importPath;
  }

  // Normal package:
  // express
  // express/lib/router
  return importPath.split("/")[0];
}

function extractImports(content) {
  const imports = [];

  if (!content) {
    return imports;
  }

  const patterns = [
    // import x from "package"
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,

    // export ... from "package"
    /export\s+(?:[\s\S]*?\s+from\s+)["']([^"']+)["']/g,

    // require("package")
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,

    // import("package")
    /import\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  patterns.forEach((pattern) => {
    let match;

    while (
      (match = pattern.exec(content)) !== null
    ) {
      const packageName =
        getPackageName(match[1]);

      if (packageName) {
        imports.push({
          packageName,
          importPath: match[1]
        });
      }
    }
  });

  return imports;
}

function isTestFile(filePath) {
  const normalized =
    normalizePath(filePath).toLowerCase();

  return (
    normalized.includes("/test/") ||
    normalized.includes("/tests/") ||
    normalized.includes("__tests__") ||
    normalized.includes(".test.") ||
    normalized.includes(".spec.")
  );
}

function isConfigFile(filePath) {
  const normalized =
    normalizePath(filePath).toLowerCase();

  const fileName =
    path.basename(normalized);

  return (
    fileName.includes("config") ||
    fileName.startsWith("vite.config") ||
    fileName.startsWith("webpack.config") ||
    fileName.startsWith("next.config") ||
    fileName.startsWith("tailwind.config")
  );
}

function analyzeDependencyGroup(
  dependencies,
  usageMap
) {
  return (dependencies || []).map(
    (dependency) => {
      const usage =
        usageMap.get(dependency);

      return {
        name: dependency,
        used: Boolean(usage),
        importCount:
          usage?.importCount || 0,
        files:
          usage?.files || [],
        locations:
          usage?.locations || []
      };
    }
  );
}

function buildUsageMap(sourceFiles) {
  const usageMap = new Map();

  (sourceFiles || []).forEach(
    (file) => {
      const imports =
        extractImports(file.content);

      imports.forEach(
        ({
          packageName,
          importPath
        }) => {
          if (!usageMap.has(packageName)) {
            usageMap.set(
              packageName,
              {
                importCount: 0,
                files: [],
                locations: []
              }
            );
          }

          const usage =
            usageMap.get(packageName);

          usage.importCount += 1;

          if (
            !usage.files.includes(
              file.path
            )
          ) {
            usage.files.push(
              file.path
            );
          }

          usage.locations.push({
            file: file.path,
            importPath,
            type: isTestFile(file.path)
              ? "test"
              : isConfigFile(file.path)
              ? "config"
              : "source"
          });
        }
      );
    }
  );

  return usageMap;
}

function analyzeScripts(
  scripts,
  dependencyNames
) {
  const results = [];

  Object.entries(
    scripts || {}
  ).forEach(
    ([scriptName, command]) => {
      const usedDependencies =
        dependencyNames.filter(
          (dependency) =>
            command.includes(
              dependency
            )
        );

      results.push({
        script: scriptName,
        command,
        dependencies:
          usedDependencies
      });
    }
  );

  return results;
}

function analyzeDependencies(
  context
) {
  const analysis =
    context?.analysis || {};

  const sourceFiles =
    context?.sourceCode?.files || [];

  const productionDependencies =
    analysis.dependencies || [];

  const developmentDependencies =
    analysis.devDependencies || [];

  const usageMap =
    buildUsageMap(sourceFiles);

  const allDependencies = [
    ...productionDependencies,
    ...developmentDependencies
  ];

  const dependencySet =
    new Set(allDependencies);

  // ------------------------------------------
  // DEPENDENCY USAGE
  // ------------------------------------------

  const production =
    analyzeDependencyGroup(
      productionDependencies,
      usageMap
    );

  const development =
    analyzeDependencyGroup(
      developmentDependencies,
      usageMap
    );

  // ------------------------------------------
  // POTENTIALLY UNUSED
  // ------------------------------------------

  const potentiallyUnused = [
    ...production,
    ...development
  ]
    .filter(
      (dependency) =>
        !dependency.used
    )
    .map(
      (dependency) => ({
        name: dependency.name,

        category:
          productionDependencies.includes(
            dependency.name
          )
            ? "production"
            : "development",

        severity:
          productionDependencies.includes(
            dependency.name
          )
            ? "medium"
            : "low",

        message:
          `"${dependency.name}" is declared ` +
          `but was not detected in source imports.`
      })
    );

  // ------------------------------------------
  // MISSING DEPENDENCIES
  // ------------------------------------------

  const missingMap =
    new Map();

  usageMap.forEach(
    (usage, packageName) => {
      if (
        !dependencySet.has(
          packageName
        )
      ) {
        missingMap.set(
          packageName,
          usage
        );
      }
    }
  );

  const missing = [
    ...missingMap.entries()
  ].map(
    ([name, usage]) => ({
      name,

      severity: "high",

      message:
        `"${name}" is imported in the ` +
        `repository but is not declared ` +
        `in package.json.`,

      importCount:
        usage.importCount,

      files:
        usage.files,

      locations:
        usage.locations
    })
  );

  // ------------------------------------------
  // DEV DEPENDENCY USED IN SOURCE
  // ------------------------------------------

  const devDependencyRuntimeUsage =
    development.filter(
      (dependency) =>
        dependency.used &&
        dependency.locations.some(
          (location) =>
            location.type ===
            "source"
        )
    );

  // ------------------------------------------
  // SCRIPT INTELLIGENCE
  // ------------------------------------------

  const scriptUsage =
    analyzeScripts(
      analysis.scripts || {},
      allDependencies
    );

  // ------------------------------------------
  // STATISTICS
  // ------------------------------------------

  const totalDependencies =
    allDependencies.length;

  const usedDependencies =
    allDependencies.filter(
      (dependency) =>
        usageMap.has(dependency)
    ).length;

  const unusedDependencies =
    potentiallyUnused.length;

  const missingDependencies =
    missing.length;

  // ------------------------------------------
  // HEALTH SCORE
  // ------------------------------------------

  let score = 100;

  score -=
    missingDependencies * 15;

  score -=
    unusedDependencies * 5;

  score -=
    devDependencyRuntimeUsage.length *
    5;

  score = Math.max(
    0,
    Math.min(100, score)
  );

  let status = "healthy";

  if (score < 80) {
    status = "needs-attention";
  }

  if (score < 50) {
    status = "high-risk";
  }

  // ------------------------------------------
  // SUMMARY
  // ------------------------------------------

  let summary =
    "Dependencies appear healthy.";

  if (
    missingDependencies > 0
  ) {
    summary =
      `${missingDependencies} missing dependency ` +
      `issue(s) detected.`;
  } else if (
    unusedDependencies > 0
  ) {
    summary =
      `${unusedDependencies} potentially unused ` +
      `dependency(ies) detected.`;
  }

  return {
    score,
    status,
    summary,

    production,
    development,

    potentiallyUnused,

    missing,

    devDependencyRuntimeUsage,

    scriptUsage,

    statistics: {
      totalDependencies,
      productionDependencies:
        production.length,
      developmentDependencies:
        development.length,
      usedDependencies,
      unusedDependencies,
      missingDependencies,
      runtimeDevDependencies:
        devDependencyRuntimeUsage.length
    }
  };
}

module.exports = {
  analyzeDependencies,
  extractImports,
  getPackageName
};