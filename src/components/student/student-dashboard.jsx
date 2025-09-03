
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { BookOpen, CalendarCheck, User, Percent } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "../../hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "../ui/skeleton";


function SubjectDetailsDialog({ subjects, children }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>My Enrolled Subjects</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Assigned Teacher</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.length > 0 ? subjects.map((subject, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                    <TableCell>{subject.className}</TableCell>
                                    <TableCell>{subject.staffName}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan="3" className="text-center">No subjects found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function StudentDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState({ totalSubjects: 0, attendancePercent: 0, subjectDetails: [], chartData: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.enrollment_number) return;
      
      setLoading(true);
      try {
        // 1. Fetch all staff members to create a map of ID -> Name
        const staffQuery = query(collection(db, "users"), where("role", "==", "staff"));
        const staffSnapshot = await getDocs(staffQuery);
        const staffMap = staffSnapshot.docs.reduce((acc, doc) => {
            const staffData = doc.data();
            acc[staffData.staff_id] = staffData.name;
            return acc;
        }, {});

        // 2. Fetch classes the student is enrolled in
        const classesQuery = query(collection(db, "classes"), where("students", "array-contains", user.enrollment_number));
        const classesSnapshot = await getDocs(classesQuery);
        const studentClasses = classesSnapshot.docs.map(doc => doc.data());
        
        const subjectDetails = studentClasses.flatMap(c => 
            (c.subjects || []).map(subject => ({
                ...subject,
                className: c.class_name,
                staffName: staffMap[subject.staffId] || 'N/A'
            }))
        );

        const totalSubjects = subjectDetails.length;
        const studentClassIds = studentClasses.map(c => c.class_id);

        let attendancePercent = 0;
        let chartData = [];

        if (studentClassIds.length > 0) {
            // 3. Fetch attendance for those classes
            const attendanceQuery = query(collection(db, "attendance"), where("class_id", "in", studentClassIds));
            const attendanceSnapshot = await getDocs(attendanceQuery);

            let totalLectures = 0;
            let presentLectures = 0;

            attendanceSnapshot.forEach(doc => {
                const record = doc.data();
                const studentStatus = record.records[user.enrollment_number];

                if (studentStatus !== undefined) {
                    totalLectures++;
                    if (studentStatus === true) {
                        presentLectures++;
                    }
                }
            });

            if (totalLectures > 0) {
                 attendancePercent = Math.round((presentLectures / totalLectures) * 100);
            }
            
            chartData = [
                { name: 'Present', value: presentLectures },
                { name: 'Absent', value: totalLectures - presentLectures }
            ];
        }
        
        setDashboardData({ totalSubjects, attendancePercent, subjectDetails, chartData });

      } catch (error) {
          console.error("Error fetching student dashboard data:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data."});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);
  
  const attendanceChartColors = {
      Present: 'hsl(var(--primary))',
      Absent: 'hsl(var(--destructive))'
  };

  const StatCard = ({ title, value, icon, description, loading, actionWrapper: ActionWrapper, actionProps }) => {
    const content = (
      <Card className={ActionWrapper ? "cursor-pointer hover:border-primary transition-colors" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  
    if (ActionWrapper) {
      return <ActionWrapper {...actionProps}>{content}</ActionWrapper>;
    }
  
    return content;
  };


  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-muted/50">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
    </div>
  )

  return (
    <div className="space-y-6">
       {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name} ({user.enrollment_number}).</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Enrolled Subjects"
          value={dashboardData.totalSubjects}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          description="Click to view details"
          loading={loading}
          actionWrapper={SubjectDetailsDialog}
          actionProps={{ subjects: dashboardData.subjectDetails }}
        />

        <StatCard
          title="Overall Attendance"
          value={`${dashboardData.attendancePercent}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          description="Across all subjects"
          loading={loading}
        />

        <StatCard
          title="Attendance Calendar"
          value="View History"
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
          description="See a day-by-day record"
          loading={loading}
          actionWrapper={({ children }) => <a href="/student/attendance">{children}</a>}
        />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-[250px]">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : dashboardData.chartData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                      if (percent === 0) return null; // Do not render label for 0%
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                              {`${(percent * 100).toFixed(0)}%`}
                          </text>
                      );
                  }}
                >
                  {dashboardData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={attendanceChartColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No attendance has been marked for you yet.</p>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User /> My Information
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">
                        <span className="sm:hidden">Personal</span>
                        <span className="hidden sm:inline">Personal Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact">
                        <span className="sm:hidden">Contact</span>
                        <span className="hidden sm:inline">Contact Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="academics">
                        <span className="sm:hidden">Academics</span>
                        <span className="hidden sm:inline">Academic Details</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="mt-4">
                    <DetailRow label="Name" value={user.name} />
                    <DetailRow label="Enrollment Number" value={user.enrollment_number} />
                    <DetailRow label="Date of Birth" value={user.dob} />
                    <DetailRow label="Gender" value={user.gender} />
                    <DetailRow label="Blood Group" value={user.bloodGroup} />
                    <DetailRow label="Aadhar Number" value={user.aadhar} />
                </TabsContent>
                 <TabsContent value="contact" className="mt-4">
                    <DetailRow label="Email" value={user.email} />
                    <DetailRow label="Mobile" value={user.phone} />
                    <DetailRow label="Permanent Address" value={user.permanentAddress} />
                    <DetailRow label="Father's Name" value={user.fatherName} />
                    <DetailRow label="Father's Mobile" value={user.fatherMobile} />
                    <DetailRow label="Mother's Name" value={user.motherName} />
                </TabsContent>
                 <TabsContent value="academics" className="mt-4">
                    <DetailRow label="Program" value={user.program} />
                    <DetailRow label="Department" value={user.department} />
                    <DetailRow label="Admission Year" value={user.admissionYear} />
                    <DetailRow label="Current Class" value={user.class} />
                    <DetailRow label="10th Board" value={user.tenthBoard} />
                    <DetailRow label="10th Percentage" value={`${user.tenthPercentage}%`} />
                    <DetailRow label="12th Board" value={user.twelfthBoard} />
                    <DetailRow label="12th Percentage" value={`${user.twelfthPercentage}%`} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
