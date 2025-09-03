
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/auth/auth-provider";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Calendar } from "../../../components/ui/calendar";
import { Badge } from "../../../components/ui/badge";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useToast } from "../../../hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Skeleton } from "../../../components/ui/skeleton";


export default function StudentAttendancePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [attendanceData, setAttendanceData] = useState({ overall: 0, present: 0, total: 0 });
    const [allRecords, setAllRecords] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayDetails, setDayDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user || !user.enrollment_number) return;
            
            setIsLoading(true);

            try {
                // Fetch all staff to map IDs to names later
                const staffQuery = query(collection(db, "users"), where("role", "==", "staff"));
                const staffSnapshot = await getDocs(staffQuery);
                const staffMap = staffSnapshot.docs.reduce((acc, doc) => {
                    const data = doc.data();
                    acc[data.staff_id] = data.name;
                    return acc;
                }, {});

                // Find what classes the student is in
                const studentClassesQuery = query(collection(db, "classes"), where("students", "array-contains", user.enrollment_number));
                const studentClassesSnapshot = await getDocs(studentClassesQuery);
                const classDetailsMap = {};
                studentClassesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    classDetailsMap[data.class_id] = {
                        className: data.class_name,
                        subjects: data.subjects
                    };
                });
                const studentClassIds = Object.keys(classDetailsMap);
                
                if (studentClassIds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Fetch all attendance records for those classes
                const attendanceQuery = query(collection(db, "attendance"), where("class_id", "in", studentClassIds));
                const attendanceSnapshot = await getDocs(attendanceQuery);

                let totalLectures = 0;
                let presentLectures = 0;
                const processedRecords = [];

                attendanceSnapshot.forEach(doc => {
                    const record = doc.data();
                    const studentStatus = record.records[user.enrollment_number];

                    if (studentStatus !== undefined) {
                        totalLectures++;
                        if (studentStatus === true) {
                            presentLectures++;
                        }
                        const classInfo = classDetailsMap[record.class_id];
                        // Here we are just picking a subject from the class.
                        // A more robust system would link attendance to a specific subject/period.
                        const subjectInfo = classInfo?.subjects?.[0] || { subjectName: "N/A", staffId: "N/A"};

                        processedRecords.push({ 
                            date: new Date(record.date),
                            status: studentStatus,
                            className: classInfo?.className || "Unknown Class",
                            subjectName: subjectInfo.subjectName,
                            staffName: staffMap[subjectInfo.staffId] || "Unknown Staff"
                        });
                    }
                });

                setAllRecords(processedRecords);
                
                if(totalLectures > 0) {
                    setAttendanceData({
                        overall: Math.round((presentLectures / totalLectures) * 100),
                        present: presentLectures,
                        total: totalLectures
                    });
                }

            } catch (error) {
                console.error("Error fetching attendance data: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch your attendance history." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, [user, toast]);
    
    const handleDayClick = (day) => {
      setSelectedDay(day);
      const detailsForDay = allRecords
        .filter(rec => isSameDay(rec.date, day))
        .map((rec, index) => {
            const times = ["7:30 AM - 8:25 AM", "9:30 AM - 10:25 AM", "10:25 AM - 11:20 AM", "12:20 PM - 2:10 PM"];
            return {
                ...rec,
                time: times[index % times.length] // Mock time
            }
        });
      setDayDetails(detailsForDay);
    };

    const modifiers = {
        present: allRecords.filter(d => d.status === true).map(d => d.date),
        absent: allRecords.filter(d => d.status === false).map(d => d.date),
    };

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
            textDecoration: 'line-through'
        },
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-64" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
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
                        mode="single"
                        onDayClick={handleDayClick}
                        selected={selectedDay}
                        modifiers={modifiers}
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

            {selectedDay && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Detail for {format(selectedDay, "PPP")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dayDetails.length > 0 ? (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sr.</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Staff</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dayDetails.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{detail.time}</TableCell>
                                            <TableCell>{detail.subjectName}</TableCell>
                                            <TableCell>{detail.staffName}</TableCell>
                                            <TableCell>
                                                <Badge variant={detail.status ? "default" : "destructive"}>
                                                    {detail.status ? "Present" : "Absent"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No attendance records found for this day.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
