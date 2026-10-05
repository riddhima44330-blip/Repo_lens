# RepoLens

> Understand your codebase before you touch the code.

RepoLens is an intelligent repository analysis platform that helps developers quickly understand an unfamiliar codebase.

Instead of only generating AI answers, RepoLens combines deterministic repository analysis with AI-powered code understanding to provide insights into architecture, dependencies, documentation, code structure, and developer onboarding.

---

## ✨ Features

### 🔍 Repository Scanner
Automatically scans a repository and identifies:

- Project structure
- Files and folders
- Programming languages
- Frameworks
- Dependencies
- Package managers
- Project scripts

### 📊 Repository Health Index
Evaluates the repository using checks such as:

- README presence
- `.gitignore`
- `package.json`
- Lockfile
- Test configuration
- Available scripts

Generates an overall repository health score.

### 💬 Ask RepoLens
Ask questions about the codebase in natural language.

Examples:

- Where is repository scanning implemented?
- How does the backend work?
- How does Ask RepoLens work?
- Where is the file tree implemented?

RepoLens identifies relevant files before generating an explanation.

### 🏗 Architecture Intelligence

Automatically analyzes local imports and relationships between source files to generate an architecture graph.

The graph identifies areas such as:

- Frontend
- Backend
- API
- AI
- Analysis
- Data
- Configuration

### 🧭 Developer Code Tour

Generates a recommended reading order for developers who are new to the repository.

It identifies important files and explains their role in the overall architecture.

### 📄 Documentation Generator

Generates structured project documentation containing:

- Project overview
- Technology stack
- Architecture
- Project structure
- Dependencies
- Repository health
- README consistency
- Developer starting point

### ⚠️ Documentation Drift Detector

Checks whether the README still matches the actual repository.

It can identify:

- Outdated technology references
- Undocumented technologies
- Missing file references
- Missing installation instructions
- Missing usage sections

### 📦 Dependency Intelligence

Analyzes project dependencies and identifies:

- Production dependencies
- Development dependencies
- Potentially unused dependencies
- Missing dependencies
- Development dependencies used at runtime
- Script dependency usage

---

## 🧠 How RepoLens Works

```text
                    Repository
                         │
                         ▼
                 ┌───────────────┐
                 │ Repository    │
                 │ Scanner       │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Project       │
                 │ Analyzer      │
                 └───────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Health         README         Source Code
      Analyzer       Analyzer        Analyzer
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 Repository Context
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    Architecture     Dependency      Documentation
      Analysis       Intelligence      Drift
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  Relevant File Finder
                         │
                         ▼
                    Codebase AI
                         │
                         ▼
                   Ask RepoLens