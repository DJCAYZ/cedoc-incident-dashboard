"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "../dashboard-view";
import { resolveIncident, updateIncident, Incident } from "../actions";
import { Edit3, CheckCircle2, X, Save, AlertCircle, Clock, MapPin } from "lucide-react";

interface IncidentListProps {
    title: string;
    incidents: Incident[];
    showCloseButton?: boolean;
}

const statusColors: Record<string, string> = {
    "Reported": "bg-slate-800 text-slate-300 border-slate-700",
    "Validated": "bg-emerald-950/30 text-emerald-400 border-emerald-500/20",
    "Response Ongoing": "bg-blue-950/30 text-blue-400 border-blue-500/20",
    "Monitoring": "bg-amber-950/30 text-amber-400 border-amber-500/20",
    "Closed": "bg-slate-900 text-slate-500 border-slate-800"
};

export function IncidentList({ title, incidents, showCloseButton = true }: IncidentListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDetails, setEditDetails] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = (incident: Incident) => {
        setEditingId(incident.id);
        setEditDetails(incident.details || "");
        setEditStatus(incident.status);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (id: number) => {
        setIsSaving(true);
        try {
            await updateIncident(id, { details: editDetails, status: editStatus });
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update incident", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex-1 flex flex-col overflow-hidden h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-md text-slate-500 font-mono font-semibold border border-slate-800/80">{incidents.length} Records</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {incidents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm italic">
                        <AlertCircle size={20} className="mb-2 text-slate-600" />
                        <span>No logged incidents.</span>
                    </div>
                )}

                {incidents.map((incident) => {
                    if (editingId === incident.id) {
                        return (
                            <div key={incident.id} className="border-2 border-blue-500 bg-slate-900 shadow-xl shadow-blue-500/10 rounded-xl p-4 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h3 className="font-bold text-sm text-white truncate max-w-[200px]">Edit: {incident.name}</h3>
                                    <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md">
                                        <X size={14} />
                                    </Button>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status State</label>
                                    <select 
                                        value={editStatus} 
                                        onChange={(e) => setEditStatus(e.target.value)} 
                                        className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none cursor-pointer"
                                    >
                                        {["Reported", "Validated", "Response Ongoing", "Monitoring", "Closed"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Update Operational Details</label>
                                    <textarea 
                                        value={editDetails} 
                                        onChange={(e) => setEditDetails(e.target.value)} 
                                        rows={3} 
                                        className="bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none placeholder-slate-600 resize-none"
                                        placeholder="Add new updates..."
                                    />
                                </div>
                                
                                <div className="flex gap-2.5 mt-1 border-t border-slate-800/85 pt-3">
                                    <Button 
                                        onClick={() => handleSaveEdit(incident.id)} 
                                        disabled={isSaving} 
                                        className="bg-blue-600 hover:bg-blue-500 text-white flex-1 py-2 h-auto text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Save size={12} />
                                        <span>{isSaving ? "Saving..." : "Save Updates"}</span>
                                    </Button>
                                    <Button 
                                        onClick={handleCancelEdit} 
                                        variant="outline" 
                                        className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex-1 py-2 h-auto text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        );
                    }

                    const handleResolve = () => resolveIncident(incident.id);
                    
                    return (
                        <div key={incident.id} className="border border-slate-800/60 bg-slate-950/45 rounded-xl p-4 flex flex-col gap-2.5 hover:border-slate-800 transition-all duration-200 shadow-md group">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-base text-slate-100 group-hover:text-white tracking-wide transition-colors">{incident.name}</h3>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border rounded-full shrink-0 ${statusColors[incident.status] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                                    {incident.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 border border-blue-500/15 rounded text-[10px] font-bold uppercase tracking-wider">{incident.type}</span>
                                <SeverityBadge severity={incident.severity} />
                            </div>

                            <div className="flex flex-col gap-1 text-xs text-slate-400 mt-1 border-t border-slate-900 pt-2.5">
                                <div className="flex items-start gap-2">
                                    <MapPin size={12} className="text-slate-500 shrink-0 mt-0.5" />
                                    <span className="leading-tight"><strong className="text-slate-300">Location:</strong> {incident.location} ({incident.barangay})</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={12} className="text-slate-500 shrink-0" />
                                    <span><strong className="text-slate-300">Logged:</strong> {dayjs(incident.created_at).format("MMM D, YYYY hh:mm A")}</span>
                                </div>
                            </div>
                            
                            {incident.details && (
                                <div className="bg-slate-900/60 p-2.5 border border-slate-800/50 rounded-lg text-xs text-slate-300 italic border-l-2 border-l-blue-500/40">
                                    <span className="font-semibold text-[10px] text-blue-400 not-italic uppercase tracking-wide block mb-0.5">Latest Operational Log</span>
                                    {incident.details}
                                </div>
                            )}

                            <div className="flex gap-2.5 mt-2 border-t border-slate-900 pt-3">
                                <Button 
                                    onClick={() => handleEditClick(incident)} 
                                    variant="outline" 
                                    className="border-slate-800 text-blue-400 hover:text-white hover:bg-blue-600/15 hover:border-blue-500/30 flex-1 cursor-pointer h-auto py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <Edit3 size={12} />
                                    <span>Update Log</span>
                                </Button>
                                {showCloseButton && (
                                    <Button 
                                        onClick={handleResolve} 
                                        variant="outline" 
                                        className="border-slate-800 text-rose-400 hover:text-white hover:bg-rose-600/15 hover:border-rose-500/30 flex-1 cursor-pointer h-auto py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <CheckCircle2 size={12} />
                                        <span>Close Incident</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
