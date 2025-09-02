
"use client";

import StaffDashboard from "../../../components/staff/staff-dashboard";
import { useAuth } from "../../../components/auth/auth-provider";

export default function StaffDashboardPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        ); 
    }

    return <StaffDashboard user={user} />;
}
