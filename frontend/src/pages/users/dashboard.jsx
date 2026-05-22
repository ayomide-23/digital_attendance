import { useState, useEffect } from "react";
import {Html5QrcodeScanner} from "html5-qrcode";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null); // { action, time, date, block }
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://digital-attendance-78h5.onrender.com//auth/me", {
          credentials: "include",
        });
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const getInitials = (fn, ln) =>
    `${fn?.[0] ?? ""}${ln?.[0] ?? ""}`.toUpperCase();

  const formatDateTime = () => {
    const d = new Date();
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return {
      full: `${day}, ${date} ${month} ${year}`,
      time: `${h}:${m} ${ampm}`,
      display: `${day}, ${date} ${month} ${year} · ${h}:${m} ${ampm}`,
    };
  };

  const handleScan = async (qrCode) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("https://digital-attendance-78h5.onrender.com//attendance/scan", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: qrCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Scan failed");
      setLog((prev) => [entry, ...prev]);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const Startscanner = () => {
    const scanner = new Html5QrcodeScanner("qr-reader", {fps:10, qrbox:190});
    scanner.render((result) => {
        handleScan(result)
        scanner.clear() //clearing scan after a successful scan
    },(error)=> {
        console.error("QR scan error", error)
    })
  }

  return (
    <main className="min-h-screen background text-slate-50">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">

        {/* header */}
        <header className="border-b border-white/10 pb-6">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-200/80">
            Digital Attendance
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            My Dashboard
          </h1>
        </header>

        {/* stat cards */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Block", value: user?.block},
            {
              label: "Status",
              value: log[0]?.action ?? "No record",
              green: log[0]?.action === "Signed in",
              amber: log[0]?.action === "Signed out",
            },
            { label: "Last action", value: log[0]?.time ?? "—" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/10 bg-white/6 p-4"
            >
              <p className="text-xs text-slate-400">{s.label}</p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  s.green
                    ? "text-emerald-400"
                    : s.amber
                    ? "text-amber-400"
                    : "text-white"
                }`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </section>

        {/* profile card */}
        <div className="rounded-lg border border-white/10 bg-white/6 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-semibold text-emerald-300">
            {user ? getInitials(user.fname, user.lname) : "—"}
          </div>
          <div>
            <p className="font-semibold text-white">
              {user ? `${user.fname} ${user.lname}` : "Loading..."}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {user?.staff_id} &middot; Block {user?.block}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {user?.role ?? "Staff"}
          </span>
        </div>

        {/* scan button */}
        <div className="rounded-lg border border-white/10 bg-white/6 p-5">
          <p className="mb-4 text-sm text-slate-300">
            Scan the block QR code to record your attendance for this session.
          </p>
          {error && (
            <p className="mb-4 rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}
          <div id="qr-reader" style={{ width: "100%", height: "250px" }}></div> 
          <button
            type="button"
            onClick={()=> {Startscanner()}}
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Scan QR code"}
          </button>
        </div>

        {/* confirmation animation */}
        {confirmation && (
          <div className="rounded-lg border border-white/10 bg-white/6 p-6 text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                confirmation.action === "Signed in"
                  ? "bg-emerald-400/20 text-emerald-400"
                  : "bg-amber-400/20 text-amber-400"
              }`}
              style={{ animation: "pop 0.35s ease forwards" }}
            >
              {confirmation.action === "Signed in" ? "✓" : "↩"}
            </div>
            <p className="text-xl font-semibold text-white">
              {confirmation.action}
            </p>
            <p className="mt-2 text-sm text-slate-400">{confirmation.display}</p>
            <p className="mt-1 text-sm text-slate-400">
              Block {confirmation.block}
            </p>
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="mt-5 rounded-lg border border-white/10 bg-white/5 px-6 py-2 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              Done
            </button>
          </div>
        )}

        {/* attendance log */}
        <div className="rounded-lg border border-white/10 bg-white/6 p-5">
          <p className="mb-4 text-sm font-semibold text-white">
            Attendance log
          </p>
          {log.length === 0 ? (
            <p className="text-sm text-slate-400">No records yet.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {log.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {entry.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{entry.date}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      entry.action === "Signed in"
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}