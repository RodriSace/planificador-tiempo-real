import type { Task } from "../lib/types";

interface Props {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
  onLoadPreset: (name: "feasible" | "rms-fails" | "overload") => void;
}

const PALETTE = ["#5fb0e3", "#5fe39b", "#f2b134", "#c08bf0", "#f07ba0", "#7de0d0"];

export default function TaskEditor({ tasks, onChange, onLoadPreset }: Props) {
  function update(id: string, field: keyof Task, value: string) {
    onChange(
      tasks.map((t) => {
        if (t.id !== id) return t;
        if (field === "name") return { ...t, name: value };
        const num = Math.max(field === "wcet" ? 1 : 1, Math.floor(Number(value) || 0));
        return { ...t, [field]: num };
      }),
    );
  }

  function addTask() {
    const idx = tasks.length;
    const id = `t${Date.now()}`;
    onChange([
      ...tasks,
      {
        id,
        name: `τ${idx + 1}`,
        period: 10,
        wcet: 2,
        deadline: 10,
        offset: 0,
        color: PALETTE[idx % PALETTE.length],
      },
    ]);
  }

  function remove(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  return (
    <div className="panel">
      <h2>Tareas periódicas</h2>
      <table className="task-table">
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th title="Periodo">T</th>
            <th title="Cómputo (peor caso)">C</th>
            <th title="Plazo relativo">D</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>
                <span className="swatch" style={{ background: t.color }} />
              </td>
              <td>
                <input
                  className="name-input"
                  value={t.name}
                  onChange={(e) => update(t.id, "name", e.target.value)}
                  aria-label="Nombre de la tarea"
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={t.period}
                  onChange={(e) => update(t.id, "period", e.target.value)}
                  aria-label="Periodo"
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={t.wcet}
                  onChange={(e) => update(t.id, "wcet", e.target.value)}
                  aria-label="Cómputo"
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={t.deadline}
                  onChange={(e) => update(t.id, "deadline", e.target.value)}
                  aria-label="Plazo"
                />
              </td>
              <td>
                <button
                  className="row-del"
                  onClick={() => remove(t.id)}
                  aria-label={`Eliminar ${t.name}`}
                  title="Eliminar"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="editor-actions">
        <button className="btn btn-accent" onClick={addTask}>
          + Añadir tarea
        </button>
      </div>

      <div className="presets">
        Ejemplos:{" "}
        <button onClick={() => onLoadPreset("feasible")}>factible</button>
        <button onClick={() => onLoadPreset("rms-fails")}>RMS falla / EDF ok</button>
        <button onClick={() => onLoadPreset("overload")}>sobrecarga</button>
      </div>
    </div>
  );
}
