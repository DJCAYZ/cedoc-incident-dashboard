"use client";

import { Incident, Session, getEventReportData } from "../actions";
import { generateWordReport } from "../ai-actions";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import dayjs from "dayjs";
import { useState } from "react";
import { SeverityBadge } from "../dashboard-view";
import { Download } from "lucide-react";

export function KpiView({
    initialIncidents,
    sessions,
    initialRange,
    initialSessionId
}: {
    initialIncidents: Incident[],
    sessions: Session[],
    initialRange: string,
    initialSessionId?: number
}) {
    const router = useRouter();
    const [range, setRange] = useState(initialRange);
    const [sessionId, setSessionId] = useState<number | undefined>(initialSessionId);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const handleRangeChange = (newRange: string) => {
        setRange(newRange);
        if (sessionId) {
            router.push(`/kpi?range=${newRange}&session=${sessionId}`);
        } else {
            router.push(`/kpi?range=${newRange}`);
        }
    };

    const handleSessionChange = (id: string) => {
        const numId = id ? Number(id) : undefined;
        setSessionId(numId);
        if (numId) {
            router.push(`/kpi?range=${range}&session=${numId}`);
        } else {
            router.push(`/kpi?range=${range}`);
        }
    };

    const handleDownloadReport = async () => {
        if (!sessionId) return;
        setIsDownloading(true);
        try {
            const data = await getEventReportData(sessionId);
            let csv = `CEDOC Final Event Report\n`;
            csv += `Event Name,${data.session.name}\n`;
            csv += `Status,${data.session.status.toUpperCase()}\n`;
            csv += `Started At,${dayjs(data.session.started_at).format("MMM D YYYY HH:mm")}\n`;
            csv += `Closed At,${data.session.closed_at ? dayjs(data.session.closed_at).format("MMM D YYYY HH:mm") : 'Ongoing'}\n\n`;

            csv += `--- INCIDENT LOGS ---\n`;
            csv += `Date,ID,Name,Type,Barangay,Location,Latitude,Longitude,Severity,Status,Responding Unit,Call Taker,Responder,Caller Name,Caller Phone,Caller Age,Resolved At,Dead,Injured,Missing,Evac Families,Evac Individuals,Details\n`;
            data.incidents.forEach(inc => {
                const resolvedAt = inc.resolved_at ? dayjs(inc.resolved_at).format("MMM D YYYY HH:mm") : "";
                csv += `"${dayjs(inc.created_at).format("MMM D YYYY HH:mm")}","${inc.id}","${inc.name}","${inc.type}","${inc.barangay}","${inc.location}","${inc.latitude || ''}","${inc.longitude || ''}","${inc.severity}","${inc.status}","${inc.responding_unit}","${inc.call_taker}","${inc.responder}","${inc.caller_name || ''}","${inc.caller_phone || ''}","${inc.caller_age || ''}","${resolvedAt}","${inc.casualties_dead}","${inc.casualties_injured}","${inc.casualties_missing}","${inc.evacuated_families}","${inc.evacuated_individuals}","${inc.details.replace(/"/g, '""')}"\n`;
            });
            csv += `\n`;

            csv += `--- PERSONNEL DEPLOYED ---\n`;
            csv += `Agency,Deployed,Available\n`;
            data.personnel.forEach(p => {
                csv += `"${p.agency}","${p.deployed}","${p.available}"\n`;
            });
            csv += `\n`;

            csv += `--- VEHICLES ---\n`;
            csv += `Vehicle Name,Active,Total\n`;
            data.vehicles.forEach(v => {
                csv += `"${v.name}","${v.active}","${v.total}"\n`;
            });
            csv += `\n`;

            csv += `--- RESCUE EQUIPMENT ---\n`;
            csv += `Equipment Name,Deployed,Quantity\n`;
            data.equipment.forEach(e => {
                csv += `"${e.name}","${e.deployed}","${e.quantity}"\n`;
            });
            csv += `\n`;

            csv += `--- PREPAREDNESS DIRECTIVES ---\n`;
            csv += `Date,Title,Description\n`;
            data.preparedness.forEach(p => {
                csv += `"${dayjs(p.created_at).format("MMM D YYYY HH:mm")}","${p.title.replace(/"/g, '""')}","${p.description.replace(/"/g, '""')}"\n`;
            });
            csv += `\n`;

            csv += `--- FLOODED AREAS ---\n`;
            csv += `Date,Barangay,Area Description,Severity,Depth (m),Flood Time\n`;
            data.floodedAreas.forEach(f => {
                const floodTime = f.flood_time ? dayjs(f.flood_time).format("MMM D YYYY HH:mm") : "";
                csv += `"${dayjs(f.created_at).format("MMM D YYYY HH:mm")}","${f.barangay}","${f.area_description.replace(/"/g, '""')}","${f.severity}","${f.depth_meters}","${floodTime}"\n`;
            });
            csv += `\n`;

            if (data.floodedAreaUpdates && data.floodedAreaUpdates.length > 0) {
                csv += `--- FLOODED AREA UPDATES ---\n`;
                csv += `Date,Area ID,Status\n`;
                data.floodedAreaUpdates.forEach(upd => {
                    csv += `"${dayjs(upd.updated_at).format("MMM D YYYY HH:mm")}","${upd.flooded_area_id}","${upd.status}"\n`;
                });
                csv += `\n`;
            }

            csv += `--- WATER LEVELS ---\n`;
            csv += `Date,Waterway Name,Level (m),Status\n`;
            data.waterLevels.forEach(w => {
                csv += `"${dayjs(w.updated_at).format("MMM D YYYY HH:mm")}","${w.waterway_name}","${w.level_meters}","${w.status}"\n`;
            });
            csv += `\n`;

            if (data.waterLevelUpdates && data.waterLevelUpdates.length > 0) {
                csv += `--- WATER LEVEL UPDATES ---\n`;
                csv += `Date,Water Level ID,Level (m),Status\n`;
                data.waterLevelUpdates.forEach(upd => {
                    csv += `"${dayjs(upd.updated_at).format("MMM D YYYY HH:mm")}","${upd.water_level_id}","${upd.level_meters}","${upd.status}"\n`;
                });
                csv += `\n`;
            }

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CEDOC_Report_${data.session.name.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate report", error);
            alert("Failed to generate report.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAiDownload = async () => {
        if (!sessionId) return;
        setIsGeneratingAI(true);
        try {
            const base64 = await generateWordReport(sessionId);
            
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CEDOC_AI_Report_${dayjs().format('YYYY-MM-DD')}.docx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("AI report failed", error);
            alert(error.message || "Failed to generate AI report.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // --- Data Aggregation ---

    // 1. Top Responders
    const responderCounts: Record<string, { display: string, count: number }> = {};
    initialIncidents.forEach(inc => {
        if (inc.responder && inc.responder.trim().toUpperCase() !== "UNKNOWN") {
            const key = inc.responder.trim().toUpperCase();
            if (!responderCounts[key]) {
                const display = inc.responder.trim();
                responderCounts[key] = { display, count: 0 };
            }
            responderCounts[key].count += 1;
        }
    });
    const topResponders = Object.values(responderCounts)
        .map(obj => ({ name: obj.display, count: obj.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 2. Top Call Takers
    const callTakerCounts: Record<string, { display: string, count: number }> = {};
    initialIncidents.forEach(inc => {
        if (inc.call_taker && inc.call_taker.toUpperCase() !== "UNKNOWN") {
            const key = inc.call_taker.toUpperCase();
            if (!callTakerCounts[key]) {
                const display = inc.call_taker.charAt(0).toUpperCase() + inc.call_taker.slice(1).toLowerCase();
                callTakerCounts[key] = { display, count: 0 };
            }
            callTakerCounts[key].count += 1;
        }
    });
    const topCallTakers = Object.values(callTakerCounts)
        .map(obj => ({ name: obj.display, count: obj.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 3. Most Common Incident Types
    const typeCounts: Record<string, number> = {};
    initialIncidents.forEach(inc => {
        typeCounts[inc.type] = (typeCounts[inc.type] || 0) + 1;
    });
    const commonTypes = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 4. Incidents by Hour
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    initialIncidents.forEach(inc => {
        const h = dayjs(inc.created_at).hour();
        hourCounts[h].count += 1;
    });

    // 5. Casualties Aggregation
    const totalDead = initialIncidents.reduce((sum, inc) => sum + inc.casualties_dead, 0);
    const totalInjured = initialIncidents.reduce((sum, inc) => sum + inc.casualties_injured, 0);
    const totalMissing = initialIncidents.reduce((sum, inc) => sum + inc.casualties_missing, 0);
    const totalEvacuated = initialIncidents.reduce((sum, inc) => sum + inc.evacuated_individuals, 0);

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-10">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Time Range:</span>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    {['daily', 'weekly', 'monthly', 'yearly'].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRangeChange(r)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${range === r ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-slate-600 mx-2"></div>

                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Specific Event:</span>
                <select
                    value={sessionId || ""}
                    onChange={e => handleSessionChange(e.target.value)}
                    className="bg-slate-800 border border-slate-600 text-white rounded-md px-4 py-2 font-medium focus:ring-2 focus:ring-purple-500 outline-none min-w-[250px]"
                >
                    <option value="">-- All Events (Apply Time Range) --</option>
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>

                {sessionId && (
                    <div className="ml-auto flex gap-2">
                        <button 
                            onClick={handleAiDownload} 
                            disabled={isGeneratingAI || isDownloading}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                        >
                            <Download size={18} />
                            {isGeneratingAI ? "AI is writing..." : "AI Word Report"}
                        </button>
                        <button 
                            onClick={handleDownloadReport} 
                            disabled={isDownloading || isGeneratingAI}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md font-bold transition-all disabled:opacity-50"
                        >
                            <Download size={18} />
                            {isDownloading ? "Generating..." : "CSV Report"}
                        </button>
                    </div>
                )}
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center">
                    <span className="text-5xl font-black text-blue-400">{initialIncidents.length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">Total Incidents</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center">
                    <span className="text-5xl font-black text-green-400">{initialIncidents.filter(i => i.status === 'Closed').length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">Resolved</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center">
                    <span className="text-5xl font-black text-orange-400">
                        {initialIncidents.length > 0 ? Math.round((initialIncidents.filter(i => i.status === 'Closed').length / initialIncidents.length) * 100) : 0}%
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">Resolution Rate</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-red-900/50 shadow-xl flex flex-col items-center justify-center">
                    <div className="flex gap-4 mb-2">
                        <div className="flex flex-col items-center"><span className="text-2xl font-black text-red-500">{totalDead}</span><span className="text-[10px] text-red-300 uppercase">Dead</span></div>
                        <div className="flex flex-col items-center"><span className="text-2xl font-black text-orange-400">{totalInjured}</span><span className="text-[10px] text-orange-200 uppercase">Injured</span></div>
                        <div className="flex flex-col items-center"><span className="text-2xl font-black text-yellow-500">{totalMissing}</span><span className="text-[10px] text-yellow-200 uppercase">Missing</span></div>
                    </div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest text-center mt-2 border-t border-red-500/20 pt-2 w-full">Total Casualties</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-cyan-900/50 shadow-xl flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-cyan-400">{totalEvacuated}</span>
                    <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest mt-2 text-center border-t border-cyan-500/20 pt-2 w-full">Individuals Evacuated</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-3 gap-6">

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 uppercase tracking-wider">Top Incident Types</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={commonTypes} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 uppercase tracking-wider">Top Responders</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topResponders} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 uppercase tracking-wider">Top Call Takers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCallTakers} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl col-span-3">
                    <h3 className="text-lg font-bold text-slate-300 mb-6 uppercase tracking-wider">Incident Frequency by Hour</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourCounts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" allowDecimals={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Incident Data Table */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h3 className="text-lg font-bold text-slate-300 mb-6 uppercase tracking-wider border-b border-slate-700 pb-2">Detailed Incident Log</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-700 text-sm">
                                <th className="pb-3 px-2 font-medium">Date & Time</th>
                                <th className="pb-3 px-2 font-medium">Event ID</th>
                                <th className="pb-3 px-2 font-medium">Incident Name</th>
                                <th className="pb-3 px-2 font-medium">Type</th>
                                <th className="pb-3 px-2 font-medium">Location</th>
                                <th className="pb-3 px-2 font-medium">Severity</th>
                                <th className="pb-3 px-2 font-medium">Status</th>
                                <th className="pb-3 px-2 font-medium">Call Taker</th>
                                <th className="pb-3 px-2 font-medium">Responder</th>
                                <th className="pb-3 px-2 font-medium text-center">Casualties (D/I/M)</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {initialIncidents.map(inc => (
                                <tr key={inc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                    <td className="py-3 px-2 text-slate-300 whitespace-nowrap">
                                        {dayjs(inc.created_at).format("MMM D, HH:mm")}
                                    </td>
                                    <td className="py-3 px-2 text-slate-500 font-mono text-xs">{inc.session_id}</td>
                                    <td className="py-3 px-2 font-medium text-white">{inc.name}</td>
                                    <td className="py-3 px-2 text-slate-300">{inc.type}</td>
                                    <td className="py-3 px-2 text-slate-300">
                                        <div className="flex flex-col">
                                            <span className="text-blue-200">{inc.barangay}</span>
                                            <span className="text-xs text-slate-500">{inc.location}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <SeverityBadge severity={inc.severity} />
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className={`px-2 py-1 rounded text-xs uppercase ${inc.status === 'Closed' ? 'bg-slate-600 text-slate-300' : 'bg-blue-600/50 text-blue-200 border border-blue-500'}`}>
                                            {inc.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-slate-300">{inc.call_taker}</td>
                                    <td className="py-3 px-2 text-slate-300">{inc.responder}</td>
                                    <td className="py-3 px-2 text-center">
                                        <span className="text-red-400 font-bold">{inc.casualties_dead}</span> / <span className="text-orange-400 font-bold">{inc.casualties_injured}</span> / <span className="text-yellow-500 font-bold">{inc.casualties_missing}</span>
                                    </td>
                                </tr>
                            ))}
                            {initialIncidents.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="text-center py-8 text-slate-500 italic">No incidents found for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
