import { useState } from "react";

import FileTree from "./FileTree";
import ArchitectureDiagram from "./ArchitectureDiagram";

import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function App() {
  // ==========================================
  // REPOSITORY STATE
  // ==========================================

  const [repoPath, setRepoPath] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ASK REPO LENS STATE
  // ==========================================

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  // ==========================================
  // ARCHITECTURE STATE
  // ==========================================

  const [architectureAnswer, setArchitectureAnswer] =
    useState("");

  const [architectureLoading, setArchitectureLoading] =
    useState(false);

  const [architectureGraph, setArchitectureGraph] =
    useState(null);

  // ==========================================
  // CODE TOUR STATE
  // ==========================================

  const [codeTour, setCodeTour] = useState(null);
  const [codeTourLoading, setCodeTourLoading] =
    useState(false);

  // ==========================================
  // DOCUMENTATION STATE
  // ==========================================

  const [documentation, setDocumentation] =
    useState(null);

  const [documentationLoading, setDocumentationLoading] =
    useState(false);

  // ==========================================
  // DOCUMENTATION DRIFT STATE
  // ==========================================

  const [documentationDrift, setDocumentationDrift] =
    useState(null);

  const [documentationDriftLoading, setDocumentationDriftLoading] =
    useState(false);

  // ==========================================
  // DEPENDENCY INTELLIGENCE STATE
  // ==========================================

  const [dependencyData, setDependencyData] =
    useState(null);

  const [dependencyLoading, setDependencyLoading] =
    useState(false);

  // ==========================================
  // ANALYZE REPOSITORY
  // ==========================================

  const analyzeRepository = async () => {
    if (!repoPath.trim()) {
      alert("Please enter a repository path");
      return;
    }

    try {
      setLoading(true);

      // Reset previous results
      setData(null);

      setAnswer("");

      setArchitectureAnswer("");
      setArchitectureGraph(null);

      setCodeTour(null);

      setDocumentation(null);

      setDocumentationDrift(null);

      setDependencyData(null);

      const url =
        `${API_URL}/api/scan?path=${encodeURIComponent(
          repoPath.trim()
        )}`;

      console.log("================================");
      console.log("SCANNING REPOSITORY");
      console.log("Repository:", repoPath);
      console.log("URL:", url);

      const response = await fetch(url);

      const text = await response.text();

      console.log(
        "Scan response:",
        text
      );

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned an invalid response:\n" +
            text
        );
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            `Server error: ${response.status}`
        );
      }

      setData(result);

      console.log(
        "Repository analyzed successfully"
      );

      console.log(result);
    } catch (error) {
      console.error(
        "SCAN ERROR:",
        error
      );

      alert(
        "Could not analyze repository.\n\n" +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ASK REPO LENS
  // ==========================================

  const askRepoLens = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (!data?.repositoryId) {
      alert(
        "Please analyze a repository first"
      );

      return;
    }

    try {
      setAsking(true);
      setAnswer("");

      console.log("================================");
      console.log("ASKING REPO LENS");

      console.log(
        "Question:",
        question
      );

      console.log(
        "Repository ID:",
        data.repositoryId
      );

      const response = await fetch(
        `${API_URL}/api/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            question:
              question.trim(),

            repositoryId:
              data.repositoryId
          })
        }
      );

      console.log(
        "Ask response status:",
        response.status
      );

      const text =
        await response.text();

      console.log(
        "Ask raw response:",
        text
      );

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned an invalid response:\n" +
            text
        );
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            `Server returned ${response.status}`
        );
      }

      if (!result.answer) {
        throw new Error(
          "Backend responded successfully, but no answer was returned."
        );
      }

      console.log(
        "RepoLens answer:",
        result.answer
      );

      console.log(
        "Answer source:",
        result.source
      );

      if (result.relevantFiles) {
        console.log(
          "Relevant files:",
          result.relevantFiles
        );
      }

      setAnswer(
        result.answer
      );
    } catch (error) {
      console.error(
        "ASK REPO LENS ERROR:",
        error
      );

      alert(
        "Could not ask RepoLens.\n\n" +
          error.message
      );
    } finally {
      setAsking(false);
    }
  };

  // ==========================================
  // EXPLAIN ARCHITECTURE
  // ==========================================

  const explainArchitecture =
    async () => {
      if (!data?.repositoryId) {
        alert(
          "Please analyze a repository first"
        );

        return;
      }

      try {
        setArchitectureLoading(true);

        setArchitectureAnswer("");

        setArchitectureGraph(null);

        console.log("================================");

        console.log(
          "EXPLAINING REPOSITORY ARCHITECTURE"
        );

        console.log(
          "Repository ID:",
          data.repositoryId
        );

        const response =
          await fetch(
            `${API_URL}/api/architecture`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                repositoryId:
                  data.repositoryId
              })
            }
          );

        const text =
          await response.text();

        console.log(
          "Architecture response:",
          text
        );

        let result;

        try {
          result =
            JSON.parse(text);
        } catch {
          throw new Error(
            "Backend returned an invalid response:\n" +
              text
          );
        }

        if (!response.ok) {
          throw new Error(
            result.details ||
              result.error ||
              `Server returned ${response.status}`
          );
        }

        if (!result.answer) {
          throw new Error(
            "Backend responded successfully, but no architecture explanation was returned."
          );
        }

        console.log(
          "Architecture explanation received"
        );

        console.log(
          "Architecture source:",
          result.source
        );

        console.log(
          "Architecture graph:",
          result.graph
        );

        console.log(
          "Architecture nodes:",
          result.graph?.nodes?.length ||
            0
        );

        console.log(
          "Architecture edges:",
          result.graph?.edges?.length ||
            0
        );

        setArchitectureAnswer(
          result.answer
        );

        setArchitectureGraph(
          result.graph || null
        );
      } catch (error) {
        console.error(
          "ARCHITECTURE ERROR:",
          error
        );

        alert(
          "Could not explain architecture.\n\n" +
            error.message
        );
      } finally {
        setArchitectureLoading(
          false
        );
      }
    };

  // ==========================================
  // CODE TOUR
  // ==========================================

  const generateCodeTour = async () => {
    if (!data?.repositoryId) {
      alert(
        "Please analyze a repository first"
      );

      return;
    }

    try {
      setCodeTourLoading(true);
      setCodeTour(null);

      console.log("================================");
      console.log("GENERATING CODE TOUR");

      console.log(
        "Repository ID:",
        data.repositoryId
      );

      const response = await fetch(
        `${API_URL}/api/code-tour`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            repositoryId:
              data.repositoryId
          })
        }
      );

      const text =
        await response.text();

      console.log(
        "Code Tour response:",
        text
      );

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned an invalid response:\n" +
            text
        );
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            `Server returned ${response.status}`
        );
      }

      console.log(
        "Code Tour generated:",
        result
      );

      setCodeTour(result);
    } catch (error) {
      console.error(
        "CODE TOUR ERROR:",
        error
      );

      alert(
        "Could not generate Code Tour.\n\n" +
          error.message
      );
    } finally {
      setCodeTourLoading(false);
    }
  };

  // ==========================================
  // DOCUMENTATION GENERATOR
  // ==========================================

  const generateDocumentation =
    async () => {
      if (!data?.repositoryId) {
        alert(
          "Please analyze a repository first"
        );

        return;
      }

      try {
        setDocumentationLoading(true);
        setDocumentation(null);

        console.log("================================");
        console.log(
          "GENERATING DOCUMENTATION"
        );

        console.log(
          "Repository ID:",
          data.repositoryId
        );

        const response =
          await fetch(
            `${API_URL}/api/documentation`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                repositoryId:
                  data.repositoryId
              })
            }
          );

        const text =
          await response.text();

        console.log(
          "Documentation response:",
          text
        );

        let result;

        try {
          result =
            JSON.parse(text);
        } catch {
          throw new Error(
            "Backend returned an invalid response:\n" +
              text
          );
        }

        if (!response.ok) {
          throw new Error(
            result.details ||
              result.error ||
              `Server returned ${response.status}`
          );
        }

        console.log(
          "Documentation generated:",
          result
        );

        setDocumentation(result);
      } catch (error) {
        console.error(
          "DOCUMENTATION ERROR:",
          error
        );

        alert(
          "Could not generate documentation.\n\n" +
            error.message
        );
      } finally {
        setDocumentationLoading(
          false
        );
      }
    };

  // ==========================================
  // DOCUMENTATION DRIFT DETECTOR
  // ==========================================

  const analyzeDocumentationDrift =
    async () => {
      if (!data?.repositoryId) {
        alert(
          "Please analyze a repository first"
        );

        return;
      }

      if (!repoPath.trim()) {
        alert(
          "Repository path is missing"
        );

        return;
      }

      try {
        setDocumentationDriftLoading(
          true
        );

        setDocumentationDrift(null);

        console.log("================================");
        console.log(
          "ANALYZING DOCUMENTATION DRIFT"
        );

        console.log(
          "Repository ID:",
          data.repositoryId
        );

        const response =
          await fetch(
            `${API_URL}/api/documentation-drift`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                repositoryId:
                  data.repositoryId,

                projectPath:
                  repoPath.trim()
              })
            }
          );

        const text =
          await response.text();

        console.log(
          "Documentation drift response:",
          text
        );

        let result;

        try {
          result =
            JSON.parse(text);
        } catch {
          throw new Error(
            "Backend returned an invalid response:\n" +
              text
          );
        }

        if (!response.ok) {
          throw new Error(
            result.details ||
              result.error ||
              `Server returned ${response.status}`
          );
        }

        console.log(
          "Documentation drift analyzed"
        );

        console.log(
          "Score:",
          result.score
        );

        console.log(
          "Issues:",
          result.issues
        );

        setDocumentationDrift(
          result
        );
      } catch (error) {
        console.error(
          "DOCUMENTATION DRIFT ERROR:",
          error
        );

        alert(
          "Could not analyze documentation drift.\n\n" +
            error.message
        );
      } finally {
        setDocumentationDriftLoading(
          false
        );
      }
    };

  // ==========================================
  // DEPENDENCY INTELLIGENCE
  // ==========================================

  const analyzeDependencies =
    async () => {
      if (!data?.repositoryId) {
        alert(
          "Please analyze a repository first"
        );

        return;
      }

      try {
        setDependencyLoading(true);

        setDependencyData(null);

        console.log("================================");
        console.log(
          "ANALYZING DEPENDENCY INTELLIGENCE"
        );

        console.log(
          "Repository ID:",
          data.repositoryId
        );

        const response =
          await fetch(
            `${API_URL}/api/dependencies`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                repositoryId:
                  data.repositoryId
              })
            }
          );

        const text =
          await response.text();

        console.log(
          "Dependency response:",
          text
        );

        let result;

        try {
          result =
            JSON.parse(text);
        } catch {
          throw new Error(
            "Backend returned an invalid response:\n" +
              text
          );
        }

        if (!response.ok) {
          throw new Error(
            result.details ||
              result.error ||
              `Server returned ${response.status}`
          );
        }

        console.log(
          "Dependency Intelligence analyzed"
        );

        console.log(
          "Dependency score:",
          result.score
        );

        console.log(
          "Missing dependencies:",
          result.missing
        );

        console.log(
          "Potentially unused:",
          result.potentiallyUnused
        );

        setDependencyData(result);
      } catch (error) {
        console.error(
          "DEPENDENCY INTELLIGENCE ERROR:",
          error
        );

        alert(
          "Could not analyze dependencies.\n\n" +
            error.message
        );
      } finally {
        setDependencyLoading(
          false
        );
      }
    };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app">

      {/* ======================================
          HEADER
          ====================================== */}

      <header>

        <h1>
          RepoLens
        </h1>

        <p>
          Understand your codebase.
        </p>

      </header>

      <main>

        {/* ====================================
            REPOSITORY SCANNER
            ==================================== */}

        <section className="scanner">

          <h2>
            Analyze Repository
          </h2>

          <div className="input-row">

            <input
              type="text"
              placeholder="Enter repository path"
              value={repoPath}
              onChange={(e) =>
                setRepoPath(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  analyzeRepository();
                }
              }}
            />

            <button
              onClick={
                analyzeRepository
              }
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze"}
            </button>

          </div>

        </section>

        {/* ====================================
            DASHBOARD
            ==================================== */}

        {data && (

          <section className="dashboard">

            {/* ==================================
                ASK REPO LENS
                ================================== */}

            <div className="ask-card">

              <div className="ask-header">

                <div>

                  <h3>
                    🧠 Ask RepoLens
                  </h3>

                  <p>
                    Ask questions about
                    your codebase
                  </p>

                </div>

              </div>

              <div className="ask-input-row">

                <input
                  type="text"
                  placeholder="How does this project work?"
                  value={question}
                  onChange={(e) =>
                    setQuestion(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      askRepoLens();
                    }
                  }}
                />

                <button
                  onClick={
                    askRepoLens
                  }
                  disabled={asking}
                >
                  {asking
                    ? "Thinking..."
                    : "Ask"}
                </button>

              </div>

              {answer && (

                <div className="answer-box">

                  <h4>
                    RepoLens
                  </h4>

                  <p>
                    {answer}
                  </p>

                </div>

              )}

            </div>

            {/* ==================================
                ARCHITECTURE EXPLAINER
                ================================== */}

            <div className="architecture-card">

              <div className="architecture-header">

                <div>

                  <h3>
                    🏗️ Architecture Explainer
                  </h3>

                  <p>
                    Understand how the major
                    components of this repository
                    interact.
                  </p>

                </div>

                <button
                  onClick={
                    explainArchitecture
                  }
                  disabled={
                    architectureLoading
                  }
                >
                  {architectureLoading
                    ? "Analyzing..."
                    : "Explain Architecture"}
                </button>

              </div>

              {architectureAnswer && (

                <div className="architecture-answer">

                  <h4>
                    Repository Architecture
                  </h4>

                  <pre>
                    {architectureAnswer}
                  </pre>

                </div>

              )}

              {architectureGraph && (

                <ArchitectureDiagram
                  graph={
                    architectureGraph
                  }
                />

              )}

            </div>

            {/* ==================================
                PROJECT NAME
                ================================== */}

            <h2>
              {data.analysis.projectName}
            </h2>

            {/* ==================================
                BASIC STATS
                ================================== */}

            <div className="cards">

              <div className="card">

                <h3>
                  Files
                </h3>

                <p>
                  {
                    data.scan.files
                      .length
                  }
                </p>

              </div>

              <div className="card">

                <h3>
                  Folders
                </h3>

                <p>
                  {
                    data.scan.folders
                      .length
                  }
                </p>

              </div>

              <div className="card">

                <h3>
                  Languages
                </h3>

                <p>
                  {
                    data.analysis
                      .languages
                      .length
                  }
                </p>

              </div>

              <div className="card">

                <h3>
                  Dependencies
                </h3>

                <p>
                  {
                    data.analysis
                      .dependencies
                      .length
                  }
                </p>

              </div>

            </div>

            {/* ==================================
                REPOSITORY HEALTH
                ================================== */}

            <div className="health-card">

              <div className="health-header">

                <div>

                  <h3>
                    Repository Health
                  </h3>

                  <p>
                    Overall repository quality
                  </p>

                </div>

                <div className="health-score">

                  {data.health.score}

                  <span>
                    /100
                  </span>

                </div>

              </div>

              <div className="health-progress">

                <div
                  className="health-progress-bar"
                  style={{
                    width:
                      `${data.health.score}%`
                  }}
                />

              </div>

              <div className="health-stats">

                <span>
                  ✓{" "}
                  {data.health.passedChecks}
                  {" "}
                  Passed
                </span>

                <span>
                  ⚠{" "}
                  {data.health.failedChecks}
                  {" "}
                  Needs attention
                </span>

              </div>

            </div>

            {/* ==================================
                README CONSISTENCY
                ================================== */}

            <div className="readme-card">

              <div className="readme-header">

                <div>

                  <h3>
                    README Consistency
                  </h3>

                  <p>
                    Documentation vs detected
                    project technologies
                  </p>

                </div>

                <div className="readme-score">

                  {data.readme.score}

                  <span>
                    /100
                  </span>

                </div>

              </div>

              <div className="readme-status">

                {data.readme
                  .mismatches
                  .length === 0 ? (

                  <span
                    className="status-success"
                  >
                    ✓ README appears consistent
                  </span>

                ) : (

                  <span
                    className="status-warning"
                  >
                    ⚠ Potential inconsistencies
                    detected
                  </span>

                )}

              </div>

              {data.readme
                .mismatches
                .length > 0 && (

                <div className="readme-mismatches">

                  <h4>
                    Potential Issues
                  </h4>

                  {data.readme
                    .mismatches
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="mismatch-item"
                          key={index}
                        >
                          ⚠{" "}
                          {item.message}
                        </div>

                      )
                    )}

                </div>

              )}

              <div className="readme-tech">

                <div>

                  <h4>
                    Mentioned in README
                  </h4>

                  <div className="tech-list">

                    {data.readme
                      .mentionedTechnologies
                      .length > 0 ? (

                      data.readme
                        .mentionedTechnologies
                        .map(
                          (
                            technology
                          ) => (

                            <span
                              className="tech-tag"
                              key={
                                technology
                              }
                            >
                              {technology}
                            </span>

                          )
                        )

                    ) : (

                      <span
                        className="muted"
                      >
                        None detected
                      </span>

                    )}

                  </div>

                </div>

                <div>

                  <h4>
                    Detected in Repository
                  </h4>

                  <div className="tech-list">

                    {data.readme
                      .detectedTechnologies
                      .length > 0 ? (

                      data.readme
                        .detectedTechnologies
                        .map(
                          (
                            technology
                          ) => (

                            <span
                              className="tech-tag"
                              key={
                                technology
                              }
                            >
                              {technology}
                            </span>

                          )
                        )

                    ) : (

                      <span
                        className="muted"
                      >
                        None detected
                      </span>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================
                CODE TOUR
                ================================== */}

            <div className="code-tour-card">

              <div className="code-tour-header">

                <div>

                  <h3>
                    🧭 Developer Code Tour
                  </h3>

                  <p>
                    Follow a recommended reading
                    order to understand the repository.
                  </p>

                </div>

              </div>

              <button
                className="code-tour-button"
                onClick={
                  generateCodeTour
                }
                disabled={
                  codeTourLoading
                }
              >
                {codeTourLoading
                  ? "Generating Code Tour..."
                  : "Generate Code Tour"}
              </button>

              {codeTour && (

                <div className="code-tour-results">

                  {codeTour.introduction && (

                    <div className="code-tour-intro">

                      <h4>
                        Recommended Reading Order
                      </h4>

                      <p>
                        {codeTour.introduction}
                      </p>

                    </div>

                  )}

                  {codeTour.steps &&
                    codeTour.steps.length > 0 && (

                    <div className="code-tour-steps">

                      {codeTour.steps.map(
                        (
                          step,
                          index
                        ) => (

                          <div
                            className="code-tour-step"
                            key={
                              step.path ||
                              index
                            }
                          >

                            <div className="code-tour-number">
                              {index + 1}
                            </div>

                            <div className="code-tour-content">

                              <div className="code-tour-path">
                                {step.path}
                              </div>

                              {step.role && (

                                <span className="code-tour-role">
                                  {step.role}
                                </span>

                              )}

                              {step.reason && (

                                <p>
                                  {step.reason}
                                </p>

                              )}

                              {!step.reason &&
                                step.description && (

                                  <p>
                                    {step.description}
                                  </p>

                                )}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

            </div>

            {/* ==================================
                DOCUMENTATION GENERATOR
                ================================== */}

            <div className="documentation-card">

              <div className="documentation-header">

                <div>

                  <h3>
                    📚 Documentation Generator
                  </h3>

                  <p>
                    Generate structured Markdown
                    documentation from the analyzed
                    repository.
                  </p>

                </div>

              </div>

              <button
                className="documentation-button"
                onClick={
                  generateDocumentation
                }
                disabled={
                  documentationLoading
                }
              >
                {documentationLoading
                  ? "Generating Documentation..."
                  : "Generate Documentation"}
              </button>

              {documentation && (

                <div className="documentation-results">

                  <div className="documentation-meta">

                    <h4>
                      {documentation.projectName ||
                        data.analysis.projectName}
                    </h4>

                    <span>
                      Source:{" "}
                      {documentation.source ||
                        "deterministic"}
                    </span>

                  </div>

                  <div className="documentation-preview">

                    <pre>
                      {documentation.markdown}
                    </pre>

                  </div>

                </div>

              )}

            </div>

            {/* ==================================
                DOCUMENTATION DRIFT DETECTOR
                ================================== */}

            <div className="drift-card">

              <div className="drift-header">

                <div>

                  <h3>
                    🔍 Documentation Drift Detector
                  </h3>

                  <p>
                    Compare README claims with the
                    actual repository.
                  </p>

                </div>

                {documentationDrift && (

                  <div className="drift-score">

                    {documentationDrift.score}

                    <span>
                      /100
                    </span>

                  </div>

                )}

              </div>

              <button
                className="drift-button"
                onClick={
                  analyzeDocumentationDrift
                }
                disabled={
                  documentationDriftLoading
                }
              >
                {documentationDriftLoading
                  ? "Analyzing Documentation..."
                  : "Check Documentation Drift"}
              </button>

              {documentationDrift && (

                <div className="drift-results">

                  <div className="drift-summary">

                    <h4>

                      {documentationDrift.status ===
                      "healthy"

                        ? "✓ Documentation looks healthy"

                        : documentationDrift.status ===
                          "needs-attention"

                        ? "⚠ Documentation needs attention"

                        : "🚨 Significant documentation drift"}

                    </h4>

                    <p>
                      {
                        documentationDrift.summary
                      }
                    </p>

                  </div>

                  {documentationDrift.statistics && (

                    <div className="drift-stats">

                      <div className="drift-stat">

                        <span>
                          Issues
                        </span>

                        <strong>
                          {
                            documentationDrift
                              .statistics
                              .totalIssues
                          }
                        </strong>

                      </div>

                      <div className="drift-stat">

                        <span>
                          High
                        </span>

                        <strong>
                          {
                            documentationDrift
                              .statistics
                              .highSeverity
                          }
                        </strong>

                      </div>

                      <div className="drift-stat">

                        <span>
                          Medium
                        </span>

                        <strong>
                          {
                            documentationDrift
                              .statistics
                              .mediumSeverity
                          }
                        </strong>

                      </div>

                      <div className="drift-stat">

                        <span>
                          Low
                        </span>

                        <strong>
                          {
                            documentationDrift
                              .statistics
                              .lowSeverity
                          }
                        </strong>

                      </div>

                    </div>

                  )}

                  {documentationDrift.issues &&
                    documentationDrift.issues.length >
                      0 && (

                    <div className="drift-issues">

                      <h4>
                        Detected Issues
                      </h4>

                      {documentationDrift.issues.map(
                        (
                          issue,
                          index
                        ) => (

                          <div
                            className="drift-issue"
                            key={index}
                          >

                            <div className="drift-issue-top">

                              <span
                                className={`drift-severity ${issue.severity}`}
                              >
                                {issue.severity}
                              </span>

                              <span className="drift-type">
                                {issue.type}
                              </span>

                            </div>

                            <p>
                              {issue.message}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  )}

                  {documentationDrift.issues &&
                    documentationDrift.issues.length ===
                      0 && (

                    <div className="drift-clean">
                      ✓ No documentation drift detected.
                    </div>

                  )}

                </div>

              )}

            </div>

            {/* ==================================
                DEPENDENCY INTELLIGENCE
                ================================== */}

            <div className="dependency-intelligence-card">

              <div className="dependency-intelligence-header">

                <div>

                  <h3>
                    📦 Dependency Intelligence
                  </h3>

                  <p>
                    Analyze dependency usage,
                    missing packages, unused packages,
                    and npm script relationships.
                  </p>

                </div>

                {dependencyData && (

                  <div className="dependency-score">

                    {dependencyData.score}

                    <span>
                      /100
                    </span>

                  </div>

                )}

              </div>

              <button
                className="dependency-intelligence-button"
                onClick={
                  analyzeDependencies
                }
                disabled={
                  dependencyLoading
                }
              >
                {dependencyLoading
                  ? "Analyzing Dependencies..."
                  : "Analyze Dependencies"}
              </button>

              {dependencyData && (

                <div className="dependency-intelligence-results">

                  {/* SUMMARY */}

                  <div className="dependency-summary">

                    <h4>

                      {dependencyData.status ===
                      "healthy"

                        ? "✓ Dependencies look healthy"

                        : dependencyData.status ===
                          "needs-attention"

                        ? "⚠ Dependencies need attention"

                        : "🚨 Dependency issues detected"}

                    </h4>

                    <p>
                      {
                        dependencyData.summary
                      }
                    </p>

                  </div>

                  {/* STATISTICS */}

                  {dependencyData.statistics && (

                    <div className="dependency-stats">

                      <div className="dependency-stat">

                        <span>
                          Total
                        </span>

                        <strong>
                          {
                            dependencyData
                              .statistics
                              .totalDependencies
                          }
                        </strong>

                      </div>

                      <div className="dependency-stat">

                        <span>
                          Used
                        </span>

                        <strong>
                          {
                            dependencyData
                              .statistics
                              .usedDependencies
                          }
                        </strong>

                      </div>

                      <div className="dependency-stat">

                        <span>
                          Potentially Unused
                        </span>

                        <strong>
                          {
                            dependencyData
                              .statistics
                              .unusedDependencies
                          }
                        </strong>

                      </div>

                      <div className="dependency-stat">

                        <span>
                          Missing
                        </span>

                        <strong>
                          {
                            dependencyData
                              .statistics
                              .missingDependencies
                          }
                        </strong>

                      </div>

                    </div>

                  )}

                  {/* PRODUCTION DEPENDENCIES */}

                  {dependencyData.production &&
                    dependencyData.production.length >
                      0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        Production Dependencies
                      </h4>

                      <div className="dependency-analysis-list">

                        {dependencyData.production.map(
                          (
                            dependency
                          ) => (

                            <div
                              className="dependency-analysis-item"
                              key={
                                dependency.name
                              }
                            >

                              <div className="dependency-analysis-top">

                                <strong>
                                  {dependency.name}
                                </strong>

                                <span
                                  className={
                                    dependency.used
                                      ? "dependency-used"
                                      : "dependency-unused"
                                  }
                                >
                                  {dependency.used
                                    ? "Used"
                                    : "Not detected"}
                                </span>

                              </div>

                              {dependency.used && (

                                <p>
                                  Imported{" "}
                                  {
                                    dependency.importCount
                                  }{" "}
                                  time
                                  {dependency.importCount !==
                                  1
                                    ? "s"
                                    : ""}{" "}
                                  across{" "}
                                  {
                                    dependency.files
                                      .length
                                  }{" "}
                                  file
                                  {dependency.files
                                    .length !== 1
                                    ? "s"
                                    : ""}.
                                </p>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* DEVELOPMENT DEPENDENCIES */}

                  {dependencyData.development &&
                    dependencyData.development.length >
                      0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        Development Dependencies
                      </h4>

                      <div className="dependency-analysis-list">

                        {dependencyData.development.map(
                          (
                            dependency
                          ) => (

                            <div
                              className="dependency-analysis-item"
                              key={
                                dependency.name
                              }
                            >

                              <div className="dependency-analysis-top">

                                <strong>
                                  {dependency.name}
                                </strong>

                                <span
                                  className={
                                    dependency.used
                                      ? "dependency-used"
                                      : "dependency-unused"
                                  }
                                >
                                  {dependency.used
                                    ? "Used"
                                    : "Not detected"}
                                </span>

                              </div>

                              {dependency.used && (

                                <p>
                                  Imported{" "}
                                  {
                                    dependency.importCount
                                  }{" "}
                                  time
                                  {dependency.importCount !==
                                  1
                                    ? "s"
                                    : ""}{" "}
                                  across{" "}
                                  {
                                    dependency.files
                                      .length
                                  }{" "}
                                  file
                                  {dependency.files
                                    .length !== 1
                                    ? "s"
                                    : ""}.
                                </p>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* POTENTIALLY UNUSED */}

                  {dependencyData.potentiallyUnused &&
                    dependencyData.potentiallyUnused
                      .length > 0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        ⚠ Potentially Unused Dependencies
                      </h4>

                      <p className="dependency-section-description">
                        These dependencies are declared
                        but were not detected in source
                        imports. They may still be used
                        dynamically or through configuration.
                      </p>

                      <div className="dependency-warning-list">

                        {dependencyData.potentiallyUnused.map(
                          (
                            dependency
                          ) => (

                            <div
                              className="dependency-warning-item"
                              key={
                                dependency.name
                              }
                            >

                              <div>

                                <strong>
                                  {
                                    dependency.name
                                  }
                                </strong>

                                <span>
                                  {
                                    dependency.category
                                  }
                                </span>

                              </div>

                              <p>
                                {
                                  dependency.message
                                }
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* MISSING DEPENDENCIES */}

                  {dependencyData.missing &&
                    dependencyData.missing
                      .length > 0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        🚨 Missing Dependencies
                      </h4>

                      <p className="dependency-section-description">
                        These packages are imported by
                        the source code but are not declared
                        in package.json.
                      </p>

                      <div className="dependency-missing-list">

                        {dependencyData.missing.map(
                          (
                            dependency
                          ) => (

                            <div
                              className="dependency-missing-item"
                              key={
                                dependency.name
                              }
                            >

                              <div className="dependency-missing-top">

                                <strong>
                                  {
                                    dependency.name
                                  }
                                </strong>

                                <span>
                                  HIGH
                                </span>

                              </div>

                              <p>
                                {
                                  dependency.message
                                }
                              </p>

                              {dependency.files &&
                                dependency.files.length >
                                  0 && (

                                <div className="dependency-files">

                                  <span>
                                    Imported from:
                                  </span>

                                  {dependency.files.map(
                                    (
                                      file
                                    ) => (

                                      <code
                                        key={file}
                                      >
                                        {file}
                                      </code>

                                    )
                                  )}

                                </div>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* DEV DEPENDENCY RUNTIME USAGE */}

                  {dependencyData.devDependencyRuntimeUsage &&
                    dependencyData
                      .devDependencyRuntimeUsage
                      .length > 0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        ⚠ Development Dependencies Used at Runtime
                      </h4>

                      <p className="dependency-section-description">
                        These packages are declared as
                        development dependencies but were
                        detected in regular source files.
                      </p>

                      <div className="dependency-warning-list">

                        {dependencyData
                          .devDependencyRuntimeUsage
                          .map(
                            (
                              dependency
                            ) => (

                              <div
                                className="dependency-warning-item"
                                key={
                                  dependency.name
                                }
                              >

                                <div>

                                  <strong>
                                    {
                                      dependency.name
                                    }
                                  </strong>

                                  <span>
                                    devDependency
                                  </span>

                                </div>

                                <p>
                                  This dependency appears
                                  to be used by runtime
                                  source code.
                                </p>

                              </div>

                            )
                          )}

                      </div>

                    </div>

                  )}

                  {/* NPM SCRIPT INTELLIGENCE */}

                  {dependencyData.scriptUsage &&
                    dependencyData.scriptUsage.length >
                      0 && (

                    <div className="dependency-analysis-section">

                      <h4>
                        ⚙️ NPM Script Intelligence
                      </h4>

                      <div className="script-analysis-list">

                        {dependencyData.scriptUsage.map(
                          (
                            script
                          ) => (

                            <div
                              className="script-analysis-item"
                              key={
                                script.script
                              }
                            >

                              <div className="script-analysis-top">

                                <strong>
                                  npm run{" "}
                                  {script.script}
                                </strong>

                                <code>
                                  {script.command}
                                </code>

                              </div>

                              {script.dependencies &&
                                script.dependencies.length >
                                  0 ? (

                                <div className="script-dependencies">

                                  <span>
                                    Related dependencies:
                                  </span>

                                  {script.dependencies.map(
                                    (
                                      dependency
                                    ) => (

                                      <span
                                        className="script-dependency-tag"
                                        key={
                                          dependency
                                        }
                                      >
                                        {dependency}
                                      </span>

                                    )
                                  )}

                                </div>

                              ) : (

                                <span className="script-no-dependencies">
                                  No direct dependency
                                  relationship detected
                                </span>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* CLEAN STATE */}

                  {dependencyData.missing?.length === 0 &&
                    dependencyData.potentiallyUnused
                      ?.length === 0 && (

                    <div className="dependency-clean">
                      ✓ No missing or potentially unused
                      dependencies detected.
                    </div>

                  )}

                </div>

              )}

            </div>

            {/* ==================================
                LANGUAGES
                ================================== */}

            <div className="info-section">

              <h3>
                Languages
              </h3>

              <p>

                {data.analysis.languages
                  .length > 0

                  ? data.analysis.languages
                      .join(", ")

                  : "None detected"}

              </p>

            </div>

            {/* ==================================
                FRAMEWORKS
                ================================== */}

            <div className="info-section">

              <h3>
                Frameworks
              </h3>

              <p>

                {data.analysis.frameworks
                  .length > 0

                  ? data.analysis.frameworks
                      .join(", ")

                  : "None detected"}

              </p>

            </div>

            {/* ==================================
                TOOLS
                ================================== */}

            <div className="info-section">

              <h3>
                Tools
              </h3>

              <p>

                {data.analysis.tools
                  .length > 0

                  ? data.analysis.tools
                      .join(", ")

                  : "None detected"}

              </p>

            </div>

            {/* ==================================
                DEPENDENCIES
                ================================== */}

            <div className="info-section dependency-section">

              <h3>
                Dependencies
              </h3>

              {/* PRODUCTION */}

              <div className="dependency-group">

                <h4>
                  Production Dependencies
                </h4>

                {data.analysis.dependencies
                  .length > 0 ? (

                  <div className="dependency-list">

                    {data.analysis
                      .dependencies
                      .map(
                        (
                          dependency
                        ) => (

                          <span
                            className="dependency-tag"
                            key={
                              dependency
                            }
                          >
                            {dependency}
                          </span>

                        )
                      )}

                  </div>

                ) : (

                  <p>
                    No production dependencies
                  </p>

                )}

              </div>

              {/* DEVELOPMENT */}

              <div className="dependency-group">

                <h4>
                  Development Dependencies
                </h4>

                {data.analysis
                  .devDependencies
                  .length > 0 ? (

                  <div className="dependency-list">

                    {data.analysis
                      .devDependencies
                      .map(
                        (
                          dependency
                        ) => (

                          <span
                            className="dependency-tag"
                            key={
                              dependency
                            }
                          >
                            {dependency}
                          </span>

                        )
                      )}

                  </div>

                ) : (

                  <p>
                    No development dependencies
                  </p>

                )}

              </div>

            </div>

            {/* ==================================
                PROJECT STRUCTURE
                ================================== */}

            <div className="info-section">

              <h3>
                Project Structure
              </h3>

              <FileTree
                files={
                  data.scan.files
                }
                folders={
                  data.scan.folders
                }
              />

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;