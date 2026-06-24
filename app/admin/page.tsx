import { getActiveIncidents, resolveIncident, getResources, getResolvedIncidents } from "../actions";
import { IncidentForm } from "./incident-form";
import { ResourceForm } from "./resource-form";
import { IncidentList } from "./incident-list";
import { SeverityBadge } from "../dashboard-view";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
    const activeIncidents = await getActiveIncidents();
    const resolvedIncidents = await getResolvedIncidents();
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

            <div className="p-8 max-w-[95%] mx-auto space-y-8 w-full flex-1">
                <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold tracking-tight">Operator Input Dashboard</h1>
                </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Section: Forms (Col Span 2) */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <IncidentForm />
                    <ResourceForm initialData={resources} />
                </div>
                
                {/* Middle Section: Active Incidents (Col Span 1) */}
                <div className="xl:col-span-1 flex flex-col h-[70vh]">
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <IncidentList title="Active Incidents" incidents={activeIncidents} showCloseButton={true} />
                    </div>
                </div>

                {/* Right Section: Resolved Incidents (Col Span 1) */}
                <div className="xl:col-span-1 flex flex-col h-[70vh]">
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <IncidentList title="Resolved Incidents" incidents={resolvedIncidents} showCloseButton={false} />
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
