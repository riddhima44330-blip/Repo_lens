const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

function downloadRepository(repositoryUrl) {
  if (!repositoryUrl) {
    throw new Error("GitHub repository URL is required");
  }

  let url;

  try {
    url = new URL(repositoryUrl);
  } catch {
    throw new Error("Invalid repository URL");
  }

  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    throw new Error("Only GitHub repository URLs are supported");
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL");
  }

  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "repolens-")
  );

  try {
    execFileSync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        repositoryUrl,
        tempDir
      ],
      {
        stdio: "pipe"
      }
    );

    return tempDir;
  } catch (error) {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });

    throw new Error(
      "Could not download the GitHub repository"
    );
  }
}

module.exports = {
  downloadRepository
};