"use client";

import { useState } from "react";
import { DashboardView } from "./dashboard-view";
import { Session } from "./actions";
import { RealTimeClock } from "./real-time-clock";

export function SessionSwitcher({ activeSessions }: { activeSessions: Session[] }) {
    // Default to the first active session
    const defaultSession = activeSessions[0];
    const [selectedSessionId, setSelectedSessionId] = useState<number>(defaultSession?.id || 0);

    const selectedSession = activeSessions.find(s => s.id === selectedSessionId) || defaultSession;

    if (!selectedSessionId) {
        return <div className="text-white p-10 text-2xl">No active sessions found.</div>;
    }

    return (
        <div className="flex flex-col gap-10 h-full overflow-hidden">
            {/* Top Title Bar (Moved from page.tsx so it can be dynamic) */}
            <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border-2 border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-8 shrink-0">
                <div className="flex flex-col">
                    <h1 className="font-bold text-6xl text-white tracking-tight mb-2">
                        {selectedSession.name}
                    </h1>
                    <p className="text-blue-400 text-3xl font-bold uppercase tracking-widest">
                        Live Emergency Operations Dashboard
                    </p>
                </div>
                <div className="flex items-center gap-16">
                    <div className="text-blue-100 font-mono text-5xl bg-slate-800/50 px-8 py-6 rounded-2xl border-2 border-slate-700/50 font-bold">
                        <RealTimeClock />
                    </div>
                </div>
            </div>

            {activeSessions.length > 1 && (
                <div className="flex gap-2 shrink-0 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 overflow-x-auto">
                    {activeSessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`px-6 py-3 rounded-lg font-bold transition-all text-lg whitespace-nowrap ${selectedSessionId === session.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            {session.name}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="flex-1 overflow-hidden">
                <DashboardView sessionId={selectedSessionId} />
            </div>
        </div>
    );
}
