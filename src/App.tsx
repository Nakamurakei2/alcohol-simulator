import { useState, useEffect, useCallback } from "react";

const DRINKS = [
  {
    id: "beer_long",
    label: "ビール\nロング缶",
    sub: "500ml / 5%",
    grams: 20,
    emoji: "🍺",
  },
  {
    id: "beer_short",
    label: "ビール\n中ジョッキ",
    sub: "350ml / 5%",
    grams: 14,
    emoji: "🍻",
  },
  {
    id: "lemon_sour",
    label: "レモン\nサワー",
    sub: "350ml / 5%",
    grams: 14,
    emoji: "🍋",
  },
  {
    id: "highball",
    label: "ハイボール",
    sub: "350ml / 7%",
    grams: 19.6,
    emoji: "🥃",
  },
  {
    id: "wine",
    label: "ワイン\nグラス",
    sub: "150ml / 12%",
    grams: 14.4,
    emoji: "🍷",
  },
  {
    id: "sake",
    label: "日本酒\n1合",
    sub: "180ml / 15%",
    grams: 21.6,
    emoji: "🍶",
  },
  {
    id: "shochu",
    label: "焼酎\nロック",
    sub: "60ml / 25%",
    grams: 12,
    emoji: "🥂",
  },
  {
    id: "shot",
    label: "ショット\n1杯",
    sub: "30ml / 40%",
    grams: 9.6,
    emoji: "🔥",
  },
];

type CountMap = Record<string, number>;

