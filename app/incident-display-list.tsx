"use client";

import { useQuery } from "@tanstack/react-query";
import { IncidentDisplay } from "./incident-display";
import { getIncidents } from "./actions";

export function IncidentDisplayList() {
    const query = useQuery({ queryKey: ['incidents'], queryFn: getIncidents, refetchInterval: 1 * 1000 });

    return (
        <div className="grid grid-cols-5 gap-4">
            {query.data?.map((_, index) => (
                <IncidentDisplay key={index} />
            ))}
        </div>
    )
}