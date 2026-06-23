"use client";

import { useState } from "react";
import { updateResources, ResourceMetrics } from "../actions";
import { Button } from "@/components/ui/button";
import { Ambulance, Flame, LifeBuoy, Shield, BarChart3 } from "lucide-react";

export function ResourceForm({ initialData }: { initialData: ResourceMetrics }) {
    const [ambulancesActive, setAmbulancesActive] = useState(initialData.ambulances_active);
    const [ambulancesTotal, setAmbulancesTotal] = useState(initialData.ambulances_total);
    const [fireTrucksActive, setFireTrucksActive] = useState(initialData.fire_trucks_active);
    const [fireTrucksTotal, setFireTrucksTotal] = useState(initialData.fire_trucks_total);
    const [rescueBoatsActive, setRescueBoatsActive] = useState(initialData.rescue_boats_active);
    const [rescueBoatsTotal, setRescueBoatsTotal] = useState(initialData.rescue_boats_total);
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
                rescue_boats_active: rescueBoatsActive,
                rescue_boats_total: rescueBoatsTotal,
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white/95 p-5 rounded-lg shadow-lg border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 size={18} className="text-slate-600" />
                    <span>Resource Status</span>
                </h2>
                {message && (
                    <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold border border-green-200">
                        {message}
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Ambulance size={14} className="text-green-600" />
                        <span>Ambulances (Active / Total)</span>
                    </label>
                    <div className="flex gap-2">
                        <input type="number" min="0" required value={ambulancesActive} onChange={e => setAmbulancesActive(Number(e.target.value))} className="border border-slate-300 rounded-md p-2 w-1/2 focus:ring-2 focus:ring-blue-500 text-sm" />
                        <input type="number" min="0" required value={ambulancesTotal} onChange={e => setAmbulancesTotal(Number(e.target.value))} className="border border-slate-300 rounded-md p-2 w-1/2 focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Flame size={14} className="text-yellow-600" />
                        <span>Fire Trucks (Active / Total)</span>
                    </label>
                    <div className="flex gap-2">
                        <input type="number" min="0" required value={fireTrucksActive} onChange={e => setFireTrucksActive(Number(e.target.value))} className="border border-slate-300 rounded-md p-2 w-1/2 focus:ring-2 focus:ring-blue-500 text-sm" />
                        <input type="number" min="0" required value={fireTrucksTotal} onChange={e => setFireTrucksTotal(Number(e.target.value))} className="border border-slate-300 rounded-md p-2 w-1/2 focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Shield size={14} className="text-purple-600" />
                        <span>Personnel Deployed</span>
                    </label>
                    <input type="number" min="0" required value={personnelTotal} onChange={e => setPersonnelTotal(Number(e.target.value))} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
            </div>

            <Button type="submit" disabled={isSaving} className="mt-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer w-full text-xs font-semibold py-2">
                {isSaving ? "Saving..." : "Update Resources"}
            </Button>
        </form>
    );
}
