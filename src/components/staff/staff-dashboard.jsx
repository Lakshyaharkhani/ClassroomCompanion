
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { BookOpen, CalendarCheck, User } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";


export default function StaffDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState({ assignedClasses: 0, attendanceToday: "N/A" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.staff_id) return;
      setLoading(true);

      try {
        // 1. Fetch assigned classes
        const classesQuery = query(collection(db, "classes"), where("staff", "array-contains", user.staff_id));
        const classesSnapshot = await getDocs(classesQuery);
        const assignedClassesCount = classesSnapshot.size;
        const assignedClassIds = classesSnapshot.docs.map(doc => doc.id);

        // 2. Fetch today's attendance for those classes
        let attendanceTodayPercent = "N/A";
        if (assignedClassIds.length > 0) {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const attendanceQuery = query(
                collection(db, "attendance"),
                where("class_id", "in", assignedClassIds),
                where("date", "==", todayStr)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);
            
            let totalStudents = 0;
            let presentStudents = 0;

            attendanceSnapshot.forEach(doc => {
                const records = doc.data().records;
                Object.values(records).forEach(status => {
                    totalStudents++;
                    if (status) presentStudents++;
                });
            });
            
            if (totalStudents > 0) {
                attendanceTodayPercent = `${Math.round((presentStudents / totalStudents) * 100)}%`;
            }
        }
        
        setDashboardData({
          assignedClasses: assignedClassesCount,
          attendanceToday: attendanceTodayPercent,
        });

      } catch (error) {
        console.error("Error fetching staff dashboard data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);
  
  const StatCard = ({ title, value, icon, description, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-muted/50">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name}.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Assigned Classes"
          value={dashboardData.assignedClasses}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          description="Classes assigned to you"
          loading={loading}
        />
        <StatCard
          title="Today's Attendance"
          value={dashboardData.attendanceToday}
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
          description="Overall attendance today"
          loading={loading}
        />
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User /> My Information
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="professional">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="professional">Professional Details</TabsTrigger>
                    <TabsTrigger value="personal">Personal & Contact</TabsTrigger>
                </TabsList>
                <TabsContent value="professional" className="mt-4">
                    <DetailRow label="Staff ID" value={user.staff_id} />
                    <DetailRow label="Department" value={user.department} />
                    <DetailRow label="Designation" value={user.designation} />
                    <DetailRow label="Highest Qualification" value={user.qualification} />
                    <DetailRow label="Date of Joining" value={user.joiningDate} />
                    <DetailRow label="Assigned Classes" value={user.assigned_classes?.join(', ') || 'None'} />
                </TabsContent>
                <TabsContent value="personal" className="mt-4">
                    <DetailRow label="Full Name" value={user.name} />
                    <DetailRow label="Email Address" value={user.email} />
                    <DetailRow label="Phone Number" value={user.phone} />
                    <DetailRow label="Gender" value={user.gender} />
                    <DetailRow label="Date of Birth" value={user.dob} />
                    <DetailRow label="Address" value={`${user.address}, ${user.city}, ${user.state} - ${user.pincode}`} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
