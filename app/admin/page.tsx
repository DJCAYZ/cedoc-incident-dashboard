import { getActiveIncidents, getVehicles, getWaterRescueEquipment, getResolvedIncidents, getActiveSessions } from "../actions";
import { IncidentForm } from "./incident-form";
import { ResourceForm } from "./resource-form";
import { PersonnelForm } from "./personnel-form";
import { PreparednessForm } from "./preparedness-form";
import { FloodForm } from "./flood-form";
import { IncidentList } from "./incident-list";
import Link from "next/link";
import { SessionManager } from "./session-manager";

export default async function AdminPage() {
    // We get all active sessions to pass to the form
    const activeSessions = await getActiveSessions();

    const activeIncidents = await getActiveIncidents();
    const resolvedIncidents = await getResolvedIncidents();
    const vehicles = await getVehicles();
    const equipment = await getWaterRescueEquipment();

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
            {/* Standard Control Room Header */}
                <div className="w-full bg-slate-900/80 backdrop-blur-md px-12 py-5 shadow-2xl border-b-2 border-slate-800 flex justify-between h-auto items-center shrink-0 z-10">
                    <Link href="/">
                        <h1 className="text-white text-3xl font-black tracking-widest uppercase flex items-center gap-3">
                            <span className="w-3.5 h-3.5 bg-red-600 rounded-full animate-ping absolute"></span>
                            <span className="w-3.5 h-3.5 bg-red-600 rounded-full"></span>
                            CEDOC ADMIN
                        </h1>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <Link href="/kpi" className="text-xl font-bold text-slate-400 hover:text-white hover:underline decoration-blue-500 decoration-2 transition-all">KPI Analytics</Link>
                        <Link href="/" className="text-xl font-bold text-slate-400 hover:text-white hover:underline decoration-blue-500 decoration-2 transition-all">Live Feed</Link>
                    </div>
                </div>

                {/* Main Layout Container */}
                <div className="p-8 w-full mx-auto flex flex-col gap-6 flex-1 overflow-hidden">
                    {/* Session Active State Bar */}
                    <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-xl border border-slate-800/80 shrink-0">
                        <h2 className="text-xl font-bold tracking-wider text-slate-200">Incident Command Center</h2>
                        <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-xs">
                            {activeSessions.length > 0 ? (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-slate-300 font-semibold">{activeSessions.length} Active Event{activeSessions.length > 1 ? 's' : ''} Online</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span className="text-slate-300 font-semibold">No Active Events Command</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Session Manager Bar */}
                    <div className="shrink-0">
                        <SessionManager activeSessions={activeSessions} />
                    </div>

                    {/* Split Operational Columns */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 overflow-hidden">
                        {/* Primary Form: Incident Logging */}
                        <div className="xl:col-span-2 flex flex-col overflow-hidden h-full">
                            <IncidentForm activeSessions={activeSessions} />
                        </div>

                        {/* Secondary Forms: Session Management */}
                        <div className="xl:col-span-1 flex flex-col gap-6 overflow-y-auto pr-1">
                            <ResourceForm initialVehicles={vehicles} initialEquipment={equipment} />
                            <PersonnelForm activeSessions={activeSessions} />
                            <PreparednessForm activeSessions={activeSessions} />
                            <FloodForm activeSessions={activeSessions} />
                        </div>

                        {/* Active Logs */}
                        <div className="xl:col-span-1 flex flex-col overflow-hidden h-full">
                            <IncidentList title="Active Incident Logs" incidents={activeIncidents} showCloseButton={true} />
                        </div>

                        {/* Resolved Archive */}
                        <div className="xl:col-span-1 flex flex-col overflow-hidden h-full">
                            <IncidentList title="Resolved Incident Logs" incidents={resolvedIncidents} showCloseButton={false} />
                        </div>
                    </div>
                </div>
            </div>
    );
}
