
"use client";

import { useAuth } from "../../components/auth/auth-provider";
import AppLayout from "../../components/layout/app-layout";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import AppSkeleton from "../../components/layout/app-skeleton";


export default function StaffLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || !['staff', 'admin'].includes(user.role))) {
            router.replace('/');
            return;
        }

        // If an admin tries to access a staff-only page that isn't the shared class page.
        if (!loading && user.role === 'admin' && pathname.startsWith('/staff') && pathname !== '/staff/classes') {
            // Allow admin access to /staff/classes but redirect from other staff pages
            // This is a simple rule, can be made more complex if needed.
            // For now, we just redirect them to their own dashboard.
             if (pathname !== '/staff/dashboard' && pathname !== '/staff/attendance') {
                 router.replace('/admin/dashboard');
             }
        }


    }, [user, loading, router, pathname]);


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
