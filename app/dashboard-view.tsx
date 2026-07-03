"use client";

import { useQuery } from "@tanstack/react-query";
import { getIncidents, getResources } from "./actions";
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
    Activity
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
            <Icon size={12} className="shrink-0" />
            {cleanSeverity}
        </span>
    );
}

export function DashboardView({ sessionId }: { sessionId: number }) {
    const { data: incidents = [] } = useQuery({
        queryKey: ['incidents', 'session', sessionId],
        queryFn: () => getIncidents(sessionId),
        refetchInterval: 1000
    });

    const { data: resources = {
        ambulances_active: 12,
        ambulances_total: 15,
        fire_trucks_active: 4,
        fire_trucks_total: 5,
        rescue_boats_active: 8,
        rescue_boats_total: 8,
        personnel_total: 142
    } } = useQuery({
        queryKey: ['resources', 'all'],
        queryFn: getResources,
        refetchInterval: 1000
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
                        <div className="flex flex-col items-center"><span className="text-4xl font-black text-red-500">{totalDead}</span><span className="text-xs text-red-300 uppercase font-bold tracking-wider">Dead</span></div>
                        <div className="flex flex-col items-center"><span className="text-4xl font-black text-orange-400">{totalInjured}</span><span className="text-xs text-orange-200 uppercase font-bold tracking-wider">Injured</span></div>
                        <div className="flex flex-col items-center"><span className="text-4xl font-black text-yellow-500">{totalMissing}</span><span className="text-xs text-yellow-200 uppercase font-bold tracking-wider">Missing</span></div>
                    </div>
                    <span className="text-sm uppercase tracking-widest text-red-400 mt-2 border-t border-red-500/20 pt-2 w-full">Event Casualties</span>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-900/50 shadow-xl flex flex-col items-center justify-center text-center col-span-2">
                    <span className="text-6xl font-black text-cyan-400">{totalEvacuated}</span>
                    <span className="text-sm uppercase tracking-widest text-cyan-500 mt-2 border-t border-cyan-500/20 pt-2 w-full">Individuals Evacuated</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">

                {/* Left Column: Breakdown & Status */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex flex-col h-1/2">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Incident Types</h2>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {Object.entries(typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                                <div key={type} className="flex flex-col">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{type}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / totalIncidents) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex flex-col h-1/2">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Barangay Heatmap</h2>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {sortedBarangays.map(([brgy, count]) => {
                                const percentage = (count / maxBarangayCount) * 100;
                                let colorClass = "bg-blue-500";
                                if (percentage > 80) colorClass = "bg-red-500";
                                else if (percentage > 50) colorClass = "bg-orange-500";
                                else if (percentage > 25) colorClass = "bg-yellow-500";

                                return (
                                    <div key={brgy} className="flex flex-col bg-slate-700/30 p-2 rounded-lg">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-200">{brgy}</span>
                                            <span className="font-bold text-white">{count}</span>
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
                </div>

                {/* Center Column: Log */}
                <div className="col-span-2 flex flex-col gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex-1 flex flex-col overflow-hidden">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Recent Incident Log</h2>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700 text-lg">
                                        <th className="pb-3 pr-4">Time</th>
                                        <th className="pb-3 pr-4">Barangay</th>
                                        <th className="pb-3 pr-4">Incident</th>
                                        <th className="pb-3 pr-4">Severity</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4">Unit</th>
                                        <th className="pb-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.slice(0, 15).map(inc => (
                                        <tr key={inc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-3 pr-4 text-blue-200">{inc.barangay}</td>
                                            <td className="py-3 pr-4 font-medium">{inc.name}</td>
                                            <td className="py-3 pr-4">
                                                <SeverityBadge severity={inc.severity} />
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2 py-1 rounded text-xs uppercase ${inc.status === 'Closed' ? 'bg-slate-600' : 'bg-blue-600/50 border border-blue-500'}`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-400">{inc.responding_unit}</td>
                                            <td className="py-3 text-slate-400 text-sm max-w-[200px] truncate">{inc.details || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Resources & Contacts */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Resource Monitoring</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col bg-slate-700/50 p-3 rounded-lg gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <Ambulance size={18} className="text-green-400" />
                                        <span>Ambulances</span>
                                    </span>
                                    <span className="font-mono text-xl text-green-400">
                                        {resources.ambulances_active}/{resources.ambulances_total}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(resources.ambulances_active / resources.ambulances_total) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col bg-slate-700/50 p-3 rounded-lg gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <Flame size={18} className="text-yellow-400" />
                                        <span>Fire Trucks</span>
                                    </span>
                                    <span className="font-mono text-xl text-yellow-400">
                                        {resources.fire_trucks_active}/{resources.fire_trucks_total}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(resources.fire_trucks_active / resources.fire_trucks_total) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <Shield size={18} className="text-purple-400" />
                                    <span>Personnel</span>
                                </span>
                                <span className="font-mono text-xl text-blue-400">
                                    {resources.personnel_total}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 shadow-xl flex-1">
                        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider text-slate-300 border-b border-slate-600 pb-2">Emergency Contacts</h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-4xl font-bold text-slate-400 mb-1">CDRRMO / EMS</p>
                                <p className="text-8xl font-black text-white tracking-tighter">137-135</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-slate-400 mb-1">Local</p>
                                <p className="text-8xl font-black text-white tracking-tighter">160-165</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
