import { useEffect, useMemo, useState } from "react";
import { sections } from "./questions";
import type { Answer, AnswerValue, DiscoveryState, EvidenceStatus, Question } from "./types";
import { buildHarnessJson, buildMarkdown, downloadText } from "./export";

const STORAGE_KEY = "discovery-console:v1";

const defaultAnswer = (question: Question): Answer => ({
  value: question.type === "checkbox" ? false : question.type === "multiselect" ? [] : "",
  status: "unknown",
});

const initialState = (): DiscoveryState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DiscoveryState;
  } catch {
    // Ignore malformed local data and start clean.
  }
  return { answers: {} };
};

const statuses: { value: EvidenceStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "inferred", label: "Inferred" },
  { value: "unknown", label: "Unknown" },
];

function App() {
  const [state, setState] = useState<DiscoveryState>(initialState);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const json = useMemo(() => buildHarnessJson(state), [state]);

  const answered = useMemo(() => {
    return Object.values(state.answers).filter((answer) => {
      if (Array.isArray(answer.value)) return answer.value.length > 0;
      return answer.value !== "" && answer.value !== false;
    }).length;
  }, [state]);

  const total = sections.reduce((sum, section) => sum + section.questions.length, 0);

  const update = (question: Question, value: AnswerValue) => {
    setState((current) => ({
      answers: {
        ...current.answers,
        [question.id]: {
          ...(current.answers[question.id] ?? defaultAnswer(question)),
          value,
        },
      },
    }));
  };

  const updateStatus = (question: Question, status: EvidenceStatus) => {
    setState((current) => ({
      answers: {
        ...current.answers,
        [question.id]: {
          ...(current.answers[question.id] ?? defaultAnswer(question)),
          status,
        },
      },
    }));
  };

  const reset = () => {
    if (!window.confirm("Clear the entire local discovery draft?")) return;
    setState({ answers: {} });
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
  };

  const section = sections.find((item) => item.id === activeSection) ?? sections[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Internal tool</p>
          <h1>Discovery Console</h1>
          <p className="muted">
            Capture the call. Export structured input. Refine the existing demo.
          </p>
        </div>

        <nav>
          {sections.map((item) => {
            const count = item.questions.filter((question) => {
              const answer = state.answers[question.id];
              if (!answer) return false;
              return Array.isArray(answer.value)
                ? answer.value.length > 0
                : answer.value !== "" && answer.value !== false;
            }).length;

            return (
              <button
                className={activeSection === item.id ? "nav-item active" : "nav-item"}
                key={item.id}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.title}</span>
                <span className="count">{count}/{item.questions.length}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="progress">
            <span>{answered}/{total} captured</span>
            <progress value={answered} max={total} />
          </div>
          <button className="ghost danger" onClick={reset}>Clear draft</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Discovery call</p>
            <h2>{section.title}</h2>
            {section.description && <p className="muted">{section.description}</p>}
          </div>

          <div className="actions">
            <button className="ghost" onClick={() => setShowJson((value) => !value)}>
              {showJson ? "Hide JSON" : "Preview JSON"}
            </button>
            <button className="ghost" onClick={copyJson}>Copy JSON</button>
            <button
              onClick={() =>
                downloadText(
                  "client-brief.json",
                  JSON.stringify(json, null, 2),
                  "application/json",
                )
              }
            >
              Download JSON
            </button>
            <button
              onClick={() =>
                downloadText("CLIENT_BRIEF.md", buildMarkdown(state), "text/markdown")
              }
            >
              Download MD
            </button>
          </div>
        </header>

        {showJson ? (
          <section className="json-panel">
            <pre>{JSON.stringify(json, null, 2)}</pre>
          </section>
        ) : (
          <section className="question-list">
            {section.questions.map((question) => {
              const answer = state.answers[question.id] ?? defaultAnswer(question);

              return (
                <article className="question" key={question.id}>
                  <div className="question-copy">
                    <label htmlFor={question.id}>{question.label}</label>
                    {question.help && <p>{question.help}</p>}
                  </div>

                  <div className="field-stack">
                    {question.type === "textarea" && (
                      <textarea
                        id={question.id}
                        value={String(answer.value)}
                        placeholder={question.placeholder}
                        onChange={(event) => update(question, event.target.value)}
                        rows={4}
                      />
                    )}

                    {question.type === "text" && (
                      <input
                        id={question.id}
                        type="text"
                        value={String(answer.value)}
                        placeholder={question.placeholder}
                        onChange={(event) => update(question, event.target.value)}
                      />
                    )}

                    {question.type === "select" && (
                      <select
                        id={question.id}
                        value={String(answer.value)}
                        onChange={(event) => update(question, event.target.value)}
                      >
                        <option value="">Select…</option>
                        {question.options?.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="status-row" aria-label={`Evidence status for ${question.label}`}>
                      {statuses.map((status) => (
                        <button
                          className={answer.status === status.value ? "status active" : "status"}
                          key={status.value}
                          onClick={() => updateStatus(question, status.value)}
                          type="button"
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
