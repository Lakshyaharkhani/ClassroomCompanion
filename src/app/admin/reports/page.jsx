
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useToast } from "../../../hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching classes: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch classes." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [toast]);

  const generateReport = async () => {
    if (!selectedClassId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a class first." });
      return;
    }
    setIsGenerating(true);
    setAttendanceData([]);

    try {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (!selectedClass || !selectedClass.students || selectedClass.students.length === 0) {
        toast({ title: "No Students", description: "This class has no students enrolled." });
        setIsGenerating(false);
        return;
      }

      // 1. Fetch all attendance records for the class
      const attendanceQuery = query(collection(db, "attendance"), where("class_id", "==", selectedClassId));
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      // 2. Fetch student details for names
      const studentsQuery = query(collection(db, "users"), where("enrollment_number", "in", selectedClass.students));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentMap = studentsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        acc[data.enrollment_number] = data.name;
        return acc;
      }, {});

      // 3. Process the data
      const studentStats = {};
      selectedClass.students.forEach(studentId => {
        studentStats[studentId] = { present: 0, total: 0 };
      });

      attendanceSnapshot.forEach(doc => {
        const record = doc.data().records;
        for (const studentId in record) {
          if (studentStats[studentId]) {
            studentStats[studentId].total++;
            if (record[studentId]) {
              studentStats[studentId].present++;
            }
          }
        }
      });
      
      const chartData = Object.entries(studentStats).map(([studentId, stats]) => {
          const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
          return {
              name: studentMap[studentId] || studentId,
              attendance: percentage
          }
      });
      
      setAttendanceData(chartData);
      
      if (chartData.length === 0) {
          toast({title: "No Records", description: "No attendance records found for this class yet."})
      }

    } catch (error) {
      console.error("Error generating report: ", error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred while generating the report." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Reports</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Student Attendance Graph</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Select a Class</label>
                <Select onValueChange={setSelectedClassId} value={selectedClassId} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading classes..." : "Choose a class"} />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.class_name} ({c.department})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end">
                <Button onClick={generateReport} disabled={isGenerating || !selectedClassId}>
                    {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {attendanceData.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Attendance for {classes.find(c => c.id === selectedClassId)?.class_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: -10, bottom: 90 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-60} textAnchor="end" interval={0} style={{ fontSize: '12px' }} />
                        <YAxis unit="%" domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value) => [`${value}%`, 'Attendance']}
                        />
                        <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
