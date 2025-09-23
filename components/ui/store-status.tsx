'use client'
import { useState, useEffect } from "react"
import {FiClock, FiCheckCircle, FiXCircle} from "react-icons/fi"


interface StoreStatusProps {
    openHour?: number;
    closeHour?: number;
}
export default function StoreStatus({openHour = 11, closeHour = 20}:StoreStatusProps){
    const [currentTime, setCurrentTime] = useState(new Date()) 

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval)
    }, [])


    //compare time logic
    const currentHour = currentTime.getHours()
    const isOpen = currentHour >= openHour && currentHour <closeHour;
    return(
        <div 
        className={` flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-xl border border-neutral-200 ${
            isOpen ? "bg-green-500 text-neutral-100" : "bg-amber-500 text-neutral-100"
        }`}
        >   
            {isOpen ? <FiCheckCircle /> : <FiXCircle />}
            <span>
                {isOpen 
                    ? `Open - closes at ${closeHour}:00 pm`
                    : `Closed - opens at ${openHour}:00 am`
                }
            </span>
        </div>
    )

}