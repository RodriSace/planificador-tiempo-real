# ⏱️ RT Scheduler Sim

> Simulador interactivo de **planificación de tiempo real**. Define tareas periódicas, elige el algoritmo (**RMS**, **DMS** o **EDF**) y observa el cronograma, los plazos y el análisis de planificabilidad en directo.

![CI](https://github.com/RodriSace/planificador-tiempo-real/actions/workflows/ci.yml/badge.svg)
![Pages](https://github.com/RodriSace/planificador-tiempo-real/actions/workflows/deploy.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/react-18-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5-3178c6)

🔗 **Demo:** `https://RodriSace.github.io/rt-scheduler-sim/`
_(sustituye `RodriSace` por tu usuario de GitHub aquí y en las insignias)._

> 📸 Añade una captura en `docs/screenshot.png` y enlázala aquí — sube mucho la primera impresión del repo.

---

## ✨ Qué hace

- **Editor de tareas** — periodo (T), tiempo de cómputo (C) y plazo (D) editables, con presets.
- **Tres algoritmos** — Rate Monotonic, Deadline Monotonic (prioridad fija) y Earliest Deadline First (prioridad dinámica).
- **Cronograma interactivo** — diagrama de Gantt con llegadas, plazos, ejecución e **incumplimientos resaltados**.
- **Análisis de planificabilidad** en directo:
  - Utilización por tarea y total (U = Σ Cᵢ/Tᵢ).
  - Cota de **Liu & Layland** y **test hiperbólico** (RMS).
  - **Análisis de tiempo de respuesta (RTA)** para prioridad fija.
  - Condición **U ≤ 1** para EDF (plazos implícitos).

## 🎓 Conceptos que demuestra

Este proyecto materializa los fundamentos clásicos de los sistemas de tiempo real:

| Concepto | Dónde aparece |
| --- | --- |
| Planificación por prioridad fija vs. dinámica | RMS/DMS vs. EDF |
| Instante crítico e hiperperiodo | base de la simulación |
| Cota de utilización de Liu & Layland | test suficiente para RMS |
| Análisis de tiempo de respuesta (punto fijo) | `responseTimeAnalysis` |
| Optimalidad de EDF (U ≤ 1) | preset «RMS falla / EDF ok» |

El **preset «RMS falla / EDF ok»** (τ₁ = (T5, C2), τ₂ = (T7, C4), U ≈ 0,97) ilustra el resultado clave: un sistema que EDF planifica pero RMS no.

## 🧠 Cómo funciona

El motor (`src/lib/scheduler.ts`) simula tiempo discreto con quantum 1 a lo largo de un hiperperiodo:

1. En cada instante libera los trabajos cuyo `(t − offset) mod T = 0`.
2. Marca como fallo los trabajos cuyo plazo vence sin haber terminado.
3. Selecciona el trabajo a ejecutar según el algoritmo (prioridad fija por T/D, o plazo absoluto más cercano en EDF).
4. Ejecuta un quantum y registra finalizaciones y tiempos de respuesta.

Toda la lógica de negocio son **funciones puras** sin dependencias de la UI, lo que permite testearla a fondo (16 tests con Vitest).

## 🚀 Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:5173
```

## ✅ Calidad

```bash
npm test         # tests (vitest)
npm run typecheck
npm run build
```

CI ejecuta typecheck + tests + build en cada push y pull request.

## 🌐 Desplegar en GitHub Pages

1. Sube el repositorio a GitHub.
2. **Settings → Pages → Source: GitHub Actions**.
3. El workflow `deploy.yml` publica `dist/` automáticamente en cada push a `main`.

`vite.config.ts` usa `base: "./"`, así que funciona bajo el subdirectorio del proyecto sin configuración extra.

## 📁 Estructura

```
rt-scheduler-sim/
├── src/
│   ├── lib/
│   │   ├── types.ts        # modelo de dominio
│   │   ├── math.ts         # gcd, lcm, hiperperiodo
│   │   ├── scheduler.ts    # motor de simulación (RMS/DMS/EDF)
│   │   ├── analysis.ts     # utilización, cotas y RTA
│   │   └── *.test.ts       # 15 tests del núcleo
│   ├── components/
│   │   ├── TaskEditor.tsx
│   │   ├── AnalysisPanel.tsx
│   │   └── GanttChart.tsx  # diagrama SVG
│   └── App.tsx
└── .github/workflows/      # ci.yml + deploy.yml
```

## 📄 Licencia

MIT — consulta [LICENSE](./LICENSE).
