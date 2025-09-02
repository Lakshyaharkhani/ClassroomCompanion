
"use client";

import AdminDashboard from "../../../components/admin/admin-dashboard";
import { useAuth } from "../../../components/auth/auth-provider";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p>
        </div>
    ); 
  }

  return <AdminDashboard user={user} />;
}
