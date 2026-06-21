import { describe, expect, it } from "vitest";
import {
  hyperbolicTest,
  liuLaylandBound,
  responseTimeAnalysis,
  utilization,
} from "./analysis";
import type { Task } from "./types";

const mk = (id: string, period: number, wcet: number, deadline = period): Task => ({
  id,
  name: id,
  period,
  wcet,
  deadline,
  offset: 0,
  color: "#000",
});

describe("utilization", () => {
  it("calcula utilización por tarea y total", () => {
    const u = utilization([mk("A", 4, 1), mk("B", 8, 2)]);
    expect(u.perTask.A).toBeCloseTo(0.25);
    expect(u.perTask.B).toBeCloseTo(0.25);
    expect(u.total).toBeCloseTo(0.5);
  });
});

describe("liuLaylandBound", () => {
  it("coincide con los valores conocidos", () => {
    expect(liuLaylandBound(1)).toBeCloseTo(1);
    expect(liuLaylandBound(2)).toBeCloseTo(0.8284, 3);
    expect(liuLaylandBound(3)).toBeCloseTo(0.7798, 3);
  });
});

describe("hyperbolicTest", () => {
  it("falla cuando el producto supera 2", () => {
    const { pass } = hyperbolicTest([mk("A", 2, 1), mk("B", 5, 2)]);
    expect(pass).toBe(false);
  });

  it("pasa con baja utilización", () => {
    const { pass } = hyperbolicTest([mk("A", 4, 1), mk("B", 8, 1)]);
    expect(pass).toBe(true);
  });
});

describe("responseTimeAnalysis", () => {
  it("calcula el tiempo de respuesta y detecta no planificabilidad", () => {
    const rows = responseTimeAnalysis([mk("A", 5, 2), mk("B", 7, 4)], "RMS");
    const a = rows.find((r) => r.taskId === "A")!;
    const b = rows.find((r) => r.taskId === "B")!;

    expect(a.responseTime).toBe(2);
    expect(a.schedulable).toBe(true);

    // B requeriría R=8 > D=7: no planificable.
    expect(b.schedulable).toBe(false);
  });
});
