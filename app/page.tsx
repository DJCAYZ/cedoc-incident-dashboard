import { RealTimeClock } from "./real-time-clock";
import { DashboardView } from "./dashboard-view";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Massive Global Header */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md px-12 py-6 shadow-2xl border-b-2 border-slate-700/50 flex justify-between h-auto items-center shrink-0">
        <Link href="/"><h1 className="text-white text-5xl font-black tracking-widest uppercase flex items-center gap-4"><span className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>CEDOC</h1></Link>
        <div className="flex gap-4">
            <Link href="/admin" className="text-2xl font-bold text-slate-300 hover:text-white transition-colors">Admin Portal</Link>
        </div>
      </div>

      <div className="p-10 w-full mx-auto flex flex-col gap-10 flex-1 overflow-hidden">
        
        {/* Top Title Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border-2 border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="font-bold text-6xl text-white tracking-tight mb-2">San Juan Wattah Wattah 2026</h1>
            <p className="text-blue-400 text-3xl font-bold uppercase tracking-widest">Live Emergency Operations Dashboard</p>
          </div>
          
          <div className="flex items-center gap-16">
              <div className="text-blue-100 font-mono text-5xl bg-slate-800/50 px-8 py-6 rounded-2xl border-2 border-slate-700/50 font-bold">
                  <RealTimeClock />
              </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden">
            <DashboardView />
        </div>

      </div>
    </div>
  );
}
