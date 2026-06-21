export type Algorithm = "RMS" | "DMS" | "EDF";

/** Tarea periódica de tiempo real (deadline relativo). */
export interface Task {
  id: string;
  name: string;
  period: number; // T: periodo
  wcet: number; // C: tiempo de cómputo en el peor caso
  deadline: number; // D: plazo relativo (D <= T en el caso habitual)
  offset: number; // fase inicial (por defecto 0)
  color: string;
}

export interface DeadlineMiss {
  taskId: string;
  release: number;
  deadline: number;
}

export interface Completion {
  taskId: string;
  release: number;
  finish: number;
  responseTime: number; // finish - release
  late: boolean; // terminó después de su plazo
}

export interface SimulationResult {
  /** timeline[t] = id de la tarea que ejecuta en [t, t+1), o null si la CPU está ociosa. */
  timeline: (string | null)[];
  horizon: number; // longitud simulada (hiperperiodo)
  misses: DeadlineMiss[];
  completions: Completion[];
  /** Peor tiempo de respuesta observado en la simulación, por tarea. */
  observedWorstResponse: Record<string, number>;
  feasible: boolean; // true si no hubo ningún incumplimiento de plazo
}
