import { hyperperiod } from "./math";
import type { Algorithm, Completion, DeadlineMiss, SimulationResult, Task } from "./types";

interface Job {
  taskId: string;
  release: number;
  absDeadline: number;
  remaining: number;
  taskIndex: number; // para desempates estables
}

/**
 * Valor de prioridad para algoritmos de prioridad fija.
 * Menor valor = mayor prioridad.
 *  - RMS (Rate Monotonic): prioridad por periodo (T más corto, más prioritaria).
 *  - DMS (Deadline Monotonic): prioridad por plazo (D más corto, más prioritaria).
 */
function fixedPriorityKey(task: Task, algo: Algorithm): number {
  return algo === "DMS" ? task.deadline : task.period;
}

/**
 * Simula la planificación de un conjunto de tareas periódicas durante un
 * hiperperiodo, asumiendo el instante crítico síncrono (todas liberadas en 0
 * salvo su offset). Modelo de tiempo discreto con quantum 1.
 *
 * Las tareas que incumplen su plazo se marcan como fallo y se permite su
 * sobreejecución (overrun) hasta completarse, para visualizar el efecto.
 */
export function simulate(tasks: Task[], algo: Algorithm): SimulationResult {
  const horizon = hyperperiod(tasks.map((t) => t.period));
  const timeline: (string | null)[] = new Array(horizon).fill(null);
  const misses: DeadlineMiss[] = [];
  const completions: Completion[] = [];
  const flaggedMiss = new Set<string>();

  const jobs: Job[] = [];

  const jobKey = (j: Job) => `${j.taskId}@${j.release}`;

  for (let t = 0; t < horizon; t++) {
    // 1. Liberar nuevos trabajos (jobs) en este instante.
    tasks.forEach((task, taskIndex) => {
      const elapsed = t - task.offset;
      if (elapsed >= 0 && elapsed % task.period === 0) {
        jobs.push({
          taskId: task.id,
          release: t,
          absDeadline: t + task.deadline,
          remaining: task.wcet,
          taskIndex,
        });
      }
    });

    // 2. Detectar incumplimientos de plazo (una vez por trabajo).
    for (const job of jobs) {
      if (job.remaining > 0 && t >= job.absDeadline && !flaggedMiss.has(jobKey(job))) {
        flaggedMiss.add(jobKey(job));
        misses.push({ taskId: job.taskId, release: job.release, deadline: job.absDeadline });
      }
    }

    // 3. Seleccionar el trabajo a ejecutar.
    const ready = jobs.filter((j) => j.remaining > 0);
    let chosen: Job | undefined;

    if (ready.length > 0) {
      if (algo === "EDF") {
        // Prioridad dinámica: plazo absoluto más temprano.
        chosen = ready.reduce((best, j) => {
          if (j.absDeadline !== best.absDeadline) return j.absDeadline < best.absDeadline ? j : best;
          if (j.release !== best.release) return j.release < best.release ? j : best;
          return j.taskIndex < best.taskIndex ? j : best;
        });
      } else {
        // Prioridad fija (RMS / DMS).
        const taskById = new Map(tasks.map((tk) => [tk.id, tk]));
        chosen = ready.reduce((best, j) => {
          const kj = fixedPriorityKey(taskById.get(j.taskId)!, algo);
          const kb = fixedPriorityKey(taskById.get(best.taskId)!, algo);
          if (kj !== kb) return kj < kb ? j : best;
          if (j.taskIndex !== best.taskIndex) return j.taskIndex < best.taskIndex ? j : best;
          return j.release < best.release ? j : best;
        });
      }
    }

    // 4. Ejecutar un quantum.
    if (chosen) {
      timeline[t] = chosen.taskId;
      chosen.remaining -= 1;
      if (chosen.remaining === 0) {
        const finish = t + 1;
        completions.push({
          taskId: chosen.taskId,
          release: chosen.release,
          finish,
          responseTime: finish - chosen.release,
          late: finish > chosen.absDeadline,
        });
      }
    }
  }

  // Incumplimientos en la frontera: trabajos no terminados cuyo plazo cae
  // dentro del hiperperiodo y que el bucle no llegó a marcar.
  for (const job of jobs) {
    if (job.remaining > 0 && job.absDeadline <= horizon && !flaggedMiss.has(jobKey(job))) {
      flaggedMiss.add(jobKey(job));
      misses.push({ taskId: job.taskId, release: job.release, deadline: job.absDeadline });
    }
  }

  const observedWorstResponse: Record<string, number> = {};
  for (const c of completions) {
    observedWorstResponse[c.taskId] = Math.max(observedWorstResponse[c.taskId] ?? 0, c.responseTime);
  }

  return {
    timeline,
    horizon,
    misses,
    completions,
    observedWorstResponse,
    feasible: misses.length === 0,
  };
}

/** Orden de prioridad (de mayor a menor) para los algoritmos de prioridad fija. */
export function priorityOrder(tasks: Task[], algo: Algorithm): Task[] {
  if (algo === "EDF") return [...tasks];
  return [...tasks].sort((a, b) => fixedPriorityKey(a, algo) - fixedPriorityKey(b, algo));
}
