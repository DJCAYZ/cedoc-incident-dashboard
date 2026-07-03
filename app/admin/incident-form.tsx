"use client";

import { useState, useEffect } from "react";
import { createIncident, InsertIncident, Session } from "../actions";
import { Button } from "@/components/ui/button";
import { 
    AlertCircle, 
    MapPin, 
    FileText, 
    User, 
    Users, 
    Clock, 
    Info, 
    ShieldAlert,
    ChevronDown,
    Activity
} from "lucide-react";

const incidentTypes = [
    "Medical Case", "Trauma", "Heat Exhaustion", "Slips and Falls",
    "Road Traffic Accidents", "Missing Persons", "Lost Children",
    "Fire Incidents", "Public Disturbance", "Electrical Hazards",
    "Water-related Injuries", "Other"
];

const severities = ["🔴 Critical", "🟠 High", "🟡 Moderate", "🟢 Normal"];
const statuses = ["Reported", "Validated", "Response Ongoing", "Monitoring"];
const respondingUnits = ["None", "BFP", "PNP", "EMS", "CDRRMO"];

const barangays = [
    // District 1
    { name: "Balong-Bato", district: 1 },
    { name: "Batis", district: 1 },
    { name: "Corazon de Jesus", district: 1 },
    { name: "Ermitaño", district: 1 },
    { name: "Isabelita", district: 1 },
    { name: "Kabayanan", district: 1 },
    { name: "Pasadena", district: 1 },
    { name: "Pedro Cruz", district: 1 },
    { name: "Rivera", district: 1 },
    { name: "Salapan", district: 1 },
    { name: "San Perfecto", district: 1 },
    // District 2
    { name: "Addition Hills", district: 2 },
    { name: "Greenhills", district: 2 },
    { name: "Little Baguio", district: 2 },
    { name: "Maytunas", district: 2 },
    { name: "Onse", district: 2 },
    { name: "Progreso", district: 2 },
    { name: "St. Joseph (Halo-halo)", district: 2 },
    { name: "Santa Lucia", district: 2 },
    { name: "Tibagan", district: 2 },
    { name: "West Crame", district: 2 }
];

const corazonDeJesusStreets = [
    "A. Lake Street", "Attorney A. Mendoza Street", "Benavidez Street",
    "Callejon Victoria", "Captain Manzano Street", "Corazon de Jesus Street",
    "F. Roman Street", "H. Lozada Street", "J. Ruiz Street",
    "Lactao Street", "Lope K. Santos Street", "N. Domingo Street",
    "P. Grande Street", "Pancho Villa Street", "Paraiso Street", "Pinaglabanan Street",
    "R. Lagmay Street", "S. Guzman Street"
];

