"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveIncidents, getResolvedIncidents } from "./actions";

export function MetricsDisplay() {
    const activeQuery = useQuery({ 
        queryKey: ['incidents', 'active'], 
        queryFn: getActiveIncidents, 
        refetchInterval: 1 * 1000 
    });

    const resolvedQuery = useQuery({ 
        queryKey: ['incidents', 'resolved'], 
        queryFn: getResolvedIncidents, 
        refetchInterval: 1 * 1000 
    });

    const activeCount = activeQuery.data?.length || 0;
    const resolvedCount = resolvedQuery.data?.length || 0;

    return (
        <div className="flex items-center gap-16">
            <div className="flex flex-col items-center">
                <span className="text-8xl font-black text-blue-500">{activeCount}</span>
                <span className="text-3xl uppercase tracking-widest font-black text-slate-200 mt-2">Active</span>
            </div>
            <div className="w-1.5 h-32 bg-slate-700/50 rounded-full"></div>
            <div className="flex flex-col items-center">
                <span className="text-8xl font-black text-slate-400">{resolvedCount}</span>
                <span className="text-3xl uppercase tracking-widest font-black text-slate-500 mt-2">Resolved</span>
            </div>
        </div>
    );
}
