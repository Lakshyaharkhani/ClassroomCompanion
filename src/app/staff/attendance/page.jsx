
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/auth/auth-provider";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Checkbox } from "../../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { Calendar as CalendarIcon, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "../../../hooks/use-toast";
import { cn } from "../../../lib/utils";
import { db } from "../../../lib/firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

export default function AttendancePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [staffClasses, setStaffClasses] = useState([]);
    const [studentsInClass, setStudentsInClass] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStaffClasses = async () => {
            if (!user || !user.staff_id) return;
            setIsLoading(true);
            try {
                const q = query(collection(db, "classes"), where("staff", "array-contains", user.staff_id));
                const querySnapshot = await getDocs(q);
                const classes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStaffClasses(classes);
            } catch (error) {
                console.error("Error fetching staff classes: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch your classes." });
            }
            setIsLoading(false);
        };
        fetchStaffClasses();
    }, [user, toast]);

    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        setAttendance({});
        const selectedClass = staffClasses.find(c => c.class_id === classId);
        if (!selectedClass || !selectedClass.students || selectedClass.students.length === 0) {
            setStudentsInClass([]);
            return;
        }

        setIsLoading(true);
        try {
            const studentsQuery = query(collection(db, "users"), where("enrollment_number", "in", selectedClass.students));
            const studentsSnapshot = await getDocs(studentsQuery);
            const studentData = studentsSnapshot.docs.map(doc => doc.data());
            setStudentsInClass(studentData);
            await loadExistingAttendance(classId, selectedDate);
        } catch (error) {
            console.error("Error fetching students: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch students for this class." });
        }
        setIsLoading(false);
    };
    
    const loadExistingAttendance = async (classId, date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        const recordId = `${classId}_${dateKey}`;
        try {
            const docRef = doc(db, "attendance", recordId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAttendance(docSnap.data().records || {});
                toast({ title: "Existing Record Found", description: "Loaded saved attendance for this date." });
            } else {
                 setAttendance({});
            }
        } catch (error) {
            console.error("Error fetching attendance: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch existing attendance data." });
        }
    }
    
    useEffect(() => {
        if(selectedClassId) {
            loadExistingAttendance(selectedClassId, selectedDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedClassId]);

    const handleCheckboxChange = (studentId) => {
        setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const markAllPresent = () => {
        const allPresent = studentsInClass.reduce((acc, student) => {
            acc[student.enrollment_number] = true;
            return acc;
        }, {});
        setAttendance(allPresent);
    };

    const handleSubmit = async () => {
        if (!selectedClassId) {
            toast({ variant: "destructive", title: "Error", description: "Please select a class first." });
            return;
        }
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        const recordId = `${selectedClassId}_${dateKey}`;
        const selectedClass = staffClasses.find(c => c.class_id === selectedClassId);

        // Ensure all students have a boolean entry
        const finalAttendance = studentsInClass.reduce((acc, student) => {
            acc[student.enrollment_number] = !!attendance[student.enrollment_number];
            return acc;
        }, {});
        
        const attendanceRecord = {
            class_id: selectedClassId,
            date: dateKey,
            records: finalAttendance
        };

        try {
            await setDoc(doc(db, "attendance", recordId), attendanceRecord, { merge: true });
            toast({
                title: "Success",
                description: `Attendance for ${selectedClass.class_name} on ${dateKey} has been submitted.`,
            });
        } catch (error) {
            console.error("Error submitting attendance: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to submit attendance." });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Mark Attendance</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Class and Date</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Class</label>
                        <Select onValueChange={handleClassChange} value={selectedClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffClasses.map(c => (
                                    <SelectItem key={c.class_id} value={c.class_id}>
                                        {c.class_name} ({c.class_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {selectedClassId && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>
                                Student List - {staffClasses.find(c=>c.class_id === selectedClassId)?.class_name} ({format(selectedDate, "PPP")})
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={markAllPresent}>
                                    <CheckCheck className="mr-2" />
                                    Mark All Present
                                </Button>
                                <Button onClick={handleSubmit}>Submit Attendance</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading students...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Present</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Enrollment No.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsInClass.length > 0 ? studentsInClass.map(student => (
                                        <TableRow key={student.enrollment_number}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={!!attendance[student.enrollment_number]}
                                                    onCheckedChange={() => handleCheckboxChange(student.enrollment_number)}
                                                    id={`att-${student.enrollment_number}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.enrollment_number}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan="3" className="text-center">No students assigned to this class.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
