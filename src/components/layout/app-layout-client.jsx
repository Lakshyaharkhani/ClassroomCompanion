
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/auth-provider";
import Header from "./header";
import SidebarNav from "./sidebar-nav";
import Loader from "../ui/loader";

function AppSkeleton() {
    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen">
            <Loader className="h-12 w-12" />
            <p className="text-muted-foreground">Loading your experience...</p>
        </div>
    )
}

export default function AppLayoutClient({ navItems, children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/');
        }
    }, [user, loading, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleLinkClick = (path) => {
        setMobileNavOpen(false);
        router.push(path);
    };

    if (loading || !user) {
        return <AppSkeleton />;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header
                user={user}
                onLogout={handleLogout}
                onMenuClick={() => setMobileNavOpen(!mobileNavOpen)}
            />
            <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
                    <SidebarNav items={navItems} onLinkClick={handleLinkClick} />
                </aside>
                {mobileNavOpen && (
                    <div className="fixed inset-0 top-14 z-20 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)}>
                        <div className="fixed inset-y-0 left-0 z-40 w-1/2 max-w-sm bg-background">
                            <SidebarNav items={navItems} onLinkClick={handleLinkClick} />
                        </div>
                    </div>
                )}
                <main className="container flex w-full flex-col overflow-hidden py-6 px-4 sm:px-6 max-w-6xl">
                    {children}
                </main>
            </div>
        </div>
    );
}
