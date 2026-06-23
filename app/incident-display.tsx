import { Ambulance, Clock, Info, MapPin } from "lucide-react";

export function IncidentDisplay() {
    return (
        <div className="bg-gray-200 p-2 rounded-sm shadow-md outline">
            <div className="flex flex-col justify-center items-center w-full">
                {/* <Ambulance className="w-12 h-12"/> */}
                <p className="text-center text-lg font-semibold my-2">Trauma</p>
            </div>
            <div className="flex gap-2">
            <MapPin className="w-4" />
                <span className="col-span-3">Location</span>
            </div>
            <div className="flex gap-2">
            <Clock className="w-4" />
                <span className="col-span-3">Time</span>
            </div>
            <div className="flex gap-2">
            <Info className="w-4" />
                <span className="col-span-3">Status</span>
            </div>
        </div>
    );
}