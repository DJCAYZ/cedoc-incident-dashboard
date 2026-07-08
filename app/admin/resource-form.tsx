"use client";

import { useState } from "react";
import {
  updateVehicle,
  addVehicle,
  deleteVehicle,
  updateWaterRescueEquipment,
  addWaterRescueEquipment,
  deleteWaterRescueEquipment,
  Vehicle,
  WaterRescueEquipment,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Anchor,
  Plus,
  Trash2,
  Save,
  HardHat,
  BarChart3,
} from "lucide-react";

export function ResourceForm({
  initialVehicles,
  initialEquipment,
}: {
  initialVehicles: Vehicle[];
  initialEquipment: WaterRescueEquipment[];
}) {
  // --- Vehicles State ---
  const [vehicles, setVehicles] = useState(
    initialVehicles.map((v) => ({ ...v }))
  );
  const [newVehicleName, setNewVehicleName] = useState("");
  const [isSavingVehicles, setIsSavingVehicles] = useState(false);
  const [vehicleMsg, setVehicleMsg] = useState("");

  // --- Equipment State ---
  const [equipment, setEquipment] = useState(
    initialEquipment.map((e) => ({ ...e }))
  );
  const [newEquipName, setNewEquipName] = useState("");
  const [isSavingEquip, setIsSavingEquip] = useState(false);
  const [equipMsg, setEquipMsg] = useState("");

  // --- Vehicle Handlers ---
  const handleSaveVehicles = async () => {
    setIsSavingVehicles(true);
    try {
      for (const v of vehicles) {
        await updateVehicle(v.id, v.active, v.total);
      }
      setVehicleMsg("✓ Saved");
      setTimeout(() => setVehicleMsg(""), 2000);
    } catch {
      setVehicleMsg("Error");
    } finally {
      setIsSavingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicleName.trim()) return;
    await addVehicle(newVehicleName.trim(), 0, 0);
    setNewVehicleName("");
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm("Remove this vehicle type?")) return;
    await deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // --- Equipment Handlers ---
  const handleSaveEquipment = async () => {
    setIsSavingEquip(true);
    try {
      for (const e of equipment) {
        await updateWaterRescueEquipment(e.id, e.quantity, e.deployed);
      }
      setEquipMsg("✓ Saved");
      setTimeout(() => setEquipMsg(""), 2000);
    } catch {
      setEquipMsg("Error");
    } finally {
      setIsSavingEquip(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipName.trim()) return;
    await addWaterRescueEquipment(newEquipName.trim(), 0, 0);
    setNewEquipName("");
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm("Remove this equipment type?")) return;
    await deleteWaterRescueEquipment(id);
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── VEHICLES SECTION ── */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck size={18} className="text-emerald-400" />
            <span>Vehicle Resources</span>
          </h2>
          {vehicleMsg && (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
              {vehicleMsg}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {vehicles.map((v, idx) => (
            <div
              key={v.id}
              className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60"
            >
              <span className="text-sm font-semibold text-slate-300 w-32 truncate">
                {v.name}
              </span>
              <div className="flex gap-2 flex-1">
                <div className="flex flex-col gap-0.5 flex-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Active
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.active}
                    onChange={(e) => {
                      const updated = [...vehicles];
                      updated[idx] = {
                        ...updated[idx],
                        active: Number(e.target.value),
                      };
                      setVehicles(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Total
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.total}
                    onChange={(e) => {
                      const updated = [...vehicles];
                      updated[idx] = {
                        ...updated[idx],
                        total: Number(e.target.value),
                      };
                      setVehicles(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteVehicle(v.id)}
                className="text-rose-500/60 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                title="Remove vehicle type"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new vehicle */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newVehicleName}
            onChange={(e) => setNewVehicleName(e.target.value)}
            placeholder="New vehicle name..."
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-slate-600"
          />
          <Button
            type="button"
            onClick={handleAddVehicle}
            disabled={!newVehicleName.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-auto py-2 px-3 rounded-xl cursor-pointer text-xs disabled:opacity-40"
          >
            <Plus size={14} />
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleSaveVehicles}
          disabled={isSavingVehicles}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25"
        >
          <Save size={14} className="mr-1.5" />
          {isSavingVehicles ? "Saving..." : "Save Vehicle Updates"}
        </Button>
      </div>

      {/* ── WATER RESCUE EQUIPMENT SECTION ── */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Anchor size={18} className="text-cyan-400" />
            <span>Water Rescue Equipment</span>
          </h2>
          {equipMsg && (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
              {equipMsg}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {equipment.map((e, idx) => (
            <div
              key={e.id}
              className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60"
            >
              <span className="text-sm font-semibold text-slate-300 w-32 truncate">
                {e.name}
              </span>
              <div className="flex gap-2 flex-1">
                <div className="flex flex-col gap-0.5 flex-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={e.quantity}
                    onChange={(ev) => {
                      const updated = [...equipment];
                      updated[idx] = {
                        ...updated[idx],
                        quantity: Number(ev.target.value),
                      };
                      setEquipment(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Deployed
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={e.deployed}
                    onChange={(ev) => {
                      const updated = [...equipment];
                      updated[idx] = {
                        ...updated[idx],
                        deployed: Number(ev.target.value),
                      };
                      setEquipment(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteEquipment(e.id)}
                className="text-rose-500/60 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                title="Remove equipment type"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new equipment */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newEquipName}
            onChange={(e) => setNewEquipName(e.target.value)}
            placeholder="New equipment name..."
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-slate-600"
          />
          <Button
            type="button"
            onClick={handleAddEquipment}
            disabled={!newEquipName.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-auto py-2 px-3 rounded-xl cursor-pointer text-xs disabled:opacity-40"
          >
            <Plus size={14} />
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleSaveEquipment}
          disabled={isSavingEquip}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25"
        >
          <Save size={14} className="mr-1.5" />
          {isSavingEquip ? "Saving..." : "Save Equipment Updates"}
        </Button>
      </div>
    </div>
  );
}
