"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertPersonnel, getPersonnel, Personnel, Session } from "../actions";
import { Button } from "@/components/ui/button";
import { Shield, Save, Users } from "lucide-react";

const DEFAULT_AGENCIES = ["BFP", "PNP", "CDRRMD", "EMS", "Barangay", "Other"];

interface AgencyRow {
  agency: string;
  deployed: number | "";
  available: number | "";
}

export function PersonnelForm({
  activeSessions,
}: {
  activeSessions: Session[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number>(
    activeSessions.length > 0 ? activeSessions[0].id : 0
  );
  const [agencies, setAgencies] = useState<AgencyRow[]>(
    DEFAULT_AGENCIES.map((a) => ({ agency: a, deployed: 0, available: 0 }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load personnel data when session changes
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    getPersonnel(sessionId).then((data: Personnel[]) => {
      if (cancelled) return;
      const merged = DEFAULT_AGENCIES.map((agency) => {
        const existing = data.find((d) => d.agency === agency);
        return {
          agency,
          deployed: existing?.deployed ?? 0,
          available: existing?.available ?? 0,
        };
      });
      // Include any extra agencies not in the default list
      data.forEach((d) => {
        if (!DEFAULT_AGENCIES.includes(d.agency)) {
          merged.push({
            agency: d.agency,
            deployed: d.deployed,
            available: d.available,
          });
        }
      });
      setAgencies(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleSave = async () => {
    if (!sessionId) return;
    setIsSaving(true);
    setMessage("");
    try {
      for (const row of agencies) {
        await upsertPersonnel(
          sessionId,
          row.agency,
          Number(row.deployed || 0),
          Number(row.available || 0)
        );
      }
      setMessage("✓ Saved");
      setTimeout(() => setMessage(""), 2000);
      router.refresh();
    } catch {
      setMessage("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (activeSessions.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Shield size={16} />
          <span>Create an event session to manage personnel.</span>
        </div>
      </div>
    );
  }

  const totalDeployed = agencies.reduce((s, a) => s + Number(a.deployed || 0), 0);
  const totalAvailable = agencies.reduce((s, a) => s + Number(a.available || 0), 0);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          <span>Personnel by Agency</span>
        </h2>
        {message && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
            {message}
          </span>
        )}
      </div>

      {/* Session Selector */}
      <select
        value={sessionId}
        onChange={(e) => setSessionId(Number(e.target.value))}
        className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer font-medium"
      >
        {activeSessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} (ID: #{s.id})
          </option>
        ))}
      </select>

      {/* Summary bar */}
      <div className="flex gap-4 text-xs">
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-blue-400 font-bold">
          Deployed: {totalDeployed}
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400 font-bold">
          Available: {totalAvailable}
        </div>
        <div className="bg-slate-700/50 border border-slate-600/30 px-3 py-1.5 rounded-lg text-slate-300 font-bold">
          Total: {totalDeployed + totalAvailable}
        </div>
      </div>

      {/* Agency Rows */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-1 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
          <span>Agency</span>
          <span className="text-center">Deployed</span>
          <span className="text-center">Available</span>
        </div>
        {agencies.map((row, idx) => (
          <div
            key={row.agency}
            className="grid grid-cols-[1fr_80px_80px] gap-2 items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60"
          >
            <span className="text-sm font-semibold text-slate-300">
              {row.agency}
            </span>
            <input
              type="number"
              min="0"
              value={row.deployed}
              onChange={(e) => {
                const val = e.target.value;
                const updated = [...agencies];
                updated[idx] = {
                  ...updated[idx],
                  deployed: val === "" ? "" : Number(val),
                };
                setAgencies(updated);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <input
              type="number"
              min="0"
              value={row.available}
              onChange={(e) => {
                const val = e.target.value;
                const updated = [...agencies];
                updated[idx] = {
                  ...updated[idx],
                  available: val === "" ? "" : Number(val),
                };
                setAgencies(updated);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25"
      >
        <Save size={14} className="mr-1.5" />
        {isSaving ? "Saving..." : "Save Personnel Updates"}
      </Button>
    </div>
  );
}
