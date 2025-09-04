
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/auth/auth-provider";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Calendar } from "../../../components/ui/calendar";
import { Badge } from "../../../components/ui/badge";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "../../../hooks/use-toast";

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [attendanceData, setAttendanceData] = useState({ overall: 0, present: 0, total: 0 });
    const [markedDates, setMarkedDates] = useState({ present: [], absent: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user || !user.enrollment_number) return;
            
            setIsLoading(true);

            try {
                // Find what classes the student is in
                const studentClassesQuery = query(collection(db, "classes"), where("students", "array-contains", user.enrollment_number));
                const studentClassesSnapshot = await getDocs(studentClassesQuery);
                const studentClassIds = studentClassesSnapshot.docs.map(doc => doc.id);
                
                if (studentClassIds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Fetch all attendance records for those classes
                const attendanceQuery = query(collection(db, "attendance"), where("class_id", "in", studentClassIds));
                const attendanceSnapshot = await getDocs(attendanceQuery);

                let totalLectures = 0;
                let presentLectures = 0;
                const presentDays = [];
                const absentDays = [];

                attendanceSnapshot.forEach(doc => {
                    const record = doc.data();
                    const studentStatus = record.records[user.enrollment_number];

                    if (studentStatus !== undefined) {
                        totalLectures++;
                        const recordDate = new Date(record.date);
                        if (studentStatus === true) {
                            presentLectures++;
                            presentDays.push(recordDate);
                        } else {
                            absentDays.push(recordDate);
                        }
                    }
                });
                
                if(totalLectures > 0) {
                    setAttendanceData({
                        overall: Math.round((presentLectures / totalLectures) * 100),
                        present: presentLectures,
                        total: totalLectures
                    });
                }
                setMarkedDates({ present: presentDays, absent: absentDays });

            } catch (error) {
                console.error("Error fetching attendance data: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch your attendance history." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, [user, toast]);

    const modifiersStyles = {
        present: { 
            backgroundColor: 'hsl(var(--primary))', 
            color: 'hsl(var(--primary-foreground))',
            borderRadius: '0.25rem',
        },
        absent: { 
            backgroundColor: 'hsl(var(--destructive))', 
            color: 'hsl(var(--destructive-foreground))',
            borderRadius: '0.25rem',
        },
    };

    if (isLoading) {
        return <div>Loading attendance...</div>;
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Attendance</h1>
            
            <div className="grid gap-6 md:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>Overall Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{attendanceData.overall}%</div>
                        <p className="text-muted-foreground">Across all subjects</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Classes Attended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{attendanceData.present}</div>
                         <p className="text-muted-foreground">Total lectures present</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Classes Missed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{attendanceData.total - attendanceData.present}</div>
                         <p className="text-muted-foreground">Total lectures absent</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History Calendar</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Calendar
                        modifiers={markedDates}
                        modifiersStyles={modifiersStyles}
                        className="rounded-md border p-4"
                    />
                    <div className="flex gap-4 mt-4">
                        <Badge variant="default" className="bg-primary hover:bg-primary">Present</Badge>
                        <Badge variant="destructive">Absent</Badge>
                        <Badge variant="secondary">No Class / Not Marked</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
