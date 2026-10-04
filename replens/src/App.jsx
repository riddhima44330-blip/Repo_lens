import { useState } from "react";

import FileTree from "./FileTree";

import ArchitectureDiagram from "./ArchitectureDiagram";

import "./App.css";

function App() {
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
  // ARCHITECTURE EXPLAINER STATE
  // ==========================================

  const [
    architectureAnswer,
    setArchitectureAnswer
  ] = useState("");

  const [
    architectureLoading,
    setArchitectureLoading
  ] = useState(false);

  const [
    architectureGraph,
    setArchitectureGraph
  ] = useState(null);


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

      setData(null);

      setAnswer("");

      setArchitectureAnswer("");

      setArchitectureGraph(null);

      const url =
        `http://localhost:5000/api/scan?path=${encodeURIComponent(
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

    if (!data) {
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
        "http://localhost:5000/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
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
        setArchitectureLoading(
          true
        );

        setArchitectureAnswer(
          ""
        );

        setArchitectureGraph(
          null
        );

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
            "http://localhost:5000/api/architecture",
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


              {/* ANSWER */}

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


              {/* ARCHITECTURE ANSWER */}

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


              {/* DYNAMIC ARCHITECTURE GRAPH */}

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
                  {data.scan.files.length}
                </p>

              </div>


              <div className="card">

                <h3>
                  Folders
                </h3>

                <p>
                  {data.scan.folders.length}
                </p>

              </div>


              <div className="card">

                <h3>
                  Languages
                </h3>

                <p>
                  {data.analysis.languages.length}
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


                {/* README TECHNOLOGIES */}

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


                {/* DETECTED TECHNOLOGIES */}

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

            <div
              className=
                "info-section dependency-section"
            >

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
                            className=
                              "dependency-tag"

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
                            className=
                              "dependency-tag"

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