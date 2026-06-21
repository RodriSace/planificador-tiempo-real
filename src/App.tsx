import { useMemo, useState } from "react";
import AnalysisPanel from "./components/AnalysisPanel";
import GanttChart from "./components/GanttChart";
import TaskEditor from "./components/TaskEditor";
import { simulate } from "./lib/scheduler";
import type { Algorithm, Task } from "./lib/types";

const PALETTE = ["#5fb0e3", "#5fe39b", "#f2b134", "#c08bf0", "#f07ba0"];

type Spec = [name: string, period: number, wcet: number, deadline?: number];

function build(specs: Spec[]): Task[] {
  return specs.map(([name, period, wcet, deadline], i) => ({
    id: `t${i}`,
    name,
    period,
    wcet,
    deadline: deadline ?? period,
    offset: 0,
    color: PALETTE[i % PALETTE.length],
  }));
}

const PRESETS: Record<string, Task[]> = {
  feasible: build([
    ["Sensor", 4, 1],
    ["Control", 8, 2],
    ["Log", 16, 4],
  ]),
  "rms-fails": build([
    ["τ1", 5, 2],
    ["τ2", 7, 4],
  ]),
  overload: build([
    ["τ1", 3, 2],
    ["τ2", 4, 2],
  ]),
};

const ALGORITHMS: { id: Algorithm; label: string }[] = [
  { id: "RMS", label: "RMS" },
  { id: "DMS", label: "DMS" },
  { id: "EDF", label: "EDF" },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(PRESETS.feasible);
  const [algo, setAlgo] = useState<Algorithm>("RMS");

  const result = useMemo(() => {
    if (tasks.length === 0 || tasks.some((t) => t.period <= 0)) return null;
    return simulate(tasks, algo);
  }, [tasks, algo]);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <svg className="logo" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#141a22" stroke="#263041" />
            <polyline
              points="4,22 9,22 9,11 15,11 15,22 21,22 21,15 28,15"
              fill="none"
              stroke="#5fe39b"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1>RT Scheduler Sim</h1>
            <p className="sub">RMS · DMS · EDF — planificación de tiempo real</p>
          </div>
        </div>

        <div className="algo-switch" role="group" aria-label="Algoritmo de planificación">
          {ALGORITHMS.map((a) => (
            <button
              key={a.id}
              className={algo === a.id ? "active" : ""}
              onClick={() => setAlgo(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </header>

      <main className="layout">
        <TaskEditor
          tasks={tasks}
          onChange={setTasks}
          onLoadPreset={(name) => setTasks(PRESETS[name].map((t) => ({ ...t })))}
        />

        <div>
          {result ? (
            <>
              <AnalysisPanel tasks={tasks} algo={algo} result={result} />
              <div className="panel" style={{ marginTop: "1.25rem" }}>
                <h2>Cronograma · {algo}</h2>
                <GanttChart tasks={tasks} result={result} />
                <p className="note">
                  El instante 0 es el <strong>instante crítico</strong> (todas las tareas
                  liberadas a la vez). Se simula un hiperperiodo completo. Para sistemas con{" "}
                  <code>D = T</code>, esto basta para decidir la planificabilidad.
                </p>
              </div>
            </>
          ) : (
            <div className="panel">
              <p className="note">Añade al menos una tarea válida para simular.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
