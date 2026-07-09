"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertPersonnel, getPersonnel, deletePersonnel, Personnel, Session } from "../actions";
import { Button } from "@/components/ui/button";
import { Shield, Save, Users, Plus, Trash2 } from "lucide-react";

interface AgencyRow {
  id?: number;
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
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load personnel data when session changes
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    getPersonnel(sessionId).then((data: Personnel[]) => {
      if (cancelled) return;
      const mapped: AgencyRow[] = data.map((d) => ({
        id: d.id,
        agency: d.agency,
        deployed: d.deployed,
        available: d.available,
      }));
      if (mapped.length === 0) {
        mapped.push({ agency: "", deployed: 0, available: 0 });
      }
      setAgencies(mapped);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleAddAgency = () => {
    setAgencies([...agencies, { agency: "", deployed: 0, available: 0 }]);
  };

  const handleDeleteAgency = async (index: number, id?: number) => {
    if (id) {
      if (!confirm("Are you sure you want to delete this agency?")) return;
      try {
        await deletePersonnel(id);
      } catch (e) {
        console.error(e);
        alert("Failed to delete agency");
        return;
      }
    }
    const updated = [...agencies];
    updated.splice(index, 1);
    setAgencies(updated);
  };

  const handleSave = async () => {
    if (!sessionId) return;
    setIsSaving(true);
    setMessage("");
    try {
      for (const row of agencies) {
        if (!row.agency.trim()) continue;
        await upsertPersonnel(
          sessionId,
          row.agency.trim(),
          Number(row.deployed || 0),
          Number(row.available || 0)
        );
      }
      
      // Refresh local state to get new IDs
      const refreshedData = await getPersonnel(sessionId);
      setAgencies(refreshedData.map((d) => ({
        id: d.id,
        agency: d.agency,
        deployed: d.deployed,
        available: d.available,
      })));
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
        <div className="grid grid-cols-[1fr_70px_70px_32px] gap-2 px-1 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
          <span>Agency Name</span>
          <span className="text-center">Deployed</span>
          <span className="text-center">Available</span>
          <span></span>
        </div>
        {agencies.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_70px_70px_32px] gap-2 items-center bg-slate-950/60 p-2 rounded-xl border border-slate-800/60"
          >
            <input
              type="text"
              value={row.agency}
              placeholder="Agency name"
              onChange={(e) => {
                const updated = [...agencies];
                updated[idx].agency = e.target.value;
                setAgencies(updated);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
            />
            <input
              type="number"
              min="0"
              value={row.deployed}
              onChange={(e) => {
                const updated = [...agencies];
                updated[idx].deployed = e.target.value === "" ? "" : Number(e.target.value);
                setAgencies(updated);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
            />
            <input
              type="number"
              min="0"
              value={row.available}
              onChange={(e) => {
                const updated = [...agencies];
                updated[idx].available = e.target.value === "" ? "" : Number(e.target.value);
                setAgencies(updated);
              }}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
            />
            <button
              type="button"
              onClick={() => handleDeleteAgency(idx, row.id)}
              className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Remove Agency"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleAddAgency}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer text-xs py-2.5 rounded-xl transition-all w-1/3"
        >
          <Plus size={14} className="mr-1.5" />
          Add Row
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer flex-1 text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Save size={14} className="mr-1.5" />
          {isSaving ? "Saving..." : "Save Personnel Updates"}
        </Button>
      </div>
    </div>
  );
}
