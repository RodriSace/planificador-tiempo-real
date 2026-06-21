import type { SimulationResult, Task } from "../lib/types";

interface Props {
  tasks: Task[];
  result: SimulationResult;
}

const LEFT = 92;
const ROW_H = 50;
const HEADER_H = 26;

export default function GanttChart({ tasks, result }: Props) {
  const { horizon, timeline, misses } = result;
  const unit = horizon <= 24 ? 30 : horizon <= 40 ? 22 : 16;
  const width = LEFT + horizon * unit + 12;
  const height = HEADER_H + tasks.length * ROW_H + 8;
  const x = (t: number) => LEFT + t * unit;
  const labelEvery = horizon <= 20 ? 1 : horizon <= 40 ? 2 : 5;

  const missSet = new Set(misses.map((m) => `${m.taskId}@${m.release + (m.deadline - m.release)}`));

  return (
    <>
      <div className="gantt-wrap">
        <svg width={width} height={height} role="img" aria-label="Diagrama de planificación">
          {/* Rejilla vertical + eje de tiempo */}
          {Array.from({ length: horizon + 1 }, (_, t) => (
            <g key={`grid-${t}`}>
              <line
                x1={x(t)}
                y1={HEADER_H}
                x2={x(t)}
                y2={height - 8}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              {t % labelEvery === 0 && t < horizon + 1 && (
                <text
                  x={x(t)}
                  y={18}
                  fill="#7d8a9c"
                  fontSize={11}
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {t}
                </text>
              )}
            </g>
          ))}

          {tasks.map((task, i) => {
            const rowTop = HEADER_H + i * ROW_H;
            const cy = rowTop + ROW_H / 2;

            // Llegadas (releases) dentro del horizonte.
            const releases: number[] = [];
            for (let t = 0; t < horizon; t++) {
              const elapsed = t - task.offset;
              if (elapsed >= 0 && elapsed % task.period === 0) releases.push(t);
            }

            // Bloques de ejecución contiguos.
            const blocks: { start: number; len: number }[] = [];
            for (let t = 0; t < horizon; t++) {
              if (timeline[t] === task.id) {
                const last = blocks[blocks.length - 1];
                if (last && last.start + last.len === t) last.len += 1;
                else blocks.push({ start: t, len: 1 });
              }
            }

            return (
              <g key={task.id}>
                {/* Etiqueta */}
                <rect x={8} y={cy - 9} width={10} height={10} rx={2} fill={task.color} />
                <text x={24} y={cy - 1} fill="#dde6ef" fontSize={12} fontWeight={600}>
                  {task.name}
                </text>
                <text
                  x={24}
                  y={cy + 12}
                  fill="#7d8a9c"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                >
                  T{task.period} C{task.wcet}
                </text>

                {/* Línea base */}
                <line
                  x1={LEFT}
                  y1={cy}
                  x2={x(horizon)}
                  y2={cy}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />

                {/* Bloques de ejecución */}
                {blocks.map((b) => (
                  <rect
                    key={`b-${task.id}-${b.start}`}
                    x={x(b.start) + 1}
                    y={cy - 9}
                    width={b.len * unit - 2}
                    height={18}
                    rx={3}
                    fill={task.color}
                    opacity={0.92}
                  />
                ))}

                {/* Llegadas (flecha hacia arriba, ámbar) */}
                {releases.map((r) => (
                  <polygon
                    key={`r-${task.id}-${r}`}
                    points={`${x(r)},${cy + 11} ${x(r) - 4},${cy + 19} ${x(r) + 4},${cy + 19}`}
                    fill="#f2b134"
                  />
                ))}

                {/* Plazos (flecha hacia abajo; roja si se incumple) */}
                {releases.map((r) => {
                  const d = r + task.deadline;
                  if (d > horizon) return null;
                  const missed = missSet.has(`${task.id}@${d}`);
                  const color = missed ? "#ff5d5d" : "rgba(255,255,255,0.4)";
                  return (
                    <g key={`d-${task.id}-${r}`}>
                      <line
                        x1={x(d)}
                        y1={cy - 19}
                        x2={x(d)}
                        y2={cy + 11}
                        stroke={color}
                        strokeWidth={missed ? 1.5 : 1}
                        strokeDasharray="3 2"
                      />
                      <polygon
                        points={`${x(d)},${cy - 11} ${x(d) - 4},${cy - 19} ${x(d) + 4},${cy - 19}`}
                        fill={color}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="gantt-legend">
        <span>
          <svg width="14" height="10">
            <polygon points="7,0 0,8 14,8" fill="#f2b134" />
          </svg>
          llegada
        </span>
        <span>
          <svg width="14" height="10">
            <polygon points="7,10 0,2 14,2" fill="rgba(255,255,255,0.55)" />
          </svg>
          plazo
        </span>
        <span>
          <svg width="14" height="10">
            <polygon points="7,10 0,2 14,2" fill="#ff5d5d" />
          </svg>
          plazo incumplido
        </span>
      </div>
    </>
  );
}