export function IncidentForm({ activeSessions }: { activeSessions: Session[] }) {
    const [sessionId, setSessionId] = useState<number | "">(activeSessions.length > 0 ? activeSessions[0].id : "");
    const [callTaker, setCallTaker] = useState("");
    const [responder, setResponder] = useState("");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState(incidentTypes[0]);
    const [severity, setSeverity] = useState(severities[3]);
    const [status, setStatus] = useState(statuses[0]);
    const [barangay, setBarangay] = useState("");
    const [street, setStreet] = useState("");
    const [isBarangayFocused, setIsBarangayFocused] = useState(false);
    const [respondingUnit, setRespondingUnit] = useState(respondingUnits[0]);
    const [casualtiesDead, setCasualtiesDead] = useState(0);
    const [casualtiesInjured, setCasualtiesInjured] = useState(0);
    const [casualtiesMissing, setCasualtiesMissing] = useState(0);
    const [evacuatedFamilies, setEvacuatedFamilies] = useState(0);
    const [evacuatedIndividuals, setEvacuatedIndividuals] = useState(0);
    const [details, setDetails] = useState("");

    const getCurrentDatetimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [datetime, setDatetime] = useState("");
    const [isDatetimeEdited, setIsDatetimeEdited] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!isDatetimeEdited) {
            setDatetime(getCurrentDatetimeLocal());
            const interval = setInterval(() => {
                setDatetime(getCurrentDatetimeLocal());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isDatetimeEdited]);

    if (!isMounted) return null;

    // Filter barangays by typed value
    const filteredBarangays = barangays.filter(b =>
        b.name.toLowerCase().includes(barangay.toLowerCase())
    );

    const isValidBarangay = barangay === "" || barangays.some(b => b.name.toLowerCase() === barangay.toLowerCase());

    const handleBarangayBlur = () => {
        setTimeout(() => {
            setIsBarangayFocused(false);
            const match = barangays.find(b => b.name.toLowerCase() === barangay.trim().toLowerCase());
            if (match) {
                setBarangay(match.name);
            }
        }, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate barangay
        const matchedBarangay = barangays.find(b => b.name.toLowerCase() === barangay.trim().toLowerCase());
        if (!matchedBarangay) {
            alert("Please select a valid Barangay of San Juan City from the suggestions list.");
            return;
        }

        const timestamp = new Date(datetime).getTime();

        const incidentData: InsertIncident = {
            session_id: Number(sessionId),
            name,
            location: street ? `${street}, ${location}` : location,
            type,
            severity,
            status,
            barangay: matchedBarangay.name,
            responding_unit: respondingUnit,
            call_taker: callTaker || "Unknown",
            responder: responder || "Unknown",
            casualties_dead: casualtiesDead,
            casualties_injured: casualtiesInjured,
            casualties_missing: casualtiesMissing,
            evacuated_families: evacuatedFamilies,
            evacuated_individuals: evacuatedIndividuals,
            details: details,
            created_at: timestamp
        };

        await createIncident(incidentData);

        // Reset form
        setName("");
        setLocation("");
        setType(incidentTypes[0]);
        setSeverity(severities[3]);
        setStatus(statuses[0]);
        setBarangay("");
        setStreet("");
        setRespondingUnit(respondingUnits[0]);
        setCallTaker("");
        setResponder("");
        setCasualtiesDead(0);
        setCasualtiesInjured(0);
        setCasualtiesMissing(0);
        setEvacuatedFamilies(0);
        setEvacuatedIndividuals(0);
        setDetails("");
        setDatetime(getCurrentDatetimeLocal());
        setIsDatetimeEdited(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md pb-3 z-10 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-500" />
                    <span>Log Incident Record</span>
                </h2>
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-wider">Live Log</span>
            </div>

            {activeSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                    <AlertCircle className="text-slate-500 mb-3" size={32} />
                    <p className="text-slate-400 font-semibold text-sm">No Active Operations Base</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-[280px]">You must establish an active Event Session in the Event Controllers panel to report records.</p>
                </div>
            ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Event Select Option */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-400" />
                            <span>Select Target Event</span>
                        </label>
                        <select 
                            value={sessionId} 
                            onChange={(e) => setSessionId(Number(e.target.value))} 
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
                        >
                            {activeSessions.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} (ID: #{s.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Incident Name */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={12} className="text-blue-400" />
                            <span>Incident Name / Title</span>
                        </label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600" 
                            placeholder="e.g. Structure Fire near market, Medical Incident" 
                        />
                    </div>

                    {/* Incident Type */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Info size={12} className="text-blue-400" />
                            <span>Incident Classification</span>
                        </label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                        >
                            {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Severity */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-blue-400" />
                            <span>Incident Severity</span>
                        </label>
                        <select 
                            value={severity} 
                            onChange={(e) => setSeverity(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-semibold"
                        >
                            {severities.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-400" />
                            <span>Operational Status</span>
                        </label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                        >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Responding Unit */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} className="text-blue-400" />
                            <span>Responding Dispatch Agency</span>
                        </label>
                        <select 
                            value={respondingUnit} 
                            onChange={(e) => setRespondingUnit(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                        >
                            {respondingUnits.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Call Taker */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User size={12} className="text-blue-400" />
                            <span>Logging Dispatcher</span>
                        </label>
                        <input 
                            type="text" 
                            required 
                            value={callTaker} 
                            onChange={(e) => setCallTaker(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600" 
                            placeholder="Operator Name/Code" 
                        />
                    </div>

                    {/* Responder */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} className="text-blue-400" />
                            <span>Assigned Field Responder</span>
                        </label>
                        <input 
                            type="text" 
                            value={responder} 
                            onChange={(e) => setResponder(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600" 
                            placeholder="e.g. BFP Truck #3, Medic Alpha" 
                        />
                    </div>

                    {/* Location Details */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={12} className="text-blue-400" />
                            <span>Specific Location / Landmarks</span>
                        </label>
                        <input 
                            type="text" 
                            required 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600" 
                            placeholder="e.g. Near corner of Pinaglabanan and F. Roman St." 
                        />
                    </div>

                    {/* Barangay Picker */}
                    <div className="flex flex-col gap-1.5 relative md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={12} className="text-blue-400" />
                            <span>Assigned Barangay Area</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            onFocus={() => setIsBarangayFocused(true)}
                            onBlur={handleBarangayBlur}
                            className={`bg-slate-950 border text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600 w-full ${
                                !isValidBarangay ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500" : "border-slate-800"
                            }`}
                            placeholder="Type to search barangay..."
                        />

                        {isBarangayFocused && (
                            <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] max-h-56 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1">
                                {[1, 2].map(districtNum => {
                                    const districtBarangays = filteredBarangays.filter(b => b.district === districtNum);
                                    if (districtBarangays.length === 0) return null;
                                    return (
                                        <div key={districtNum}>
                                            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 bg-slate-950 border-b border-slate-800/80 uppercase tracking-widest sticky top-0">
                                                District {districtNum}
                                            </div>
                                            {districtBarangays.map(b => (
                                                <div
                                                    key={b.name}
                                                    onMouseDown={() => setBarangay(b.name)}
                                                    className="px-4 py-2 hover:bg-blue-600/20 cursor-pointer text-sm text-slate-300 transition-all flex items-center justify-between"
                                                >
                                                    <span>{b.name}</span>
                                                    {barangay.toLowerCase() === b.name.toLowerCase() && (
                                                        <span className="text-blue-400 text-xs">✓</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                                {filteredBarangays.length === 0 && (
                                    <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                                        No matching barangays found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Street Select for Corazon de Jesus */}
                    {barangay === "Corazon de Jesus" && (
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={12} className="text-blue-400" />
                                <span>Specific Street (Corazon de Jesus)</span>
                            </label>
                            <select 
                                value={street} 
                                onChange={(e) => setStreet(e.target.value)} 
                                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="">Select street...</option>
                                {corazonDeJesusStreets.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={12} className="text-blue-400" />
                            <span>Occurred Timestamp</span>
                        </label>
                        <input 
                            type="datetime-local" 
                            required 
                            value={datetime} 
                            onChange={(e) => { setDatetime(e.target.value); setIsDatetimeEdited(true); }} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all cursor-text" 
                        />
                    </div>

                    {/* Incident Logs/Logs Description */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={12} className="text-blue-400" />
                            <span>Detailed Logs & Updates</span>
                        </label>
                        <textarea 
                            value={details} 
                            onChange={(e) => setDetails(e.target.value)} 
                            rows={3} 
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-600 resize-none" 
                            placeholder="Enter any initial logs, emergency response actions, and updates..." 
                        />
                    </div>
                </div>

                <div className="border-t border-slate-800 my-2 pt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Casualty & Evacuation Metrics</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1 bg-slate-950/45 p-2 border border-slate-800 rounded-xl">
                            <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Dead</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={casualtiesDead} 
                                onChange={(e) => setCasualtiesDead(Number(e.target.value))} 
                                className="bg-slate-950 border border-slate-800/80 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-1 bg-slate-950/45 p-2 border border-slate-800 rounded-xl">
                            <label className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">Injured</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={casualtiesInjured} 
                                onChange={(e) => setCasualtiesInjured(Number(e.target.value))} 
                                className="bg-slate-950 border border-slate-800/80 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-1 bg-slate-950/45 p-2 border border-slate-800 rounded-xl">
                            <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">Missing</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={casualtiesMissing} 
                                onChange={(e) => setCasualtiesMissing(Number(e.target.value))} 
                                className="bg-slate-950 border border-slate-800/80 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none w-full" 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1 bg-slate-950/45 p-2 border border-slate-800 rounded-xl col-span-1">
                            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">Evac Families</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={evacuatedFamilies} 
                                onChange={(e) => setEvacuatedFamilies(Number(e.target.value))} 
                                className="bg-slate-950 border border-slate-800/80 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-1 bg-slate-950/45 p-2 border border-slate-800 rounded-xl col-span-2">
                            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">Evac Individuals</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={evacuatedIndividuals} 
                                onChange={(e) => setEvacuatedIndividuals(Number(e.target.value))} 
                                className="bg-slate-950 border border-slate-800/80 text-white rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full" 
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold h-auto py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg shadow-blue-500/25"
                >
                    Submit Incident Record
                </Button>
            </>
            )}
        </form>
    );
}
