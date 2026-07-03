import { RealTimeClock } from "./real-time-clock";
import { SessionSwitcher } from "./session-switcher";
import { getActiveSessions } from "./actions";
import Link from "next/link";

export default async function Home() {
  const activeSessions = await getActiveSessions();
  
  if (activeSessions.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center text-center p-8">
        <div className="bg-slate-900/80 backdrop-blur-md p-12 rounded-3xl border border-slate-700 shadow-2xl max-w-2xl w-full">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4">No Active Events</h1>
          <p className="text-slate-400 text-lg mb-8">The live dashboard requires an active event session to display data. Please create a new event from the Admin Portal.</p>
          <Link href="/admin" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block">
            Go to Admin Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Massive Global Header */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md px-12 py-6 shadow-2xl border-b-2 border-slate-700/50 flex justify-between h-auto items-center shrink-0">
        <Link href="/"><h1 className="text-white text-5xl font-black tracking-widest uppercase flex items-center gap-4"><span className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>CEDOC</h1></Link>
        <div className="flex gap-6 items-center">
          <Link href="/kpi" className="text-2xl font-bold text-slate-300 hover:text-white transition-colors">KPI Analytics</Link>
          <Link href="/admin" className="text-2xl font-bold text-slate-300 hover:text-white transition-colors">Admin Portal</Link>
        </div>
      </div>
      <div className="p-10 w-full mx-auto flex flex-col gap-10 flex-1 overflow-hidden">
        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden">
          <SessionSwitcher activeSessions={activeSessions} />
        </div>
      </div>
    </div>
  );
}
