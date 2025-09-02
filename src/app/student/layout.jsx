
"use client";

import { useAuth } from "../../components/auth/auth-provider";
import AppLayout from "../../components/layout/app-layout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSkeleton from "../../components/layout/app-skeleton";


export default function StudentLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'student')) {
            router.replace('/');
        }
    }, [user, loading, router]);


    const handleLogout = () => {
        logout();
        router.push('/');
    };
    
    const handleNav = (path) => {
        router.push(path);
    }

    if (loading || !user) {
        return <AppSkeleton />;
    }
    
    return (
        <AppLayout user={user} onLogout={handleLogout} onNav={handleNav}>
            {children}
        </AppLayout>
    )
}
