import { useState, useEffect } from "react";
import {QRCode} from "react-qr-code";

export default function AdminDashboard() {
  const [block, setBlock] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const response = await fetch("http://localhost:8000/qr/blocks", {
          credentials: "include"
        });
        const data = await response.json();
        setBlocks(data.block || []);
        if (data.block && data.block.length > 0) {
          setBlock(data.block[0]);
        }
      } catch (err) {
        console.error("Error occure while fetching block", err)
      }
    }
    fetchBlock();
  }, [])

  const fetchQr = async () => {
    if(!block){
      alert("Please select a block to generate QR code.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/qr/generate/${block}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ block }),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error("Failed to parse response JSON:", parseErr, responseText);
      }

      if (!response.ok) {
        console.error("QR generation failed", response.status, response.statusText, data || responseText);
        throw new Error(
          data.message || data.detail || data.error || responseText || "Unable to generate QR code."
        );
      }

      if (!data.code) {
        throw new Error("QR code was not returned by the server.");
      }

      setCode(data.code);
    } catch (err) {
      console.error("Error generating QR:", err);
      setError(err.message || "Unable to generate QR code.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <main className="min-h-screen background text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-200/80">
              Digital Attendance
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Monitor check-ins, generate block QR codes, and review attendance
              activity from one focused workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              Export report
            </button>
            <button
              type="button"
              onClick={fetchQr}
              disabled={isLoading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Generating..." : "Generate QR"}
            </button>
          </div>
        </header>

        {/* <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10"
            >
              <p className="text-sm text-slate-300">{item.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <strong className="text-3xl font-semibold text-white">
                  {item.value}
                </strong>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  {item.change}
                </span>
              </div>
            </article>
          ))}
        </section> */}

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-white/10 bg-white/6 p-5 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  QR control center
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Pick a block and create a check-in code for the current session.
                </p>
              </div>

              <label className="flex min-w-40 flex-col gap-2 text-sm text-slate-300">
                Block
                <select
                  value={block}
                  onChange={(event) => setBlock(event.target.value)}
                  className="rounded-lg border border-white/10 bg-[#071010] px-3 py-2 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
                >
                  <option value="">Select a block</option>
                  {blocks.map((b) => (
                    <option key={b} value={b}>
                      Block {b}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex aspect-square min-h-64 items-center justify-center rounded-lg border border-dashed border-emerald-300/30 bg-[#071010]/80 p-5">
                {code ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-4">  
                        <QRCode
                        value={code}
                        size={152}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#071010"
                      /> 
                    </div>
                    <p className="mt-4 text-sm text-emerald-100">
                      QR code for Block {block}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-400">
                      {code}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-3xl">
                      QR
                    </div>
                    <p className="mt-4 text-sm text-slate-300">
                      Generate a code to start attendance capture.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-300">Selected location</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Block {block}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Use a fresh QR code for every attendance session so check-ins
                    remain tied to the active block and time window.
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={fetchQr}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Generating code..." : `Generate Block ${block} QR`}
                </button>
              </div>
            </div>
          </div>

          {/* <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Block performance
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Live attendance by location.
                </p>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                Live
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {blockSummary.map((item) => {
                const percent = Math.round((item.present / item.total) * 100);

                return (
                  <div key={item.block} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-white">
                        Block {item.block}
                      </span>
                      <span className="text-slate-300">
                        {item.present}/{item.total} present
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{percent}% attendance</span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> */}
        </section>

        {/* <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10">
            <h2 className="text-lg font-semibold text-white">Session tools</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Start session", "Close session", "Add staff", "Review absentees"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <button
                type="button"
                className="text-sm font-medium text-emerald-200 hover:text-emerald-100"
              >
                View all
              </button>
            </div>

            <div className="mt-4 divide-y divide-white/10">
              {activity.map((item) => (
                <div
                  key={`${item.name}-${item.time}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.action} &middot; {item.block}
                    </p>
                  </div>
                  <time className="text-xs text-slate-400">{item.time}</time>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </div>
    </main>
  );
}
