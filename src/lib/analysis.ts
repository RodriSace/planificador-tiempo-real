import { priorityOrder } from "./scheduler";
import type { Algorithm, Task } from "./types";

/** Utilización por tarea (Ui = Ci / Ti) y total (U = Σ Ui). */
export function utilization(tasks: Task[]): { perTask: Record<string, number>; total: number } {
  const perTask: Record<string, number> = {};
  let total = 0;
  for (const t of tasks) {
    const u = t.wcet / t.period;
    perTask[t.id] = u;
    total += u;
  }
  return { perTask, total };
}

/** Cota de Liu & Layland para RMS: U ≤ n·(2^(1/n) − 1). */
export function liuLaylandBound(n: number): number {
  if (n <= 0) return 1;
  return n * (Math.pow(2, 1 / n) - 1);
}

/** Test hiperbólico para RMS: ∏ (Ui + 1) ≤ 2 (condición suficiente). */
export function hyperbolicTest(tasks: Task[]): { product: number; pass: boolean } {
  const product = tasks.reduce((acc, t) => acc * (t.wcet / t.period + 1), 1);
  return { product, pass: product <= 2 + 1e-9 };
}

export interface ResponseTimeRow {
  taskId: string;
  responseTime: number | null; // null si no converge (no planificable)
  deadline: number;
  schedulable: boolean;
}

/**
 * Análisis de tiempo de respuesta (RTA) para prioridad fija (RMS / DMS):
 *   R_i = C_i + Σ_{j ∈ hp(i)} ⌈R_i / T_j⌉ · C_j
 * Se itera hasta el punto fijo; si R_i supera el plazo, la tarea no es planificable.
 */
export function responseTimeAnalysis(tasks: Task[], algo: Algorithm): ResponseTimeRow[] {
  const ordered = priorityOrder(tasks, algo); // de mayor a menor prioridad
  const rows: ResponseTimeRow[] = [];

  ordered.forEach((task, i) => {
    const higher = ordered.slice(0, i); // tareas de mayor prioridad
    let r = task.wcet;
    let converged = false;

    // Límite de iteraciones por seguridad frente a divergencia.
    for (let guard = 0; guard < 10000; guard++) {
      const interference = higher.reduce(
        (sum, hp) => sum + Math.ceil(r / hp.period) * hp.wcet,
        0,
      );
      const next = task.wcet + interference;
      if (next === r) {
        converged = true;
        break;
      }
      r = next;
      if (r > task.deadline) break; // ya incumple: no hace falta seguir
    }

    const schedulable = converged && r <= task.deadline;
    rows.push({
      taskId: task.id,
      responseTime: converged ? r : null,
      deadline: task.deadline,
      schedulable,
    });
  });

  return rows;
}
