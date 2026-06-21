import {
  hyperbolicTest,
  liuLaylandBound,
  responseTimeAnalysis,
  utilization,
} from "../lib/analysis";
import type { Algorithm, SimulationResult, Task } from "../lib/types";

interface Props {
  tasks: Task[];
  algo: Algorithm;
  result: SimulationResult;
}

export default function AnalysisPanel({ tasks, algo, result }: Props) {
  const u = utilization(tasks);
  const n = tasks.length;
  const llBound = liuLaylandBound(n);
  const hyper = hyperbolicTest(tasks);
  const rta = algo === "EDF" ? [] : responseTimeAnalysis(tasks, algo);
  const byId = new Map(tasks.map((t) => [t.id, t]));

  return (
    <div className="panel">
      <h2>Análisis</h2>

      <div className={`verdict ${result.feasible ? "ok" : "fail"}`}>
        <span className="dot" />
        {result.feasible
          ? "Planificable: no se incumple ningún plazo en el hiperperiodo."
          : `No planificable: ${result.misses.length} incumplimiento(s) de plazo.`}
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="k">Utilización U</div>
          <div className="v">
            {u.total.toFixed(3)} <small>/ {algo === "EDF" ? "1.000" : llBound.toFixed(3)}</small>
          </div>
        </div>
        <div className="metric">
          <div className="k">Hiperperiodo</div>
          <div className="v">{result.horizon}</div>
        </div>
        {algo === "EDF" ? (
          <div className="metric">
            <div className="k">Test EDF (U ≤ 1)</div>
            <div className="v">
              <span className={u.total <= 1 + 1e-9 ? "tag-ok" : "tag-fail"}>
                {u.total <= 1 + 1e-9 ? "cumple" : "falla"}
              </span>
            </div>
          </div>
        ) : (
          <div className="metric">
            <div className="k">Test hiperbólico</div>
            <div className="v">
              <span className={hyper.pass ? "tag-ok" : "tag-fail"}>
                {hyper.product.toFixed(3)} {hyper.pass ? "≤ 2" : "> 2"}
              </span>
            </div>
          </div>
        )}
      </div>

      {algo === "EDF" ? (
        <p className="note">
          Bajo <strong>EDF</strong> con plazos implícitos (D = T), la condición{" "}
          <code>U ≤ 1</code> es necesaria y suficiente: el test de utilización decide la
          planificabilidad.
        </p>
      ) : (
        <table className="rta">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Ri (analítico)</th>
              <th>Di</th>
              <th>Ri (simulado)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rta.map((row) => (
              <tr key={row.taskId}>
                <td>{byId.get(row.taskId)?.name ?? row.taskId}</td>
                <td>{row.responseTime ?? "> D"}</td>
                <td>{row.deadline}</td>
                <td>{result.observedWorstResponse[row.taskId] ?? "—"}</td>
                <td className={row.schedulable ? "tag-ok" : "tag-fail"}>
                  {row.schedulable ? "OK" : "FALLA"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="note">
        La cota de Liu &amp; Layland (<code>U ≤ n·(2^(1/n) − 1)</code>) y el test hiperbólico
        son condiciones <em>suficientes</em>: si no se cumplen, el sistema aún puede ser
        planificable. El análisis de tiempo de respuesta (RTA) y la simulación dan la respuesta
        exacta.
      </p>
    </div>
  );
}
