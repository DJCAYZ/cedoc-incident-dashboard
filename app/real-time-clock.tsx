"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function RealTimeClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    });

    return (
        <p suppressHydrationWarning>{dayjs(time).format("HH:mm:ss")}</p>
    )
}