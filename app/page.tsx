import { Ambulance, Clock, Info, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IncidentDisplay } from "./incident-display";
import { RealTimeClock } from "./real-time-clock";
import { IncidentDisplayList } from "./incident-display-list";

export default function Home() {
  return (
    <div className="px-2 py-8 space-y-4">
      <div className="bg-white/90 shadow-md rounded-md h-full p-2">
        <div className="flex justify-between items-center w-full">
          <h1 className="font-semibold text-2xl">dashboard name here</h1>
          <RealTimeClock />
        </div>

      </div>
      <div className="bg-white/90 shadow-md rounded-md h-[86vh] p-4 overflow-hidden">
        <IncidentDisplayList />
      </div>
    </div>
  );
}
