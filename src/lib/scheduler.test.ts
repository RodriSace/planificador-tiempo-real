import { describe, expect, it } from "vitest";
import { priorityOrder, simulate } from "./scheduler";
import type { Task } from "./types";

const mk = (id: string, period: number, wcet: number, deadline = period, offset = 0): Task => ({
  id,
  name: id,
  period,
  wcet,
  deadline,
  offset,
  color: "#000",
});

describe("simulate", () => {
  it("planifica una sola tarea y deja la CPU ociosa el resto", () => {
    const res = simulate([mk("A", 2, 1)], "RMS");
    expect(res.horizon).toBe(2);
    expect(res.timeline).toEqual(["A", null]);
    expect(res.feasible).toBe(true);
    expect(res.observedWorstResponse.A).toBe(1);
  });

  it("RMS da prioridad a la tarea de periodo más corto", () => {
    // A (T=2,C=1) tiene mayor prioridad que B (T=5,C=2).
    const res = simulate([mk("A", 2, 1), mk("B", 5, 2)], "RMS");
    expect(res.horizon).toBe(10);
    expect(res.timeline).toEqual(["A", "B", "A", "B", "A", "B", "A", "B", "A", null]);
    expect(res.feasible).toBe(true);
    expect(res.observedWorstResponse.A).toBe(1);
    expect(res.observedWorstResponse.B).toBe(4);
  });

  it("EDF es factible donde RMS falla (U ≤ 1)", () => {
    // Caso clásico: U = 2/5 + 4/7 ≈ 0.97. EDF lo planifica; RMS no.
    const tasks = [mk("A", 5, 2), mk("B", 7, 4)];

    const edf = simulate(tasks, "EDF");
    expect(edf.feasible).toBe(true);
    expect(edf.misses).toHaveLength(0);

    const rms = simulate(tasks, "RMS");
    expect(rms.feasible).toBe(false);
    // La tarea de menor prioridad (B) es la que incumple.
    expect(rms.misses.some((m) => m.taskId === "B")).toBe(true);
  });

  it("detecta sobrecarga (U > 1) como no factible", () => {
    const res = simulate([mk("A", 2, 2), mk("B", 4, 1)], "RMS");
    expect(res.feasible).toBe(false);
    expect(res.misses.length).toBeGreaterThan(0);
  });

  it("respeta los offsets al liberar trabajos", () => {
    // A se libera en t=0; B con offset 1 se libera en t=1.
    const res = simulate([mk("A", 4, 1), mk("B", 4, 1, 4, 1)], "RMS");
    expect(res.timeline[0]).toBe("A");
    expect(res.timeline[1]).toBe("B");
  });
});

describe("priorityOrder", () => {
  it("ordena por periodo en RMS", () => {
    const order = priorityOrder([mk("B", 8, 1), mk("A", 4, 1)], "RMS");
    expect(order.map((t) => t.id)).toEqual(["A", "B"]);
  });

  it("ordena por plazo en DMS", () => {
    const order = priorityOrder([mk("B", 10, 1, 9), mk("A", 8, 1, 4)], "DMS");
    expect(order.map((t) => t.id)).toEqual(["A", "B"]);
  });
});
