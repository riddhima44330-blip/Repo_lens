function generateDocumentation(context) {
  const projectName =
    context?.project?.name ||
    context?.analysis?.projectName ||
    "Repository";

  const structure = context?.structure || {};
  const technology = context?.technology || {};
  const dependencies = context?.dependencies || {};
  const health = context?.health || {};
  const documentation = context?.documentation || {};

  const files = structure.files || [];
  const folders = structure.folders || [];

  const languages = technology.languages || [];
  const frameworks = technology.frameworks || [];
  const tools = technology.tools || [];

  const productionDependencies =
    dependencies.production || [];

  const developmentDependencies =
    dependencies.development || [];

  const markdown = [];

  markdown.push(`# ${projectName}`);
  markdown.push("");

  markdown.push("## 📌 Project Overview");
  markdown.push("");
  markdown.push(
    `RepoLens-generated documentation for **${projectName}**.`
  );
  markdown.push("");

  markdown.push(
    `This repository contains **${files.length} files** across **${folders.length} folders**.`
  );
  markdown.push("");

  markdown.push("## 🛠️ Technology Stack");
  markdown.push("");

  if (languages.length > 0) {
    markdown.push(
      `- **Languages:** ${languages.join(", ")}`
    );
  }

  if (frameworks.length > 0) {
    markdown.push(
      `- **Frameworks:** ${frameworks.join(", ")}`
    );
  }

  if (tools.length > 0) {
    markdown.push(
      `- **Tools:** ${tools.join(", ")}`
    );
  }

  if (
    languages.length === 0 &&
    frameworks.length === 0 &&
    tools.length === 0
  ) {
    markdown.push("- No technology information detected.");
  }

  markdown.push("");

  markdown.push("## 🏗️ Architecture");
  markdown.push("");
  markdown.push(
    "The repository is organized into the following major areas:"
  );
  markdown.push("");

  const categories = {
    "Frontend": [],
    "API / Routes": [],
    "AI": [],
    "Analysis": [],
    "Backend": [],
    "Tests": [],
    "Other": []
  };

  for (const file of files) {
    const filePath =
      typeof file === "string"
        ? file
        : file?.path || "";

    if (!filePath) continue;

    const normalized = filePath
      .replace(/\\/g, "/")
      .toLowerCase();

    if (
      normalized.includes("/test/") ||
      normalized.includes("/tests/") ||
      normalized.includes(".test.") ||
      normalized.includes(".spec.")
    ) {
      categories["Tests"].push(filePath);
    } else if (
      normalized.includes("/ai/") ||
      normalized.includes("codebaseai") ||
      normalized.includes("architectureai")
    ) {
      categories["AI"].push(filePath);
    } else if (
      normalized.includes("/routes/")
    ) {
      categories["API / Routes"].push(filePath);
    } else if (
      normalized.includes("/analyzer/")
    ) {
      categories["Analysis"].push(filePath);
    } else if (
      normalized.startsWith("backend/") ||
      normalized.includes("/backend/")
    ) {
      categories["Backend"].push(filePath);
    } else if (
      normalized.startsWith("replens/") ||
      normalized.includes("/src/") ||
      normalized.endsWith(".jsx") ||
      normalized.endsWith(".tsx")
    ) {
      categories["Frontend"].push(filePath);
    } else {
      categories["Other"].push(filePath);
    }
  }

  for (const [category, categoryFiles] of Object.entries(
    categories
  )) {
    if (categoryFiles.length === 0) continue;

    markdown.push(`### ${category}`);
    markdown.push("");

    categoryFiles
      .slice(0, 20)
      .forEach(filePath => {
        markdown.push(`- \`${filePath}\``);
      });

    if (categoryFiles.length > 20) {
      markdown.push(
        `- ... and ${categoryFiles.length - 20} more`
      );
    }

    markdown.push("");
  }

  markdown.push("## 📁 Project Structure");
  markdown.push("");

  if (folders.length > 0) {
    folders.slice(0, 100).forEach(folder => {
      const folderPath =
        typeof folder === "string"
          ? folder
          : folder?.path || "";

      if (folderPath) {
        markdown.push(`- 📁 \`${folderPath}\``);
      }
    });
  }

  if (files.length > 0) {
    files.slice(0, 100).forEach(file => {
      const filePath =
        typeof file === "string"
          ? file
          : file?.path || "";

      if (filePath) {
        markdown.push(`- 📄 \`${filePath}\``);
      }
    });
  }

  if (
    folders.length === 0 &&
    files.length === 0
  ) {
    markdown.push(
      "No project structure information detected."
    );
  }

  markdown.push("");

  markdown.push("## 📦 Dependencies");
  markdown.push("");

  markdown.push("### Production Dependencies");
  markdown.push("");

  if (productionDependencies.length > 0) {
    productionDependencies.forEach(dep => {
      markdown.push(`- \`${dep}\``);
    });
  } else {
    markdown.push(
      "No production dependencies detected."
    );
  }

  markdown.push("");

  markdown.push("### Development Dependencies");
  markdown.push("");

  if (developmentDependencies.length > 0) {
    developmentDependencies.forEach(dep => {
      markdown.push(`- \`${dep}\``);
    });
  } else {
    markdown.push(
      "No development dependencies detected."
    );
  }

  markdown.push("");

  markdown.push("## 🩺 Repository Health");
  markdown.push("");
  markdown.push(
    `Health Score: **${health.score ?? "N/A"}/100**`
  );
  markdown.push("");

  if (health.passedChecks !== undefined) {
    markdown.push(
      `- Passed checks: ${health.passedChecks}`
    );
  }

  if (health.failedChecks !== undefined) {
    markdown.push(
      `- Checks needing attention: ${health.failedChecks}`
    );
  }

  markdown.push("");

  markdown.push("## 📖 README Consistency");
  markdown.push("");

  markdown.push(
    `Documentation consistency score: **${documentation.score ?? "N/A"}/100**`
  );
  markdown.push("");

  if (
    documentation.mismatches &&
    documentation.mismatches.length > 0
  ) {
    markdown.push(
      "The following README technology mismatches were detected:"
    );
    markdown.push("");

    documentation.mismatches.forEach(item => {
      markdown.push(`- ${item}`);
    });
  } else {
    markdown.push(
      "No README technology mismatches were detected."
    );
  }

  markdown.push("");

  markdown.push("## 🧭 Developer Starting Point");
  markdown.push("");

  markdown.push(
    "When exploring this repository, start with the main application entry points and then follow the API and analysis modules."
  );
  markdown.push("");

  markdown.push(
    "1. `App.jsx` — Main frontend application."
  );
  markdown.push(
    "2. `server.js` — Backend entry point."
  );
  markdown.push(
    "3. Explore the API routes."
  );
  markdown.push(
    "4. Explore the repository analyzers."
  );
  markdown.push(
    "5. Explore the AI modules."
  );

  markdown.push("");
  markdown.push("---");
  markdown.push("");
  markdown.push(
    "Generated automatically by **RepoLens**."
  );

  return {
    projectName,
    markdown: markdown.join("\n"),
    source: "deterministic"
  };
}

module.exports = {
  generateDocumentation
};