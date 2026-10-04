const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function explainArchitecture(
  context,
  relevantFiles
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured in backend/.env"
    );
  }

  const project = context.project || {};
  const technology = context.technology || {};
  const structure = context.structure || {};

  const fileContext = relevantFiles
    .map((file) => {
      return `
FILE: ${file.path}

SOURCE CODE:
${file.content}
`;
    })
    .join(
      "\n\n--------------------------------\n\n"
    );

  const prompt = `
You are RepoLens, an AI software architecture analyst.

Analyze the provided repository information and source files.

Your goal is to explain how this software repository is structured
and how its major components interact.

IMPORTANT RULES:

1. Use only the repository information and source code provided.
2. Do not invent components or relationships.
3. Clearly distinguish direct evidence from reasonable inference.
4. Focus on actual architecture, not generic software architecture advice.
5. Mention actual file paths whenever possible.
6. Explain the request/data flow in a logical order.
7. Keep the explanation understandable to a developer who is new to
   this repository.

PROJECT:
${project.name || "Unknown"}

LANGUAGES:
${(technology.languages || []).join(", ")}

FRAMEWORKS:
${(technology.frameworks || []).join(", ")}

TOOLS:
${(technology.tools || []).join(", ")}

TOTAL FILES:
${structure.totalFiles || 0}

TOTAL FOLDERS:
${structure.totalFolders || 0}

IMPORTANT SOURCE FILES:
${fileContext}

Return the answer using this structure:

## Architecture Overview

Briefly explain what the repository appears to contain.

## Major Components

List the important components and their actual file paths.

## Data Flow

Explain how information moves through the system.

Use arrows where helpful.

Example:

Frontend → API → Analyzer → Context → AI

Only use relationships supported by the repository.

## Frontend

Explain the frontend responsibilities and important files.

## Backend

Explain the backend responsibilities and important files.

## AI / Intelligence Layer

Explain how AI or code intelligence is integrated, if present.

## Developer Starting Points

Recommend 3-5 files a new developer should read first,
with a short reason for each.
`;

  const response =
    await client.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

  return response.output_text;
}

module.exports = {
  explainArchitecture
};