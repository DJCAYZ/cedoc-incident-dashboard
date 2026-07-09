"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { getIncidents, Session } from "./actions";
import dayjs from "dayjs";
import { Sun, Moon } from "lucide-react";

// Static map data imports
import streetsDataRaw from "../public/map/streets.json";
import barangaysDataRaw from "../public/map/barangays.json";
import sanjuanGeoRaw from "../public/map/sanjuan.json";
import sanjuanStreetsRaw from "../public/map/sanjuan-streets.json";
import sanJuanRiverRaw from "../public/map/san-juan-river.json";
import ermitanoCreekRaw from "../public/map/ermitano-creek.json";
import maytunasCreekRaw from "../public/map/maytunas-creek.json";

const streetsData = streetsDataRaw as any;
const barangaysData = barangaysDataRaw as any;
const sanjuanGeo = sanjuanGeoRaw as any;
const sanjuanStreets = sanjuanStreetsRaw as any;

const wrapFeature = (geometry: any, name: string) => ({
    type: "Feature",
    properties: { name },
    geometry
});

// Pre-compute street geometry map from real OSM data (sanjuan-streets.json)
const streetGeometryMap: Record<string, [number, number][]> = {};
if (sanjuanStreets && sanjuanStreets.features) {
    sanjuanStreets.features.forEach((feature: any) => {
        if (!feature.properties?.name) return;
        const name = feature.properties.name.toLowerCase().trim();
        let coords: [number, number][] = [];
        if (feature.geometry.type === "LineString") {
            coords = feature.geometry.coordinates;
        } else if (feature.geometry.type === "MultiLineString") {
            coords = feature.geometry.coordinates.flat();
        }
        if (coords.length > 0) {
            if (streetGeometryMap[name]) {
                streetGeometryMap[name] = streetGeometryMap[name].concat(coords);
            } else {
                streetGeometryMap[name] = coords;
            }
        }
    });
}

const severityColor = (severity: string) => {
    if (severity.includes("Critical")) return "#ef4444";
    if (severity.includes("High")) return "#f97316";
    if (severity.includes("Moderate")) return "#eab308";
    return "#10b981";
};

