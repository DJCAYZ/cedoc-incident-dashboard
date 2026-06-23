import { getActiveIncidents, resolveIncident, getResources } from "../actions";
import { IncidentForm } from "./incident-form";
import { ResourceForm } from "./resource-form";
import { SeverityBadge } from "../dashboard-view";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
    const activeIncidents = await getActiveIncidents();
    const resources = await getResources();

    return (
        <div className="flex flex-col h-screen">
            {/* Standard Laptop Header */}
            <div className="w-full bg-slate-900/80 backdrop-blur-md px-8 py-4 shadow-lg border-b border-slate-700/50 flex justify-between h-auto items-center">
                <Link href="/"><h1 className="text-white text-xl font-bold tracking-widest uppercase flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>CEDOC</h1></Link>
                <div className="flex gap-4">
                    <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Live Feed</Link>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto space-y-8 w-full flex-1">
                <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold tracking-tight">Operator Input Dashboard</h1>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <IncidentForm />
                </div>
                
                <div className="flex flex-col gap-6 h-[70vh]">
                    <ResourceForm initialData={resources} />
                    
                    <div className="bg-white/95 p-6 rounded-lg shadow-lg border border-slate-200 flex-1 overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Active Incidents</h2>
                        <div className="space-y-4">
                            {activeIncidents.length === 0 && <p className="text-slate-500 text-sm">No active incidents.</p>}
                            {activeIncidents.map((incident) => {
                                const resolve = resolveIncident.bind(null, incident.id);
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
                                        <form action={resolve}>
                                            <Button type="submit" variant="outline" className="w-full mt-2 border-slate-300 hover:bg-slate-50 cursor-pointer">Close Incident</Button>
                                        </form>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
