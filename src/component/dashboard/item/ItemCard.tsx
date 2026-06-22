import React from "react";


interface ItemCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconColor: string;
}

export function ItemCard({ label, value, icon, iconColor }: ItemCardProps) {

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-${iconColor}-500/10 ${iconColor}-500`} >
                {icon}
            </div>

            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                    {label}
                </p>

                <h3 className="text-xl font-bold font-mono">
                    {value}
                </h3>
            </div>
        </div>
    );
}