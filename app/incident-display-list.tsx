"use client";

import { useQuery } from "@tanstack/react-query";
import { IncidentDisplay } from "./incident-display";
import { getIncidents } from "./actions";

export function IncidentDisplayList() {
    const query = useQuery({ queryKey: ['incidents'], queryFn: getIncidents, refetchInterval: 1 * 1000 });

    return (
        <div className="bg-white/90 shadow-md rounded-md flex flex-col items-stretch gap-4 flex-2 p-4">
            {query.data?.map((incident, index) => (
                <IncidentDisplay key={index} incident={incident} />
            ))}
        </div>
    )
}