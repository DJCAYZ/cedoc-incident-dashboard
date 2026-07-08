"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createFloodedArea,
  deleteFloodedArea,
  getFloodedAreas,
  upsertWaterLevel,
  getWaterLevels,
  FloodedArea,
  WaterLevel,
  Session,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Plus,
  Trash2,
  Save,
  Waves,
  AlertTriangle,
  MapPin,
} from "lucide-react";

const WATERWAYS = ["San Juan River", "Ermitaño Creek", "Maytunas Creek"];
const FLOOD_SEVERITIES = ["Low", "Moderate", "High", "Critical"];
const WATER_STATUSES = ["Normal", "Rising", "Critical", "Overflow"];

const barangayNames = [
  "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", "Isabelita",
  "Kabayanan", "Pasadena", "Pedro Cruz", "Rivera", "Salapan",
  "San Perfecto", "Addition Hills", "Greenhills", "Little Baguio",
  "Maytunas", "Onse", "Progreso", "St. Joseph (Halo-halo)",
  "Santa Lucia", "Tibagan", "West Crame",
];

export function isWaterRelatedEvent(sessionName: string): boolean {
  const lower = sessionName.toLowerCase();
  return (
    lower.includes("typhoon") ||
    lower.includes("super typhoon") ||
    lower.includes("rain") ||
    lower.includes("flood") ||
    lower.includes("bagyo") ||
    lower.includes("habagat") ||
    lower.includes("storm")
  );
}

function PaginationBar({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
            <button 
                type="button"
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
                Prev
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Page {currentPage} of {totalPages}</span>
            <button 
                type="button"
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
                Next
            </button>
        </div>
    );
}

