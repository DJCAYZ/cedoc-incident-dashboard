"use client";

import { useState } from "react";
import { updateResources, ResourceMetrics } from "../actions";
import { Button } from "@/components/ui/button";
import { Ambulance, Flame, Shield, BarChart3 } from "lucide-react";

export function ResourceForm({ initialData }: { initialData: ResourceMetrics }) {
    const [ambulancesActive, setAmbulancesActive] = useState(initialData.ambulances_active);
    const [ambulancesTotal, setAmbulancesTotal] = useState(initialData.ambulances_total);
    const [fireTrucksActive, setFireTrucksActive] = useState(initialData.fire_trucks_active);
    const [fireTrucksTotal, setFireTrucksTotal] = useState(initialData.fire_trucks_total);
    const [personnelTotal, setPersonnelTotal] = useState(initialData.personnel_total);
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            await updateResources({
                ambulances_active: ambulancesActive,
                ambulances_total: ambulancesTotal,
                fire_trucks_active: fireTrucksActive,
                fire_trucks_total: fireTrucksTotal,
                rescue_boats_active: initialData.rescue_boats_active, // Keep original to satisfy schema
                rescue_boats_total: initialData.rescue_boats_total,
                personnel_total: personnelTotal
            });
            setMessage("✓ Saved");
            setTimeout(() => setMessage(""), 2000);
        } catch (error) {
            setMessage("Error saving");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-slate-400" />
                    <span>Resource Monitor Management</span>
                </h2>
                {message && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
                        {message}
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Ambulance Metrics */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <Ambulance size={14} className="text-green-400" />
                        <span>Ambulances (Active / Total)</span>
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="0" 
                            required 
                            value={ambulancesActive} 
                            onChange={e => setAmbulancesActive(Number(e.target.value))} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2 w-1/2 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center text-sm font-bold" 
                            placeholder="Active"
                        />
                        <input 
                            type="number" 
                            min="0" 
                            required 
                            value={ambulancesTotal} 
                            onChange={e => setAmbulancesTotal(Number(e.target.value))} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2 w-1/2 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center text-sm font-bold" 
                            placeholder="Total"
                        />
                    </div>
                </div>

                {/* Fire Truck Metrics */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <Flame size={14} className="text-yellow-400" />
                        <span>Fire Trucks (Active / Total)</span>
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="0" 
                            required 
                            value={fireTrucksActive} 
                            onChange={e => setFireTrucksActive(Number(e.target.value))} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2 w-1/2 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center text-sm font-bold" 
                            placeholder="Active"
                        />
                        <input 
                            type="number" 
                            min="0" 
                            required 
                            value={fireTrucksTotal} 
                            onChange={e => setFireTrucksTotal(Number(e.target.value))} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2 w-1/2 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center text-sm font-bold" 
                            placeholder="Total"
                        />
                    </div>
                </div>

                {/* Personnel Metrics */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <Shield size={14} className="text-purple-400" />
                        <span>Active Personnel Deployed</span>
                    </label>
                    <input 
                        type="number" 
                        min="0" 
                        required 
                        value={personnelTotal} 
                        onChange={e => setPersonnelTotal(Number(e.target.value))} 
                        className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center text-sm font-bold w-full" 
                        placeholder="Total Personnel"
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isSaving} 
                className="mt-1 bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25"
            >
                {isSaving ? "Saving changes..." : "Commit Resource Updates"}
            </Button>
        </form>
    );
}
