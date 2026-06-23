"use client";

import { useState, useEffect } from "react";
import { createIncident, InsertIncident } from "../actions";
import { Button } from "@/components/ui/button";

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

export function IncidentForm() {
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

    const getCurrentDatetimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [datetime, setDatetime] = useState(getCurrentDatetimeLocal());
    const [isDatetimeEdited, setIsDatetimeEdited] = useState(false);

    useEffect(() => {
        if (!isDatetimeEdited) {
            const interval = setInterval(() => {
                setDatetime(getCurrentDatetimeLocal());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isDatetimeEdited]);

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
            name,
            location: street ? `${street}, ${location}` : location,
            type,
            severity,
            status,
            barangay: matchedBarangay.name,
            responding_unit: respondingUnit,
            casualties_dead: casualtiesDead,
            casualties_injured: casualtiesInjured,
            casualties_missing: casualtiesMissing,
            evacuated_families: evacuatedFamilies,
            evacuated_individuals: evacuatedIndividuals,
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
        setCasualtiesDead(0);
        setCasualtiesInjured(0);
        setCasualtiesMissing(0);
        setEvacuatedFamilies(0);
        setEvacuatedIndividuals(0);
        setDatetime(getCurrentDatetimeLocal());
        setIsDatetimeEdited(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white/95 p-6 rounded-lg shadow-lg border border-slate-200 h-[70vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 sticky top-0 bg-white pb-2 z-10 border-b">Log New Incident</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-medium text-slate-700">Incident Name/Title</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Medical Emergency at Stage" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Incident Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                        {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Severity</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                        {severities.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Responding Unit</label>
                    <select value={respondingUnit} onChange={(e) => setRespondingUnit(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                        {respondingUnits.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Location Details</label>
                    <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Near Main Stage" />
                </div>

                {barangay === "Corazon de Jesus" && (
                    <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                        <label className="text-sm font-medium text-slate-700">Street (Corazon de Jesus)</label>
                        <select value={street} onChange={(e) => setStreet(e.target.value)} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                            <option value="">Select a street...</option>
                            {corazonDeJesusStreets.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-2 col-span-2 md:col-span-1 relative">
                    <label className="text-sm font-medium text-slate-700">Barangay</label>
                    <input
                        type="text"
                        required
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
                        onFocus={() => setIsBarangayFocused(true)}
                        onBlur={handleBarangayBlur}
                        className={`border rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-full transition-colors ${!isValidBarangay ? "border-red-500 bg-red-50/50" : "border-slate-300"
                            }`}
                        placeholder="Type to search barangay..."
                    />

                    {isBarangayFocused && (
                        <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg py-1">
                            {[1, 2].map(districtNum => {
                                const districtBarangays = filteredBarangays.filter(b => b.district === districtNum);
                                if (districtBarangays.length === 0) return null;
                                return (
                                    <div key={districtNum}>
                                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                                            District {districtNum}
                                        </div>
                                        {districtBarangays.map(b => (
                                            <div
                                                key={b.name}
                                                onMouseDown={() => setBarangay(b.name)}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 transition-colors flex items-center justify-between"
                                            >
                                                <span>{b.name}</span>
                                                {barangay.toLowerCase() === b.name.toLowerCase() && (
                                                    <span className="text-blue-500 text-xs">✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                            {filteredBarangays.length === 0 && (
                                <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                                    No matching barangays
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Date & Time</label>
                    <input type="datetime-local" required value={datetime} onChange={(e) => { setDatetime(e.target.value); setIsDatetimeEdited(true); }} className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <hr className="my-2" />
            <h3 className="text-md font-semibold text-slate-800">Casualties & Evacuations</h3>

            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-700">Dead</label>
                    <input type="number" min="0" value={casualtiesDead} onChange={(e) => setCasualtiesDead(Number(e.target.value))} className="border border-slate-300 rounded-md p-2" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-700">Injured</label>
                    <input type="number" min="0" value={casualtiesInjured} onChange={(e) => setCasualtiesInjured(Number(e.target.value))} className="border border-slate-300 rounded-md p-2" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-700">Missing</label>
                    <input type="number" min="0" value={casualtiesMissing} onChange={(e) => setCasualtiesMissing(Number(e.target.value))} className="border border-slate-300 rounded-md p-2" />
                </div>
                <div className="flex flex-col gap-2 col-span-1 border-t pt-2">
                    <label className="text-xs font-medium text-slate-700">Evac. Families</label>
                    <input type="number" min="0" value={evacuatedFamilies} onChange={(e) => setEvacuatedFamilies(Number(e.target.value))} className="border border-slate-300 rounded-md p-2" />
                </div>
                <div className="flex flex-col gap-2 col-span-2 border-t pt-2">
                    <label className="text-xs font-medium text-slate-700">Evac. Individuals</label>
                    <input type="number" min="0" value={evacuatedIndividuals} onChange={(e) => setEvacuatedIndividuals(Number(e.target.value))} className="border border-slate-300 rounded-md p-2" />
                </div>
            </div>

            <Button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer w-full">Submit Incident Record</Button>
        </form>
    );
}
