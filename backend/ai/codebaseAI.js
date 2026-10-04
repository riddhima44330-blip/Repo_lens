const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askCodebaseAI(question, relevantFiles, repositoryContext) {

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured in backend/.env"
    );
  }

  const fileContext = relevantFiles
    .map((file) => {
      return `
FILE: ${file.path}

SOURCE CODE:
${file.content}
`;
    })
    .join("\n\n--------------------------------\n\n");

  const repositoryInfo = `
PROJECT: ${repositoryContext.project?.name || "Unknown"}

LANGUAGES:
${(repositoryContext.technology?.languages || []).join(", ")}

FRAMEWORKS:
${(repositoryContext.technology?.frameworks || []).join(", ")}

TOOLS:
${(repositoryContext.technology?.tools || []).join(", ")}

HEALTH SCORE:
${repositoryContext.health?.score ?? "Unknown"}/100
`;

  const prompt = `
You are RepoLens, an AI codebase analysis assistant.

Your job is to answer questions about a software repository using ONLY
the repository information and source code provided below.

Do not invent files, functions, technologies, or behavior that are not
supported by the provided repository context.

If the provided files are insufficient to answer the question, clearly
say that more repository context is needed.

Give a clear, technical but beginner-friendly explanation.

When useful:
- mention the relevant file
- mention relevant functions/classes
- explain the flow step by step
- explain how files interact
- distinguish facts from reasonable inference

REPOSITORY INFORMATION:
${repositoryInfo}

RELEVANT SOURCE FILES:
${fileContext}

USER QUESTION:
${question}
`;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt
  });

  return response.output_text;
}

module.exports = {
  askCodebaseAI
};