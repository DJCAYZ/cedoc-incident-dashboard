"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { 
    getIncidents, 
    getVehicles,
    getWaterRescueEquipment,
    getPersonnel,
    getPreparedness,
    getFloodedAreas,
    getWaterLevels,
    Session
} from "./actions";
import { isWaterRelatedEvent } from "./admin/flood-form";
import { RealTimeClock } from "./real-time-clock";
import {
    Ambulance,
    Flame,
    LifeBuoy,
    Shield,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    Activity,
    Truck,
    Users,
    Anchor,
    ShieldCheck,
    Droplets,
    Waves,
    MapPin
} from "lucide-react";

export function SeverityBadge({ severity }: { severity: string }) {
    // Strips emojis from beginning if present (e.g. "🔴 Critical" -> "Critical")
    const cleanSeverity = severity.replace(/^[^\w]*/, "").trim();

    let color = "bg-slate-700/50 text-slate-300 border-slate-600";
    let Icon = Info;

    if (severity.includes("Critical")) {
        color = "bg-red-500/10 text-red-400 border-red-500/30";
        Icon = AlertCircle;
    } else if (severity.includes("High")) {
        color = "bg-orange-500/10 text-orange-400 border-orange-500/30";
        Icon = AlertTriangle;
    } else if (severity.includes("Moderate")) {
        color = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        Icon = AlertTriangle;
    } else if (severity.includes("Normal")) {
        color = "bg-green-500/10 text-green-400 border-green-500/30";
        Icon = CheckCircle;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold border ${color}`}>
            <Icon size={14} className="shrink-0" />
            {cleanSeverity}
        </span>
    );
}

function PaginationBar({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-3 mt-4 pt-3 border-t border-slate-700/50">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-md disabled:opacity-30 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
            >
                Prev
            </button>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Page {currentPage} of {totalPages}</span>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-md disabled:opacity-30 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
            >
                Next
            </button>
        </div>
    );
}

export function DashboardView({ session }: { session: Session }) {
    const sessionId = session.id;
    const isWaterEvent = isWaterRelatedEvent(session.name);

    const [personnelPage, setPersonnelPage] = useState(1);
    const [vehiclePage, setVehiclePage] = useState(1);
    const [preparednessPage, setPreparednessPage] = useState(1);
    const [incidentPage, setIncidentPage] = useState(1);

    const personnelPerPage = 5;
    const vehiclePerPage = 5;
    const preparednessPerPage = 3;
    const incidentPerPage = 8;

    const { data: incidents = [] } = useQuery({
        queryKey: ['incidents', 'session', sessionId],
        queryFn: () => getIncidents(sessionId),
        refetchInterval: 1000
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: getVehicles,
        refetchInterval: 1000
    });

    const { data: equipment = [] } = useQuery({
        queryKey: ['waterRescueEquipment'],
        queryFn: getWaterRescueEquipment,
        refetchInterval: 1000
    });

    const { data: personnel = [] } = useQuery({
        queryKey: ['personnel', 'session', sessionId],
        queryFn: () => getPersonnel(sessionId),
        refetchInterval: 1000
    });

    const { data: preparedness = [] } = useQuery({
        queryKey: ['preparedness', 'session', sessionId],
        queryFn: () => getPreparedness(sessionId),
        refetchInterval: 1000
    });

    const { data: floodedAreas = [] } = useQuery({
        queryKey: ['floodedAreas', 'session', sessionId],
        queryFn: () => getFloodedAreas(sessionId),
        refetchInterval: 1000,
        enabled: isWaterEvent
    });

    const { data: waterLevels = [] } = useQuery({
        queryKey: ['waterLevels', 'session', sessionId],
        queryFn: () => getWaterLevels(sessionId),
        refetchInterval: 1000,
        enabled: isWaterEvent
    });

    // Aggregations
    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status !== 'Closed');
    const resolvedIncidents = incidents.filter(i => i.status === 'Closed');

    const traumaCases = incidents.filter(i => ['Trauma', 'Slips and Falls', 'Road Traffic Accidents', 'Water-related Injuries'].includes(i.type)).length;
    const medicalCases = incidents.filter(i => ['Medical Case', 'Heat Exhaustion'].includes(i.type)).length;
    const otherCases = incidents.filter(i => !['Slips and Falls', 'Road Traffic Accidents', 'Water-related Injuries', 'Medical Case', 'Heat Exhaustion'].includes(i.type)).length;

    // Breakdown by Type
    const typeCount: Record<string, number> = {};
    incidents.forEach(i => {
        typeCount[i.type] = (typeCount[i.type] || 0) + 1;
    });

    // Breakdown by Status
    const statusCount: Record<string, number> = {};
    incidents.forEach(i => {
        statusCount[i.status] = (statusCount[i.status] || 0) + 1;
    });

    // Barangay Heatmap
    const barangayCount: Record<string, number> = {};
    incidents.forEach(i => {
        if (i.barangay !== 'Unknown') {
            barangayCount[i.barangay] = (barangayCount[i.barangay] || 0) + 1;
        }
    });
    const sortedBarangays = Object.entries(barangayCount).sort((a, b) => b[1] - a[1]);
    const maxBarangayCount = sortedBarangays.length > 0 ? sortedBarangays[0][1] : 1;

    // Casualties
    const totalDead = incidents.reduce((sum, inc) => sum + inc.casualties_dead, 0);
    const totalInjured = incidents.reduce((sum, inc) => sum + inc.casualties_injured, 0);
    const totalMissing = incidents.reduce((sum, inc) => sum + inc.casualties_missing, 0);
    const totalEvacuated = incidents.reduce((sum, inc) => sum + inc.evacuated_individuals, 0);

    return (
        <div className="flex flex-col gap-8 h-full overflow-hidden text-white">

            {/* Top Cards (Summary) */}
            <div className="grid grid-cols-7 gap-6">
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-white">{totalIncidents}</span>
                    <span className="text-xl uppercase tracking-widest text-slate-400 mt-2">Total</span>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-blue-500 shadow-xl flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-blue-400">{activeIncidents.length}</span>
                    <span className="text-xl uppercase tracking-widest text-blue-200 mt-2">Active</span>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-green-500 shadow-xl flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-green-400">{resolvedIncidents.length}</span>
                    <span className="text-xl uppercase tracking-widest text-green-200 mt-2">Resolved</span>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-2xl border border-red-900/50 shadow-xl flex flex-col items-center justify-center text-center col-span-2">
                    <div className="flex gap-8 mb-2">
                        <div className="flex flex-col items-center"><span className="text-6xl font-black text-red-500">{totalDead}</span><span className="text-sm text-red-300 uppercase font-bold tracking-wider">Dead</span></div>
                        <div className="flex flex-col items-center"><span className="text-6xl font-black text-orange-400">{totalInjured}</span><span className="text-sm text-orange-200 uppercase font-bold tracking-wider">Injured</span></div>
                        <div className="flex flex-col items-center"><span className="text-6xl font-black text-yellow-500">{totalMissing}</span><span className="text-sm text-yellow-200 uppercase font-bold tracking-wider">Missing</span></div>
                    </div>
                    <span className="text-base uppercase tracking-widest text-red-400 mt-2 border-t border-red-500/20 pt-2 w-full font-bold">Event Casualties</span>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-900/50 shadow-xl flex flex-col items-center justify-center text-center col-span-2">
                    <span className="text-6xl font-black text-cyan-400">{totalEvacuated}</span>
                    <span className="text-sm uppercase tracking-widest text-cyan-500 mt-2 border-t border-cyan-500/20 pt-2 w-full">Individuals Evacuated</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">

                {/* Left Column: Operations Status */}
                <div className="col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    {/* Disaster Preparedness */}
                    {preparedness.length > 0 && (
                        <div className="bg-slate-800/80 p-6 rounded-2xl border border-amber-900/50 shadow-xl shrink-0">
                            <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-amber-500 border-b border-amber-900/50 pb-2 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-amber-500" />
                                Preparedness Directives
                            </h2>
                            <div className="space-y-3">
                                {preparedness.slice((preparednessPage - 1) * preparednessPerPage, preparednessPage * preparednessPerPage).map(p => (
                                    <div key={p.id} className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-lg">
                                        <h4 className="text-base font-extrabold text-amber-400 mb-1.5">{p.title}</h4>
                                        <p className="text-base text-amber-100/80 leading-relaxed break-words">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                            <PaginationBar currentPage={preparednessPage} totalItems={preparedness.length} itemsPerPage={preparednessPerPage} onPageChange={setPreparednessPage} />
                        </div>
                    )}

                    {/* Typhoon specific sections */}
                    {isWaterEvent && (
                        <>
                            {/* Water Levels */}
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-blue-900/50 shadow-xl shrink-0">
                                <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-blue-400 border-b border-blue-900/50 pb-2 flex items-center gap-2">
                                    <Waves size={20} className="text-blue-400" />
                                    Water Levels (m)
                                </h2>
                                <div className="space-y-4">
                                    {waterLevels.map(w => {
                                        const m = w.level_meters;
                                        let levelStatus = "Normal";
                                        let statusColor = "text-emerald-400";
                                        if (m >= 13) { levelStatus = "Critical"; statusColor = "text-red-400"; }
                                        else if (m >= 12) { levelStatus = "Alert"; statusColor = "text-orange-400"; }
                                        else if (m >= 11) { levelStatus = "Alarm"; statusColor = "text-yellow-400"; }

                                        return (
                                            <div key={w.id} className="flex flex-col bg-slate-900/50 p-3.5 rounded-lg border border-slate-700/50 gap-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-slate-100">{w.waterway_name}</span>
                                                        {w.updated_at ? (
                                                            <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                                As of: {dayjs(w.updated_at).format('MMM D, h:mm A')}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`text-2xl font-black ${statusColor}`}>{w.level_meters.toFixed(1)}</span>
                                                        <span className={`text-xs uppercase tracking-widest font-bold ${statusColor} bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-1`}>{levelStatus}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Flooded Areas */}
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-900/50 shadow-xl shrink-0">
                                <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-cyan-400 border-b border-cyan-900/50 pb-2 flex items-center gap-2">
                                    <Droplets size={20} className="text-cyan-400" />
                                    Flooded Areas
                                </h2>
                                <div className="space-y-3">
                                    {floodedAreas.length === 0 && <span className="text-slate-500 italic text-sm">No flooded areas reported.</span>}
                                    {floodedAreas.map(f => {
                                        let sevColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                                        if (f.severity === "Moderate") sevColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                                        if (f.severity === "High") sevColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                                        if (f.severity === "Critical") sevColor = "text-red-400 bg-red-500/10 border-red-500/20";

                                        return (
                                            <div key={f.id} className="bg-slate-900/50 border border-slate-700/50 p-3.5 rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-extrabold text-white text-base">{f.barangay}</span>
                                                    <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${sevColor}`}>{f.severity}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 flex items-start gap-1.5">
                                                    <MapPin size={14} className="shrink-0 mt-0.5" />
                                                    <span className="leading-tight">{f.area_description}</span>
                                                </p>
                                                {f.updates && f.updates.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex flex-col gap-1.5">
                                                        {f.updates.map(u => (
                                                            <div key={u.id} className="flex justify-between items-center text-[11px] text-slate-400">
                                                                <span className="font-bold text-slate-300">{u.status}</span>
                                                                <span className="font-mono">{dayjs(u.updated_at).format('MMM D, h:mm A')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="col-span-2 flex flex-col gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Recent Incident Log</h2>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left text-lg">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700 text-xl">
                                        <th className="pb-3 pr-4">Date & Time</th>
                                        <th className="pb-3 pr-4">Barangay</th>
                                        <th className="pb-3 pr-4">Incident</th>
                                        <th className="pb-3 pr-4">Severity</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4">Unit</th>
                                        <th className="pb-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.slice((incidentPage - 1) * incidentPerPage, incidentPage * incidentPerPage).map(inc => (
                                        <tr key={inc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{dayjs(inc.created_at).format("MMM D, hh:mm A")}</td>
                                            <td className="py-3 pr-4 text-blue-200">{inc.barangay}</td>
                                            <td className="py-3 pr-4 font-medium">{inc.name}</td>
                                            <td className="py-3 pr-4">
                                                <SeverityBadge severity={inc.severity} />
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2.5 py-1 rounded text-sm uppercase ${inc.status === 'Closed' ? 'bg-slate-600' : 'bg-blue-600/50 border border-blue-500'}`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-400">{inc.responding_unit}</td>
                                            <td className="py-3 text-slate-400 text-base max-w-[200px] truncate">{inc.details || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <PaginationBar currentPage={incidentPage} totalItems={incidents.length} itemsPerPage={incidentPerPage} onPageChange={setIncidentPage} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Resources & Info */}
                <div className="col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    
                    {/* Personnel Breakdown */}
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2 flex items-center gap-2">
                            <Users size={20} className="text-purple-400" />
                            Deployed Personnel
                        </h2>
                        <div className="space-y-3">
                            {personnel.length === 0 && <span className="text-slate-500 italic text-sm">No personnel data.</span>}
                            {personnel.slice((personnelPage - 1) * personnelPerPage, personnelPage * personnelPerPage).map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-slate-700/50 p-3.5 rounded-lg">
                                    <span className="text-lg font-bold text-slate-100">{p.agency}</span>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="font-mono text-2xl font-black text-blue-400">{p.deployed}</span>
                                            <span className="text-xs uppercase tracking-wider font-black text-blue-400">Deployed</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-mono text-2xl font-black text-emerald-400">{p.available}</span>
                                            <span className="text-xs uppercase tracking-wider font-black text-emerald-400">Available</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <PaginationBar currentPage={personnelPage} totalItems={personnel.length} itemsPerPage={personnelPerPage} onPageChange={setPersonnelPage} />
                    </div>

                    {/* Vehicle Monitoring */}
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2 flex items-center gap-2">
                            <Truck size={20} className="text-emerald-400" />
                            Vehicle Status
                        </h2>
                        <div className="space-y-4">
                            {vehicles.slice((vehiclePage - 1) * vehiclePerPage, vehiclePage * vehiclePerPage).map(v => (
                                <div key={v.id} className="flex flex-col bg-slate-700/50 p-3.5 rounded-lg gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-100">{v.name}</span>
                                        <span className="font-mono text-2xl font-black text-emerald-400">
                                            {v.active}/{v.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${v.total > 0 ? (v.active / v.total) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <PaginationBar currentPage={vehiclePage} totalItems={vehicles.length} itemsPerPage={vehiclePerPage} onPageChange={setVehiclePage} />
                    </div>

                    {/* Water Rescue Equipment */}
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2 flex items-center gap-2">
                            <Anchor size={20} className="text-cyan-400" />
                            Rescue Equipment
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {equipment.length === 0 && <span className="text-slate-500 italic text-sm col-span-2">No equipment logged.</span>}
                            {equipment.map(e => (
                                <div key={e.id} className="bg-slate-700/50 p-3.5 rounded-lg flex flex-col items-center justify-center text-center">
                                    <span className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">{e.name}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-black text-cyan-400">{e.deployed}</span>
                                            <span className="text-xs uppercase tracking-wider font-black text-cyan-400">Deployed</span>
                                        </div>
                                        <div className="text-xl text-slate-500 font-bold">/</div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-black text-cyan-400">{e.quantity}</span>
                                            <span className="text-xs uppercase tracking-wider font-black text-cyan-400">Total</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex flex-col h-[400px] shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Incident Types</h2>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {Object.entries(typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                                <div key={type} className="flex flex-col">
                                    <div className="flex justify-between text-base font-bold mb-1.5">
                                        <span>{type}</span>
                                        <span className="font-extrabold">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / totalIncidents) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex flex-col h-[400px] shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Barangay Heatmap</h2>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {sortedBarangays.map(([brgy, count]) => {
                                const percentage = (count / maxBarangayCount) * 100;
                                let colorClass = "bg-blue-500";
                                if (percentage > 80) colorClass = "bg-red-500";
                                else if (percentage > 50) colorClass = "bg-orange-500";
                                else if (percentage > 25) colorClass = "bg-yellow-500";

                                return (
                                    <div key={brgy} className="flex flex-col bg-slate-700/30 p-2.5 rounded-lg">
                                        <div className="flex justify-between text-base font-bold mb-1.5">
                                            <span className="text-slate-100">{brgy}</span>
                                            <span className="font-extrabold text-white">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {sortedBarangays.length === 0 && (
                                <div className="text-slate-500 italic text-center py-4">No data yet</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl shrink-0">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Emergency Contacts</h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-2xl font-bold text-slate-400 mb-1">CDRRMD / EMS</p>
                                <p className="text-5xl font-black text-white tracking-tighter">137-135</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-400 mb-1">Local Hotline</p>
                                <p className="text-5xl font-black text-white tracking-tighter">160-165</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
