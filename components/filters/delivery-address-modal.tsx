'use client'
import { useState } from "react"
import Brand from "../ui/logo"
import {FiMapPin, FiCheckCircle, FiXCircle} from "react-icons/fi"
type Props = {
    onClose: () => void;
}

export default function DeliveryAddressModal({onClose}: Props){
    const [zip, setZip] = useState("")
    const [message, setMessage] = useState("")
    const [success, setSuccess] = useState<boolean | null>(null)
    const allowedZips = ["10001", "10002", "10003"]
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if(allowedZips.includes(zip.trim())) {
            setMessage("Great we can deliver to your area!")
            setSuccess(true)
        } else {
            setMessage("Sorry, delivery is only available within our area")
            setSuccess(false)
        }   
    }
    return (
        <div className="modal modal-open">
            <div className="modal-box border border-neutral-200 p-6 relative">

                {/*LOGO */}
                <Brand />
                {/*HEADER */}
                <h3 className="font-semibold text-lg text-center mb-1 mt-2">Enter Your Zip Code</h3>
                <p className="text-sm text-center text-neutral-700 mb-2">
                    We'll check if we can deliver to your area
                </p>

                {/*USER INPUT  FORM*/}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 border border-neutral-200 rounded-xl py-2 px-3">
                        <FiMapPin className="text-neutral-500" />
                        <input
                        type="text"
                        onChange={(e) => setZip(e.target.value)}
                        className="input input-ghost w-full focus:outline-none"
                        placeholder="Enter Zip Code"
                        required
                        />
                    </div>
                    <button
                    type="submit"
                    className="btn bg-blue-800 text-neutral-100 w-full rounded-xl"
                    >Check Delivery</button>
                </form>
                {/*Result Message to User */}
                {message && (
                    <div 
                    className={`
                        mt-4 flex items-center justify-center text-[18px] gap-2 text-center w-full

                        ${ success ? "text-green-700 text-center" : "text-amber-950"}
                        `}
                    >
                        {success ? <FiCheckCircle /> :<FiXCircle /> }
                        <span>{message}</span>
                    </div>
                )}
            <button
            onClick={onClose}
            className="btn bg-amber-500 btn-ghost absolute top-3 right-3 rounded-full border border-neutral-200"
            >
                X
            </button>
            </div>            
        
        </div>
    )
}