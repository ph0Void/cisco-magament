"use client";
import React from 'react'
import { Toaster } from 'sonner';

export default function SonnerToast() {
    return (
        <Toaster
            position="bottom-right"
            richColors
            //closeButton
            toastOptions={{
                classNames: {
                    toast: "text-xs font-medium",
                },
            }}
        />
    )
}