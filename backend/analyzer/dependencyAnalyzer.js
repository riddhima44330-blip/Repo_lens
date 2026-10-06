const fs = require("fs");
const path = require("path");

// ==========================================
// BUILT-IN MODULES
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
// HELPERS
// ==========================================

function normalizePath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .toLowerCase();
}

function getPackageName(importPath) {
  if (!importPath) {
    return null;
  }

  const value = importPath.trim();

  // Local imports
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
    return parts.length >= 2
      ? `${parts[0]}/${parts[1]}`
      : value;
  }

  return parts[0];
}

// ==========================================
// IMPORT EXTRACTION
// ==========================================

function extractImports(content) {
  const imports = new Set();

  if (!content) {
    return [];
  }

  const patterns = [
    /require\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,

    /from\s+["'`]([^"'`]+)["'`]/g,

    /import\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,

    /import\s+["'`]([^"'`]+)["'`]/g
  ];

  patterns.forEach((pattern) => {
    let match;

    while (
      (match = pattern.exec(content)) !== null
    ) {
      const packageName =
        getPackageName(match[1]);

      if (
        packageName &&
        !BUILTIN_MODULES.has(packageName)
      ) {
        imports.add(packageName);
      }
    }
  });

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
// READ PACKAGE.JSON FILES
// ==========================================

function findPackageFiles(context) {
  const files =
    context?.structure?.files ||
    context?.scan?.files ||
    [];

  const packageFiles = [];

  files.forEach((file) => {
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
  });

  return packageFiles;
}

function readPackageJson(
  projectPath,
  packageFile
) {
  try {
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
    return null;
  }
}

// ==========================================
// PACKAGE REGISTRY
// ==========================================

function buildPackageRegistry(
  context
) {
  const projectPath =
    context?.projectPath;

  const packageFiles =
    findPackageFiles(context);

  const production = new Map();
  const development = new Map();

  packageFiles.forEach(
    (packageFile) => {
      const packageJson =
        readPackageJson(
          projectPath,
          packageFile
        );

      if (!packageJson) {
        return;
      }

      const packageDirectory =
        path.dirname(
          packageFile
        );

      const dependencies =
        packageJson.dependencies ||
        {};

      const devDependencies =
        packageJson.devDependencies ||
        {};

      Object.entries(
        dependencies
      ).forEach(
        ([name, version]) => {
          production.set(
            name,
            {
              name,
              version,
              packageFile:
                normalizePath(
                  packageFile
                ),
              packageDirectory:
                normalizePath(
                  packageDirectory
                )
            }
          );
        }
      );

      Object.entries(
        devDependencies
      ).forEach(
        ([name, version]) => {
          development.set(
            name,
            {
              name,
              version,
              packageFile:
                normalizePath(
                  packageFile
                ),
              packageDirectory:
                normalizePath(
                  packageDirectory
                )
            }
          );
        }
      );
    }
  );

  return {
    production,
    development,
    packageFiles
  };
}

// ==========================================
// SOURCE USAGE
// ==========================================

function buildUsageMap(
  context
) {
  const usageMap = new Map();

  const sourceFiles =
    context?.sourceCode?.files ||
    [];

  sourceFiles.forEach(
    (file) => {
      const filePath =
        file?.path || "";

      const content =
        file?.content || "";

      const imports =
        extractImports(
          content
        );

      imports.forEach(
        (packageName) => {

          if (
            !usageMap.has(
              packageName
            )
          ) {
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
                isTestFile(
                  filePath
                ),
              isConfig:
                isConfigFile(
                  filePath
                )
            });
        }
      );
    }
  );

  return usageMap;
}

// ==========================================
// DETERMINE RELEVANT PACKAGE
// ==========================================

function packageMatchesFile(
  dependency,
  usagePath
) {
  if (!dependency?.packageDirectory) {
    return true;
  }

  const directory =
    dependency.packageDirectory;

  const normalizedPath =
    normalizePath(
      usagePath
    );

  /*
   * Root package.json can be used
   * throughout the repository.
   */

  if (
    directory === "." ||
    directory === ""
  ) {
    return true;
  }

  /*
   * For monorepos, make sure the
   * dependency belongs to the same
   * application area.
   */

  return (
    normalizedPath === directory ||
    normalizedPath.startsWith(
      `${directory}/`
    )
  );
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

  dependencies.forEach(
    (dependency) => {
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

      results.push({
        name: dependency.name,
        version: dependency.version,
        type,
        packageFile:
          dependency.packageFile,
        used,
        runtimeUsed,
        usageCount:
          relevantUsages.length,
        importedFrom:
          relevantUsages.map(
            (usage) =>
              usage.path
          ),
        testUsage:
          testUsages.length,
        configUsage:
          configUsages.length
      });
    }
  );

  return results;
}

// ==========================================
// SCRIPT ANALYSIS
// ==========================================

function analyzeScripts(
  context,
  usageMap
) {
  const packageFiles =
    findPackageFiles(
      context
    );

  const results = [];

  packageFiles.forEach(
    (packageFile) => {
      const packageJson =
        readPackageJson(
          context.projectPath,
          packageFile
        );

      if (!packageJson) {
        return;
      }

      const scripts =
        packageJson.scripts ||
        {};

      Object.entries(
        scripts
      ).forEach(
        ([scriptName, command]) => {

          const usedPackages =
            [];

          usageMap.forEach(
            (_usages, packageName) => {
              if (
                String(command)
                  .includes(
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
      );
    }
  );

  return results;
}

// ==========================================
// MAIN ANALYZER
// ==========================================

function analyzeDependencies(
  context
) {
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

  const productionResults =
    analyzeDependencyGroup(
      [...production.values()],
      usageMap,
      "production"
    );

  const developmentResults =
    analyzeDependencyGroup(
      [...development.values()],
      usageMap,
      "development"
    );

  const allDeclared =
    new Set([
      ...production.keys(),
      ...development.keys()
    ]);

  const potentiallyUnused = [];

  [
    ...productionResults,
    ...developmentResults
  ].forEach(
    (dependency) => {

      if (
        !dependency.used
      ) {
        potentiallyUnused.push(
          dependency
        );
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

      if (
        allDeclared.has(
          packageName
        )
      ) {
        return;
      }

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

      if (
        runtimeUsages.length === 0
      ) {
        return;
      }

      missingMap.set(
        packageName,
        {
          name: packageName,
          severity: "high",
          message:
            `"${packageName}" is imported in the repository but is not declared in package.json.`,
          importedFrom:
            runtimeUsages.map(
              (usage) =>
                usage.path
            )
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
    devDependencyRuntimeUsage.length *
    5;

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
  // RESULT
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
        productionResults.length +
        developmentResults.length,

      productionDependencies:
        productionResults.length,

      developmentDependencies:
        developmentResults.length,

      usedDependencies:
        [
          ...productionResults,
          ...developmentResults
        ].filter(
          (dependency) =>
            dependency.used
        ).length,

      unusedDependencies:
        potentiallyUnused.length,

      missingDependencies:
        missing.length,

      runtimeDevDependencies:
        devDependencyRuntimeUsage.length
    }
  };
}

module.exports = {
  analyzeDependencies
};