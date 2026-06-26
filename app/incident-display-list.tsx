"use client";

import { useQuery } from "@tanstack/react-query";
import { IncidentDisplay } from "./incident-display";
import { getActiveIncidents, getResolvedIncidents } from "./actions";

export function IncidentDisplayList({ status }: { status: 'active' | 'resolved' }) {
    const query = useQuery({ 
        queryKey: ['incidents', status], 
        queryFn: status === 'active' ? getActiveIncidents : getResolvedIncidents, 
        // refetchInterval: 1 * 1000 
    });

    return (
        <div className="flex flex-col gap-6 overflow-y-auto h-full pr-2 pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            {query.data?.length === 0 && (
                <div className="flex items-center justify-center h-48 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-200/50">
                    <p className="text-slate-500 font-bold text-3xl">No {status} incidents.</p>
                </div>
            )}
            {query.data?.map((incident, index) => (
                <IncidentDisplay key={incident.id || index} incident={incident as any} />
            ))}
        </div>
    )
}