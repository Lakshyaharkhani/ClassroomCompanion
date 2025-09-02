
"use client";

import StudentDashboard from "../../../components/student/student-dashboard";
import { useAuth } from "../../../components/auth/auth-provider";

export default function StudentDashboardPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return <StudentDashboard user={user} />;
}
