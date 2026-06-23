import dayjs from 'dayjs';
import { Ambulance, Clock, Info, MapPin } from "lucide-react";

export type Incident = {
    name: string;
    location: string;
    created_at: number;
    status: string;
};

export function IncidentDisplay({ incident }: { incident: Incident }) {
    return (
        <div className="bg-gray-200 p-2 rounded-sm shadow-md outline">
            <div className="flex flex-col justify-center items-center w-full">
                {/* <Ambulance className="w-12 h-12"/> */}
                <p className="text-center text-lg font-semibold my-2">{incident.name}</p>
            </div>
            <div className="flex gap-2">
            <MapPin className="w-4" />
                <span className="col-span-3">{incident.location}</span>
            </div>
            <div className="flex gap-2">
            <Clock className="w-4" />
                <span className="col-span-3">{dayjs(incident.created_at).format("hh:mm A")}</span>
            </div>
            <div className="flex gap-2">
            <Info className="w-4" />
                <span className="col-span-3">{incident.status}</span>
            </div>
        </div>
    );
}