export function FloodForm({
  activeSessions,
}: {
  activeSessions: Session[];
}) {
  const router = useRouter();
  const waterSessions = activeSessions.filter((s) =>
    isWaterRelatedEvent(s.name)
  );

  const [sessionId, setSessionId] = useState<number>(
    waterSessions.length > 0 ? waterSessions[0].id : 0
  );

  // Flooded areas state
  const [floodedAreas, setFloodedAreas] = useState<FloodedArea[]>([]);
  const [newBarangay, setNewBarangay] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState("Moderate");
  const [isAddingFlood, setIsAddingFlood] = useState(false);
  const [floodPage, setFloodPage] = useState(1);
  const itemsPerPage = 5;

  // Water levels state
  const [waterLevels, setWaterLevels] = useState<
    { waterway_name: string; level_meters: number | ""; status: string }[]
  >(WATERWAYS.map((w) => ({ waterway_name: w, level_meters: 0, status: "Normal" })));
  const [isSavingLevels, setIsSavingLevels] = useState(false);
  const [levelsMsg, setLevelsMsg] = useState("");

  // Load data when session changes
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    getFloodedAreas(sessionId).then((data) => {
      if (!cancelled) setFloodedAreas(data);
    });

    getWaterLevels(sessionId).then((data: WaterLevel[]) => {
      if (cancelled) return;
      const merged = WATERWAYS.map((w) => {
        const existing = data.find((d) => d.waterway_name === w);
        return {
          waterway_name: w,
          level_meters: existing?.level_meters ?? 0,
          status: existing?.status ?? "Normal",
        };
      });
      setWaterLevels(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (waterSessions.length === 0) return null;

  const handleAddFlood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarangay.trim() || !newAreaDesc.trim() || !sessionId) return;
    setIsAddingFlood(true);
    try {
      await createFloodedArea(
        sessionId,
        newBarangay.trim(),
        newAreaDesc.trim(),
        newSeverity
      );
      const data = await getFloodedAreas(sessionId);
      setFloodedAreas(data);
      setNewBarangay("");
      setNewAreaDesc("");
      setNewSeverity("Moderate");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingFlood(false);
    }
  };

  const handleDeleteFlood = async (id: number) => {
    if (!confirm("Remove this flooded area report?")) return;
    try {
      await deleteFloodedArea(id);
      setFloodedAreas((prev) => prev.filter((f) => f.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveWaterLevels = async () => {
    if (!sessionId) return;
    setIsSavingLevels(true);
    try {
      for (const wl of waterLevels) {
        await upsertWaterLevel(
          sessionId,
          wl.waterway_name,
          Number(wl.level_meters || 0),
          wl.status
        );
      }
      setLevelsMsg("✓ Saved");
      setTimeout(() => setLevelsMsg(""), 2000);
      router.refresh();
    } catch {
      setLevelsMsg("Error");
    } finally {
      setIsSavingLevels(false);
    }
  };

  const severityColor: Record<string, string> = {
    Low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Moderate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    High: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    Critical: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const statusColor: Record<string, string> = {
    Normal: "text-emerald-400",
    Rising: "text-yellow-400",
    Critical: "text-orange-400",
    Overflow: "text-red-400",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── WATER LEVELS ── */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-cyan-900/40 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Waves size={18} className="text-cyan-400" />
            <span>Water Level Monitoring</span>
          </h2>
          {levelsMsg && (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
              {levelsMsg}
            </span>
          )}
        </div>

        {waterSessions.length > 1 && (
          <select
            value={sessionId}
            onChange={(e) => setSessionId(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer font-medium"
          >
            {waterSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (ID: #{s.id})
              </option>
            ))}
          </select>
        )}

        <div className="space-y-3">
          {waterLevels.map((wl, idx) => (
            <div
              key={wl.waterway_name}
              className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyan-300">
                  {wl.waterway_name}
                </span>
                <span
                  className={`text-xs font-bold ${statusColor[wl.status] || "text-slate-400"}`}
                >
                  {wl.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Level (meters)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={wl.level_meters}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = [...waterLevels];
                      updated[idx] = {
                        ...updated[idx],
                        level_meters: val === "" ? "" : Number(val),
                      };
                      setWaterLevels(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-cyan-600 focus:outline-none w-full min-w-[65px]"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Status
                  </label>
                  <select
                    value={wl.status}
                    onChange={(e) => {
                      const updated = [...waterLevels];
                      updated[idx] = { ...updated[idx], status: e.target.value };
                      setWaterLevels(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-cyan-600 focus:outline-none cursor-pointer"
                  >
                    {WATER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={handleSaveWaterLevels}
          disabled={isSavingLevels}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-cyan-500/25"
        >
          <Save size={14} className="mr-1.5" />
          {isSavingLevels ? "Saving..." : "Save Water Level Updates"}
        </Button>
      </div>

      {/* ── FLOODED AREAS ── */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-orange-900/40 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Droplets size={18} className="text-orange-400" />
            <span>Flooded Areas</span>
          </h2>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 font-bold uppercase tracking-wider">
            {floodedAreas.length} Reported
          </span>
        </div>

        {/* Add Flooded Area Form */}
        <form onSubmit={handleAddFlood} className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newBarangay}
              onChange={(e) => setNewBarangay(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
              required
            >
              <option value="">Select Barangay...</option>
              {barangayNames.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
            >
              {FLOOD_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={newAreaDesc}
            onChange={(e) => setNewAreaDesc(e.target.value)}
            placeholder="Area description (e.g. J. Ruiz cor. N. Domingo)"
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-slate-600"
            required
          />
          <Button
            type="submit"
            disabled={isAddingFlood || !newBarangay || !newAreaDesc.trim()}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold cursor-pointer w-full text-xs py-2 rounded-xl transition-all disabled:opacity-40"
          >
            <Plus size={14} className="mr-1.5" />
            {isAddingFlood ? "Adding..." : "Report Flooded Area"}
          </Button>
        </form>

        {/* Existing Flooded Areas */}
        {floodedAreas.length > 0 && (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {floodedAreas.slice((floodPage - 1) * itemsPerPage, floodPage * itemsPerPage).map((area) => (
                <div
                  key={area.id}
                  className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex items-start gap-3 group"
                >
                  <AlertTriangle
                    size={14}
                    className={`shrink-0 mt-0.5 ${
                      area.severity === "Critical"
                        ? "text-red-400"
                        : area.severity === "High"
                          ? "text-orange-400"
                          : area.severity === "Moderate"
                            ? "text-yellow-400"
                            : "text-blue-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">
                        {area.barangay}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${severityColor[area.severity] || ""}`}
                      >
                        {area.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 break-words">
                      <MapPin size={10} className="shrink-0" />
                      {area.area_description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFlood(area.id)}
                    className="text-rose-500/50 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <PaginationBar currentPage={floodPage} totalItems={floodedAreas.length} itemsPerPage={itemsPerPage} onPageChange={setFloodPage} />
          </>
        )}
      </div>
    </div>
  );
}
