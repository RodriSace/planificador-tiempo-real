import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renderiza y muestra un veredicto de planificabilidad", () => {
    render(<App />);
    expect(screen.getByText("RT Scheduler Sim")).toBeInTheDocument();
    // El preset por defecto es factible bajo RMS.
    expect(screen.getByText(/Planificable/)).toBeInTheDocument();
  });
});
