"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "../dashboard-view";
import { resolveIncident, updateIncident, Incident } from "../actions";

interface IncidentListProps {
    title: string;
    incidents: Incident[];
    showCloseButton?: boolean;
}

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
        <div className="bg-white/95 p-6 rounded-lg shadow-lg border border-slate-200 flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
            <div className="space-y-4">
                {incidents.length === 0 && <p className="text-slate-500 text-sm">No incidents.</p>}
                {incidents.map((incident) => {
                    if (editingId === incident.id) {
                        return (
                            <div key={incident.id} className="border-2 border-blue-400 bg-blue-50/50 rounded-md p-4 shadow-md flex flex-col gap-3">
                                <h3 className="font-bold text-lg text-slate-900">Editing: {incident.name}</h3>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-700">Status</label>
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500">
                                        {["Reported", "Validated", "Response Ongoing", "Monitoring", "Closed"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-700">Additional Details / Log</label>
                                    <textarea 
                                        value={editDetails} 
                                        onChange={(e) => setEditDetails(e.target.value)} 
                                        rows={4} 
                                        className="border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add new updates..."
                                    />
                                </div>
                                
                                <div className="flex gap-2 mt-2">
                                    <Button onClick={() => handleSaveEdit(incident.id)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-1 h-auto text-sm">
                                        {isSaving ? "Saving..." : "Save Updates"}
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1 py-1 h-auto text-sm">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        );
                    }

                    const handleResolve = () => resolveIncident(incident.id);
                    
                    return (
                        <div key={incident.id} className="border border-slate-200 bg-white rounded-md p-4 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg text-slate-900">{incident.name}</h3>
                                <span className="text-xs bg-slate-100 text-slate-800 border px-2 py-1 rounded-full font-medium">{incident.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{incident.type}</span>
                                <SeverityBadge severity={incident.severity} />
                            </div>
                            <p className="text-sm text-slate-600"><strong>Location:</strong> {incident.location} ({incident.barangay})</p>
                            <p className="text-sm text-slate-600"><strong>Time:</strong> {dayjs(incident.created_at).format("MMM D, YYYY hh:mm A")}</p>
                            
                            {incident.details && (
                                <div className="mt-2 bg-slate-50 p-2 border border-slate-100 rounded text-sm text-slate-700 italic">
                                    <strong>Latest Log:</strong> {incident.details}
                                </div>
                            )}

                            <div className="flex gap-2 mt-2">
                                <Button onClick={() => handleEditClick(incident)} variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer h-auto py-1.5 text-sm">Update Log</Button>
                                {showCloseButton && (
                                    <Button onClick={handleResolve} variant="outline" className="flex-1 border-slate-300 hover:bg-slate-50 cursor-pointer h-auto py-1.5 text-sm">Close Incident</Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
