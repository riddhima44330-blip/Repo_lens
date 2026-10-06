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
    throw new Error(
      "Only GitHub repository URLs are supported"
    );
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error(
      "Invalid GitHub repository URL"
    );
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error(
      "Could not determine GitHub repository"
    );
  }

  console.log(
    `Preparing GitHub repository: ${owner}/${repo}`
  );

  // ==========================================
  // CREATE TEMP DIRECTORY
  // ==========================================

  const tempDir = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "repolens-"
    )
  );

  const archivePath = path.join(
    tempDir,
    "repository.tar.gz"
  );

  const extractDir = path.join(
    tempDir,
    "repository"
  );

  fs.mkdirSync(
    extractDir,
    {
      recursive: true
    }
  );

  // ==========================================
  // TRY MAIN / MASTER
  // ==========================================

  const branches = [
    "main",
    "master"
  ];

  let downloaded = false;

  for (const branch of branches) {

    const archiveUrl =
      `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.tar.gz`;

    console.log(
      `Trying GitHub branch: ${branch}`
    );

    try {

      const response =
        await fetch(archiveUrl);

      if (!response.ok) {

        console.log(
          `Branch ${branch} unavailable: HTTP ${response.status}`
        );

        continue;
      }

      const buffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      fs.writeFileSync(
        archivePath,
        buffer
      );

      downloaded = true;

      console.log(
        `Repository downloaded from ${branch}`
      );

      break;

    } catch (error) {

      console.log(
        `Download attempt failed for ${branch}:`,
        error.message
      );

    }
  }

  if (!downloaded) {

    fs.rmSync(
      tempDir,
      {
        recursive: true,
        force: true
      }
    );

    throw new Error(
      "Could not download the GitHub repository. Make sure the repository is public and the URL is correct."
    );
  }

  // ==========================================
  // EXTRACT REPOSITORY
  // ==========================================

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

    fs.rmSync(
      tempDir,
      {
        recursive: true,
        force: true
      }
    );

    throw new Error(
      "Could not extract the GitHub repository archive"
    );
  }

  // ==========================================
  // FIND EXTRACTED DIRECTORY
  // ==========================================

  const items =
    fs.readdirSync(
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

    fs.rmSync(
      tempDir,
      {
        recursive: true,
        force: true
      }
    );

    throw new Error(
      "The downloaded GitHub repository was empty"
    );
  }

  const projectPath =
    path.join(
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