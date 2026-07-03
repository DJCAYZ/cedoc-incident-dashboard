import { getKpiData, getAllSessions, getIncidents } from "../actions";
import { KpiView } from "./kpi-view";
import Link from "next/link";

export default async function KpiPage({ searchParams }: { searchParams: Promise<{ range?: string, session?: string }> }) {
    const resolvedParams = await searchParams;
    const range = (resolvedParams.range || "daily") as 'daily' | 'weekly' | 'monthly' | 'yearly';
    const sessionId = resolvedParams.session ? Number(resolvedParams.session) : undefined;
    
    // We fetch either KPI aggregated data or session specific data based on filters
    const incidents = sessionId ? await getIncidents(sessionId) : await getKpiData(range);
    const sessions = await getAllSessions();

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
            <div className="w-full bg-slate-900/80 backdrop-blur-md px-12 py-6 shadow-2xl border-b-2 border-slate-700/50 flex justify-between h-auto items-center shrink-0 z-10">
                <Link href="/"><h1 className="text-white text-5xl font-black tracking-widest uppercase flex items-center gap-4"><span className="w-4 h-4 bg-purple-500 rounded-full"></span>KPI Analytics</h1></Link>
                <div className="flex gap-6 items-center">
                    <Link href="/" className="text-2xl font-bold text-slate-300 hover:text-white transition-colors">Live Feed</Link>
                    <Link href="/admin" className="text-2xl font-bold text-slate-300 hover:text-white transition-colors">Admin Portal</Link>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-8">
                <KpiView initialIncidents={incidents} sessions={sessions} initialRange={range} initialSessionId={sessionId} />
            </div>
        </div>
    );
}
