import dayjs from 'dayjs';
import { Clock, Info, MapPin } from "lucide-react";

export type Incident = {
    id: number;
    name: string;
    location: string;
    created_at: number;
    status: string;
};

export function IncidentDisplay({ incident }: { incident: Incident }) {
    const isActive = incident.status === 'active';
    
    return (
        <div className={`p-8 rounded-3xl shadow-xl border-2 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${isActive ? 'bg-white/90 border-blue-200' : 'bg-slate-50/90 border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
                <p className="text-4xl font-black text-slate-800">{incident.name}</p>
                <span className={`text-2xl px-6 py-2 rounded-full font-black tracking-widest ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                    {isActive ? 'ACTIVE' : 'RESOLVED'}
                </span>
            </div>
            
            <div className="space-y-4 text-2xl text-slate-600 font-medium mt-6">
                <div className="flex items-center gap-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                    <span className="font-bold text-slate-700">{incident.location}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                    <span>{dayjs(incident.created_at).format("MMM D, YYYY - hh:mm A")}</span>
                </div>
            </div>
        </div>
    );
}