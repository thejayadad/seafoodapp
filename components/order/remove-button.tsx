
'use client'
import React, { useState } from "react";

interface RemoveButtonProps {
    action: (formData: FormData) => Promise<any>;
    hiddenFields: Record<string, string>;
    label?: string;
}

export default function RemoveButton ({action, hiddenFields, label="Remove"}:RemoveButtonProps){
    const [loading, setLoading] = useState(false)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData()
        for(const key in hiddenFields){
            formData.append(key, hiddenFields[key])
        }
        try {
            await action(formData)
        } catch (error) {
          console.log("Error Removing Item " + error)  
        } finally {
            setLoading(false)
        }
    }
    return (
        <form onSubmit={handleSubmit} className="inline-flex">
            {loading && (
                <span className="loading loading-spinner loading-xs mr-2"></span>
            )}
            <button
            type="submit"
            disabled={loading}
            className="link link-hover text-xs flex items-center"
            >
                {label}
            </button>
        </form>
    )
}