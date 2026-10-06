const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

async function downloadRepository(repositoryUrl) {
  if (!repositoryUrl) {
    throw new Error("GitHub repository URL is required");
  }

  let url;

  try {
    url = new URL(repositoryUrl);
  } catch {
    throw new Error("Invalid GitHub repository URL");
  }

  if (
    url.hostname !== "github.com" &&
    url.hostname !== "www.github.com"
  ) {
    throw new Error("Only GitHub repository URLs are supported");
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");

  console.log(
    `Preparing GitHub repository: ${owner}/${repo}`
  );

  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "repolens-")
  );

  const archivePath = path.join(
    tempDir,
    "repository.tar.gz"
  );

  const extractDir = path.join(
    tempDir,
    "repository"
  );

  fs.mkdirSync(extractDir, {
    recursive: true
  });

  // RepoLens currently supports the main branch.
  const archiveUrl =
    `https://codeload.github.com/${owner}/${repo}/tar.gz/refs/heads/main`;

  console.log(
    "Downloading from:",
    archiveUrl
  );

  try {
    const response = await fetch(
      archiveUrl,
      {
        headers: {
          "User-Agent": "RepoLens"
        }
      }
    );

    console.log(
      "GitHub response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });

      throw new Error(
        `GitHub returned HTTP ${response.status} ${response.statusText}`
      );
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    fs.writeFileSync(
      archivePath,
      buffer
    );

    console.log(
      "Repository downloaded successfully."
    );

  } catch (error) {

    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });

    throw new Error(
      `Could not download GitHub repository. ${error.message}`
    );
  }

  console.log(
    "Extracting repository..."
  );

  try {
    execFileSync(
      "tar",
      [
        "-xzf",
        archivePath,
        "-C",
        extractDir
      ],
      {
        stdio: "pipe"
      }
    );

  } catch (error) {

    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });

    throw new Error(
      `Could not extract repository archive: ${error.message}`
    );
  }

  const items = fs.readdirSync(
    extractDir,
    {
      withFileTypes: true
    }
  );

  const repositoryDirectory =
    items.find(
      item => item.isDirectory()
    );

  if (!repositoryDirectory) {

    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });

    throw new Error(
      "Downloaded repository archive was empty"
    );
  }

  const projectPath = path.join(
    extractDir,
    repositoryDirectory.name
  );

  console.log(
    "Repository extracted to:",
    projectPath
  );

  return projectPath;
}

module.exports = {
  downloadRepository
};