export function IncidentMap({ session }: { session: Session }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const choroplethLayerRef = useRef<L.LayerGroup | null>(null);
    const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    const { data: incidents = [] } = useQuery({
        queryKey: ["incidents", session.id],
        queryFn: () => getIncidents(session.id),
        refetchInterval: 3000,
    });

    const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Closed">("Active");
    const [mapTheme, setMapTheme] = useState<"dark" | "light">("light");

    const filteredIncidents = incidents.filter(inc => {
        if (statusFilter === "Active") return inc.status !== "Closed";
        if (statusFilter === "Closed") return inc.status === "Closed";
        return true;
    });

    // Mount: initialize map + static layers once
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const map = L.map(mapRef.current, { zoomControl: true }).setView([14.602, 121.035], 15);
        mapInstance.current = map;

        tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Layer order matters — add choropleth first (bottom), incidents last (top)
        choroplethLayerRef.current = L.layerGroup().addTo(map);

        // Streets (static, middle layer)
        L.geoJSON(sanjuanStreets, {
            style: { color: "#64748b", weight: 0.6, opacity: 0.35 }
        }).addTo(map);

        // Waterways (static, above streets)
        const waterwayFeatures = {
            type: "FeatureCollection",
            features: [
                wrapFeature(sanJuanRiverRaw, "San Juan River"),
                wrapFeature(ermitanoCreekRaw, "Ermitaño Creek"),
                wrapFeature(maytunasCreekRaw, "Maytunas Creek")
            ]
        };
        L.geoJSON(waterwayFeatures as any, {
            style: { color: "#0ea5e9", weight: 3, opacity: 0.75 },
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(feature.properties.name, { sticky: true });
            }
        }).addTo(map);

        // Incidents layer on top
        incidentsLayerRef.current = L.layerGroup().addTo(map);

        return () => {
            map.remove();
            mapInstance.current = null;
            choroplethLayerRef.current = null;
            incidentsLayerRef.current = null;
            tileLayerRef.current = null;
        };
    }, []);

    // Theme toggle effect
    useEffect(() => {
        if (tileLayerRef.current) {
            const url = mapTheme === 'dark' 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            tileLayerRef.current.setUrl(url);
        }
    }, [mapTheme]);

    // Reactive: update choropleth + markers when incidents or filter changes
    useEffect(() => {
        if (!mapInstance.current) return;

        // --- Choropleth ---
        if (choroplethLayerRef.current) {
            choroplethLayerRef.current.clearLayers();

            const counts: Record<string, number> = {};
            filteredIncidents.forEach(inc => {
                counts[inc.barangay] = (counts[inc.barangay] || 0) + 1;
            });

            L.geoJSON(sanjuanGeo, {
                // Only render Polygon features — Point features in this file cause broken default icon markers
                filter: (feature) => feature?.geometry?.type === "Polygon" || feature?.geometry?.type === "MultiPolygon",
                style: (feature) => {
                    const name = feature?.properties?.name;
                    const count = counts[name] || 0;
                    let fillColor = "#0f172a"; // no incidents — near-transparent slate
                    if (count >= 1) fillColor = "#1d4ed8"; // blue-700
                    if (count >= 3) fillColor = "#d97706"; // amber-600
                    if (count >= 6) fillColor = "#dc2626"; // red-600
                    return {
                        color: "#334155",   // slate-700 border
                        weight: 1.5,
                        fillColor,
                        fillOpacity: count > 0 ? 0.45 : 0.15,
                    };
                },
                onEachFeature: (feature, layer) => {
                    const name = feature?.properties?.name;
                    const count = counts[name] || 0;
                    
                    const bg = mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.6)';
                    const border = mapTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    const color = mapTheme === 'dark' ? '#f8fafc' : '#0f172a';
                    const subColor = mapTheme === 'dark' ? '#94a3b8' : '#64748b';
                    
                    layer.bindTooltip(
                        `<div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; padding: 4px 10px; border-radius: 20px; background: ${bg}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid ${border}; color: ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">${name}<br/><span style="font-size:9px; font-weight: 500; color:${subColor}; margin-top: 2px; display: block;">${count} incident${count !== 1 ? 's' : ''}</span></div>`,
                        { direction: "center", permanent: true, opacity: 1, className: "bg-transparent border-none shadow-none p-0" }
                    );
                }
            }).addTo(choroplethLayerRef.current);
        }

        // --- Incident Markers ---
        if (!incidentsLayerRef.current) return;
        incidentsLayerRef.current.clearLayers();

        filteredIncidents.forEach(inc => {
            let lat = 0, lng = 0;
            let isCentroidFallback = false;

            if (inc.latitude !== null && inc.longitude !== null && inc.latitude !== undefined) {
                // Priority 1: Exact map pin dropped by admin
                lat = inc.latitude;
                lng = inc.longitude;
            } else {
                // Priority 2: Fall back to street and barangay distance logic
                // 1. Get Barangay Centroid
                const bgy = barangaysData.barangays.find((b: any) => b.name === inc.barangay);
                const bgyLat = bgy?.coordinates ? bgy.coordinates[0] : null;
                const bgyLng = bgy?.coordinates ? bgy.coordinates[1] : null;

                // 2. Attempt street-level coordinate resolution
                const streetName = inc.location.split(",")[0].trim().toLowerCase();
                let matchedCoords = streetGeometryMap[streetName];
            
            if (!matchedCoords) {
                const fuzzyMatch = Object.keys(streetGeometryMap).find(k => k.includes(streetName) || streetName.includes(k));
                if (fuzzyMatch) matchedCoords = streetGeometryMap[fuzzyMatch];
            }

            if (matchedCoords && matchedCoords.length > 0 && bgyLat && bgyLng) {
                // Sort points by distance to barangay centroid to keep the pin inside the correct barangay
                // GeoJSON coords are [lng, lat]
                const sorted = [...matchedCoords].sort((a, b) => {
                    const distA = Math.pow(a[1] - bgyLat, 2) + Math.pow(a[0] - bgyLng, 2);
                    const distB = Math.pow(b[1] - bgyLat, 2) + Math.pow(b[0] - bgyLng, 2);
                    return distA - distB;
                });
                
                // Take top 5 closest points to spread out identical incidents on the same segment
                const closestPoints = sorted.slice(0, 5);
                const index = inc.id % closestPoints.length;
                lng = closestPoints[index][0];
                lat = closestPoints[index][1];
            } else if (matchedCoords && matchedCoords.length > 0) {
                // Fallback if barangay centroid is missing
                const index = inc.id % matchedCoords.length;
                lng = matchedCoords[index][0];
                lat = matchedCoords[index][1];
            } else if (bgyLat && bgyLng) {
                // Fallback to barangay centroid if street not found
                lat = bgyLat;
                lng = bgyLng;
                isCentroidFallback = true;
            }
            } // Close the else block for Priority 2

            if (!lat || !lng) return;

            // Apply jitter if it's a fallback to prevent stacking
            if (isCentroidFallback) {
                // ~30-100m spread using incident ID as seed
                const angle = (inc.id * 137.508) % 360; // golden angle
                const radius = 0.0003 + (inc.id % 7) * 0.0001;
                lat += radius * Math.cos(angle * Math.PI / 180);
                lng += radius * Math.sin(angle * Math.PI / 180);
            }

            const color = severityColor(inc.severity);

            const isActive = inc.status !== "Closed";
            const borderCol = mapTheme === 'dark' ? '#0f172a' : '#ffffff';
            
            const html = `
                <div style="position: relative; width: 16px; height: 16px;">
                    ${isActive ? `<div class="animate-hud-pulse" style="position: absolute; top: 50%; left: 50%; width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${color}; color: ${color}; pointer-events: none;"></div>` : ''}
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2px solid ${borderCol}; box-shadow: 0 0 10px ${color}; pointer-events: auto;"></div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: html,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                popupAnchor: [0, -8]
            });

            const marker = L.marker([lat, lng], {
                icon: customIcon
            });

            const popupHtml = `
                <div style="font-family:'Fira Code',monospace;background:#0f172a;color:#e2e8f0;min-width:220px;border-radius:12px;overflow:hidden;">
                    <div style="background:${color}18;border-bottom:1px solid ${color}40;padding:10px 14px;">
                        <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:.08em;">${dayjs(inc.created_at).format("MMM D, YYYY — hh:mm A")}</div>
                        <div style="font-size:15px;font-weight:700;color:#f8fafc;">${inc.name}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${inc.type || ""}</div>
                    </div>
                    <div style="padding:10px 14px;display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;gap:6px;align-items:center;">
                            <span style="background:${color}20;color:${color};border:1px solid ${color}50;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;">${inc.severity}</span>
                            <span style="background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:5px;padding:2px 8px;font-size:10px;text-transform:uppercase;">${inc.status}</span>
                        </div>
                        <div style="font-size:12px;"><span style="color:#64748b;">📍 </span>${inc.location}</div>
                        <div style="font-size:12px;"><span style="color:#64748b;">🏘️ </span>${inc.barangay}</div>
                        <div style="font-size:12px;"><span style="color:#64748b;">🚒 </span>${inc.responding_unit || "Unassigned"}</div>
                        ${inc.details ? `<div style="font-size:11px;color:#94a3b8;border-top:1px solid #1e293b;padding-top:6px;margin-top:2px;">${inc.details}</div>` : ""}
                    </div>
                </div>
            `;

            marker.bindPopup(popupHtml, {
                maxWidth: 280,
                className: "cedoc-popup",
            });

            marker.addTo(incidentsLayerRef.current!);
        });

    }, [filteredIncidents, mapTheme]);

    return (
        <div className="flex-1 w-full h-full bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl min-h-[400px]">
            {/* Legend */}
            <div className="absolute bottom-8 left-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs font-mono text-slate-300 space-y-1.5 pointer-events-none">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Barangay Density</div>
                {[["#1d4ed8","1–2 incidents"],["#d97706","3–5 incidents"],["#dc2626","6+ incidents"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{background:c}}/>
                        <span>{l}</span>
                    </div>
                ))}
                <div className="border-t border-slate-700 pt-1.5 mt-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Severity</div>
                {[["#10b981","Normal"],["#eab308","Moderate"],["#f97316","High"],["#ef4444","Critical"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{background:c}}/>
                        <span>{l}</span>
                    </div>
                ))}
            </div>

            {/* Filter Panel */}
            <div className="absolute top-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-2xl flex gap-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 flex items-center">Filter</div>
                {(["All", "Active", "Closed"] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            statusFilter === status
                                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-20 right-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-2xl flex gap-1">
                <button
                    onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
                    className="px-3 py-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    title="Toggle Map Theme"
                >
                    {mapTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>

            {/* Incident count badge */}
            <div className="absolute top-6 left-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2 shadow-2xl font-mono pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Showing </span>
                <span className="text-white font-bold">{filteredIncidents.length}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500"> incident{filteredIncidents.length !== 1 ? "s" : ""}</span>
            </div>

            <style jsx global>{`
                .cedoc-popup .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(51,65,85,0.8) !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                }
                .cedoc-popup .leaflet-popup-content {
                    margin: 0 !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                }
                .cedoc-popup .leaflet-popup-tip-container {
                    display: none !important;
                }
                .cedoc-popup .leaflet-popup-close-button {
                    color: #64748b !important;
                    top: 6px !important;
                    right: 8px !important;
                    font-size: 18px !important;
                    z-index: 10;
                }
                .leaflet-tooltip-clean {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .leaflet-container {
                    z-index: 0 !important;
                }
            `}</style>
            {/* Map canvas — last in DOM, but z-index:0 via CSS above creates isolated stacking context */}
            <div ref={mapRef} className="w-full h-full relative z-0" />
        </div>
    );
}