function calcClearTime(totalGrams: number, weightKg: number) {
  if (totalGrams <= 0) return null;
  const ratePerHour = weightKg * 0.1;
  const hours = totalGrams / ratePerHour;
  const now = new Date();
  const clear = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return { clear, hours };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  if (isToday) return "今日";
  if (isTomorrow) return "明日";
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

function StatusBadge({ hours, clearDate }: { hours: number; clearDate: Date }) {
  if (!hours) return null;
  const commute = new Date();
  commute.setDate(commute.getDate() + 1);
  commute.setHours(8, 30, 0, 0);

  const safe = clearDate <= commute;
  const barely = !safe && clearDate <= new Date(commute.getTime() + 90 * 60000);

  if (safe)
    return (
      <div
        style={{
          background: "rgba(29,158,117,0.15)",
          border: "1px solid rgba(29,158,117,0.5)",
          borderRadius: 12,
          padding: "10px 16px",
          textAlign: "center",
          color: "#1D9E75",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        ✅ 明日の通勤前に抜けます
      </div>
    );
  if (barely)
    return (
      <div
        style={{
          background: "rgba(239,159,39,0.15)",
          border: "1px solid rgba(239,159,39,0.5)",
          borderRadius: 12,
          padding: "10px 16px",
          textAlign: "center",
          color: "#EF9F27",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        ⚠️ ギリギリ…少し遅刻かも
      </div>
    );
  return (
    <div
      style={{
        background: "rgba(226,75,74,0.15)",
        border: "1px solid rgba(226,75,74,0.5)",
        borderRadius: 12,
        padding: "10px 16px",
        textAlign: "center",
        color: "#E24B4A",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      🚨 酒気残り注意！遅刻・事故に注意
    </div>
  );
}

function Countdown({ clearDate }: { clearDate: Date }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = +clearDate - +new Date();
      if (diff <= 0) {
        setRemaining("アルコール抜けました！");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${h}時間 ${String(m).padStart(2, "0")}分 ${String(s).padStart(2, "0")}秒`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clearDate]);

  return (
    <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          marginBottom: 4,
          letterSpacing: 1,
        }}
      >
        カウントダウン
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: 2,
          fontVariantNumeric: "tabular-nums",
          color: "var(--color-text-primary)",
        }}
      >
        {remaining}
      </div>
    </div>
  );
}

export default function App() {
  const [counts, setCounts] = useState<CountMap>({});
  const [weight, setWeight] = useState(60);

  const totalGrams = Object.entries(counts).reduce((sum, [id, cnt]) => {
    const d = DRINKS.find((x) => x.id === id);
    return sum + (d ? d.grams * cnt : 0);
  }, 0);

  const result = calcClearTime(totalGrams, weight);

  const add = useCallback((id: string) => {
    setCounts((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }, []);

  const remove = useCallback((id: string) => {
    setCounts((c) => {
      if (!c[id]) return c;
      const next = { ...c, [id]: c[id] - 1 };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }, []);

  const reset = () => setCounts({});

  const totalDrinks = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "16px 12px 48px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <h2 className="sr-only">飲み過ぎアラート — アルコール分解タイマー</h2>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🍺</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          飲み過ぎアラート
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginTop: 4,
          }}
        >
          アルコール分解タイマー
        </div>
      </div>

      {/* Weight selector */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            体重
          </span>
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {weight}{" "}
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "var(--color-text-secondary)",
              }}
            >
              kg
            </span>
          </span>
        </div>
        <input
          type="range"
          min="40"
          max="100"
          step="5"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--color-text-secondary)",
            marginTop: 4,
          }}
        >
          <span>40kg</span>
          <span>70kg</span>
          <span>100kg</span>
        </div>
      </div>

      {/* Drink grid */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            marginBottom: 10,
          }}
        >
          何を飲みましたか？
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {DRINKS.map((d) => {
            const cnt = counts[d.id] || 0;
            return (
              <div
                key={d.id}
                style={{
                  background:
                    cnt > 0
                      ? "var(--color-background-info)"
                      : "var(--color-background-primary)",
                  border:
                    cnt > 0
                      ? "1.5px solid var(--color-border-info)"
                      : "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 12,
                  padding: "12px 10px",
                  transition: "all 0.15s",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>
                      {d.emoji}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: "pre-line",
                        lineHeight: 1.3,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {d.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {d.sub}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <button
                      onClick={() => add(d.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "0.5px solid var(--color-border-secondary)",
                        background: "var(--color-background-secondary)",
                        fontSize: 16,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </button>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        minWidth: 16,
                        textAlign: "center",
                        color:
                          cnt > 0
                            ? "var(--color-text-info)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {cnt}
                    </span>
                    <button
                      onClick={() => remove(d.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "0.5px solid var(--color-border-secondary)",
                        background: "var(--color-background-secondary)",
                        fontSize: 18,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        opacity: cnt === 0 ? 0.3 : 1,
                      }}
                    >
                      −
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary bar */}
      {totalDrinks > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              合計
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{totalDrinks}杯</div>
          </div>
          <div
            style={{
              flex: 1,
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              アルコール量
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {totalGrams.toFixed(1)}g
            </div>
          </div>
          <button
            onClick={reset}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)",
              background: "transparent",
              fontSize: 12,
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            リセット
          </button>
        </div>
      )}

      {/* Result */}
      {result ? (
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 16,
            padding: "20px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              アルコールが完全に抜ける予定
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--color-text-primary)",
              }}
            >
              {formatTime(result.clear)}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                marginTop: 2,
              }}
            >
              {formatDate(result.clear)} · 約{result.hours.toFixed(1)}時間後
            </div>
          </div>
          <StatusBadge hours={result.hours} clearDate={result.clear} />
          <Countdown clearDate={result.clear} />
        </div>
      ) : (
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 16,
            padding: "28px 16px",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: 14,
          }}
        >
          上のボタンで今日飲んだお酒を追加してください
        </div>
      )}

      {/* Tips */}
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          lineHeight: 1.7,
          borderTop: "0.5px solid var(--color-border-tertiary)",
          paddingTop: 12,
          marginTop: 8,
        }}
      >
        ※
        体重1kgあたり1時間に0.1gのアルコールを分解する目安で計算しています。個人差・体調・空腹状態により大きく異なります。飲酒運転は絶対にしないでください。
      </div>
    </div>
  );
}
