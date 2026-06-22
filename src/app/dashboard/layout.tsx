import SideBar from "@/component/ui/SideBar";
import NavBar from "@/component/ui/NavBar";
import { validateAuthCookie } from "@/action/SecureAction";
import { Metadata } from "next";
//import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Cisco Dashboard",
    description: "Proyecto academico de gestión de redes.",
};

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const response = await validateAuthCookie();

    return (
        <div className="flex h-screen w-screen overflow-hidden   text-slate-100 font-sans">
            <SideBar username={response.data?.username!} rol={response.data?.rol!} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                <NavBar username={response.data?.username!} />

                <main className="flex-1 overflow-y-auto p-8 relative z-10 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
