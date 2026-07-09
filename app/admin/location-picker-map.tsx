"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Map, Sun, Moon } from "lucide-react";
import sanjuanGeoRaw from "../../public/map/sanjuan.json";

export default function LocationPickerMap({ lat, lng, onChange, onClose }: { lat: number | null, lng: number | null, onChange: (lat: number, lng: number) => void, onClose: () => void }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const marker = useRef<L.Marker | null>(null);
    const tempCoords = useRef<{ lat: number, lng: number } | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        if (tileLayerRef.current) {
            tileLayerRef.current.setUrl(`https://{s}.basemaps.cartocdn.com/${mapTheme}_all/{z}/{x}/{y}{r}.png`);
        }
    }, [mapTheme]);

    useEffect(() => {
        if (!mapRef.current) return;
        
        // Default to San Juan City center
        const defaultLat = 14.6041;
        const defaultLng = 121.0315;

        leafletMap.current = L.map(mapRef.current).setView(
            [lat ?? defaultLat, lng ?? defaultLng], 
            15
        );

        tileLayerRef.current = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${mapTheme}_all/{z}/{x}/{y}{r}.png`, {
            maxZoom: 19,
        }).addTo(leafletMap.current);

        // Fix leaflet default icon issue without images
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Add San Juan Boundary Layer
        L.geoJSON(sanjuanGeoRaw as any, {
            filter: (feature) => feature?.geometry?.type === "Polygon" || feature?.geometry?.type === "MultiPolygon",
            style: {
                color: "#475569",
                weight: 1.5,
                opacity: 0.6,
                fillColor: "#0f172a",
                fillOpacity: 0.3
            },
            onEachFeature: (feature, layer) => {
                const name = feature?.properties?.name;
                if (name) {
                    layer.bindTooltip(
                        `<div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">${name}</div>`,
                        { direction: "center", permanent: true, opacity: 1, className: "bg-transparent border-none shadow-none p-0" }
                    );
                }
            }
        }).addTo(leafletMap.current);

        if (lat !== null && lng !== null) {
            marker.current = L.marker([lat, lng]).addTo(leafletMap.current);
            tempCoords.current = { lat, lng };
        }

        leafletMap.current.on('click', (e) => {
            const { lat: clickLat, lng: clickLng } = e.latlng;
            tempCoords.current = { lat: clickLat, lng: clickLng };
            if (marker.current) {
                marker.current.setLatLng([clickLat, clickLng]);
            } else {
                marker.current = L.marker([clickLat, clickLng]).addTo(leafletMap.current!);
            }
        });

        // Trigger resize when modal opens to ensure tiles load correctly
        setTimeout(() => {
            leafletMap.current?.invalidateSize();
        }, 100);

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
            }
        };
    }, []);

    const handleConfirm = () => {
        if (tempCoords.current) {
            onChange(tempCoords.current.lat, tempCoords.current.lng);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[60vh] flex flex-col shadow-2xl overflow-hidden shadow-black/50">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div>
                        <h3 className="text-white font-bold tracking-wide flex items-center gap-2"><Map size={18} className="text-blue-500" /> Pinpoint Exact Location</h3>
                        <p className="text-slate-400 text-xs mt-1">Click anywhere on the map to drop a pin. San Juan boundaries are outlined in grey.</p>
                    </div>
                    <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onClose}>✕</Button>
                </div>
                <div className="flex-1 relative bg-slate-800">
                    <div ref={mapRef} className="absolute inset-0 z-0" />
                    <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-2xl flex gap-1 pointer-events-auto">
                        <button
                            type="button"
                            onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
                            className="px-3 py-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                            title="Toggle Map Theme"
                        >
                            {mapTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" className="text-slate-300 hover:text-white" onClick={onClose}>Cancel</Button>
                    <Button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold shadow-lg shadow-blue-500/20" onClick={handleConfirm}>Confirm Location</Button>
                </div>
            </div>
        </div>
    );
}
