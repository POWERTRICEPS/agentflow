import { useState } from "react";

type TaskResponse = {
  task: string;
  plan: string[];
  status: string;
};

function App() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/tasks/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error talking to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>AgentFlow</h1>

      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a coding task"
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Running..." : "Submit"}
      </button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <p>Task: {result.task}</p>
          <p>Status: {result.status}</p>

          <ul>
            {result.plan.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;