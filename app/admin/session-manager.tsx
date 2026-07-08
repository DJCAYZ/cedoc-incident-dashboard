"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createEventSession, closeSession, Session } from "../actions";
import { Activity, ShieldAlert, Plus } from "lucide-react";

export function SessionManager({ activeSessions }: { activeSessions: Session[] }) {
    const [eventName, setEventName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName.trim()) return;
        setIsCreating(true);
        await createEventSession(eventName.trim());
        setEventName("");
        setIsCreating(false);
    };

    const handleClose = async (id: number) => {
        if (confirm("Are you sure you want to close this event session?")) {
            await closeSession(id);
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl transition-all">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Active Event Controllers</h2>
                        <p className="text-slate-400 text-xs mt-0.5">Initialize or conclude specific disastrous events / operations.</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="flex w-full lg:w-auto items-center gap-3">
                    <input
                        type="text"
                        value={eventName}
                        onChange={e => setEventName(e.target.value)}
                        placeholder="e.g. Typhoon Carina"
                        className="flex-1 lg:w-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all"
                    />
                    <Button
                        type="submit"
                        disabled={isCreating || !eventName.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-auto py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:scale-100"
                    >
                        <Plus size={16} />
                        <span>Start Event</span>
                    </Button>
                </form>
            </div>

            {activeSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSessions.map(session => (
                        <div key={session.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center hover:border-slate-700 transition-all duration-200 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-100 tracking-wide">{session.name}</span>
                                    <span className="text-[10px] font-mono text-slate-500 mt-0.5">SESSION ID: #{session.id}</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleClose(session.id)}
                                variant="outline"
                                size="sm"
                                className="h-auto py-1.5 px-3.5 border-rose-500/30 text-rose-400 hover:text-white hover:bg-rose-600/20 hover:border-rose-500 cursor-pointer rounded-lg font-semibold text-xs tracking-wide transition-all"
                            >
                                Close Event
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                    <ShieldAlert className="text-slate-600 mb-2" size={24} />
                    <p className="text-sm text-slate-400 font-medium">No active disaster events currently initialized.</p>
                    <p className="text-xs text-slate-600 mt-1">Create an event using the field above to start logging and monitoring incidents.</p>
                </div>
            )}
        </div>
    );
}
