
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PlusCircle, Edit, Trash2, Search, ArrowLeft, User, BookOpen, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { uid } from "../../../lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";


function StudentDetailsCard({ student, onBack }) {
    const { toast } = useToast();
    const [details, setDetails] = useState({ classes: [], attendance: { present: 0, total: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!student) return;
            setLoading(true);
            try {
                // 1. Fetch student's classes
                const classesQuery = query(collection(db, "classes"), where("students", "array-contains", student.enrollment_number));
                const classesSnapshot = await getDocs(classesQuery);
                const classData = classesSnapshot.docs.map(doc => doc.data());

                // 2. Fetch student's attendance
                const classIds = classData.map(c => c.class_id);
                let presentLectures = 0;
                let totalLectures = 0;

                if (classIds.length > 0) {
                    const attendanceQuery = query(collection(db, "attendance"), where("class_id", "in", classIds));
                    const attendanceSnapshot = await getDocs(attendanceQuery);
                    attendanceSnapshot.forEach(doc => {
                        const record = doc.data().records;
                        if (record[student.enrollment_number] !== undefined) {
                            totalLectures++;
                            if (record[student.enrollment_number]) {
                                presentLectures++;
                            }
                        }
                    });
                }
                
                setDetails({
                    classes: classData,
                    attendance: { present: presentLectures, total: totalLectures }
                });

            } catch (error) {
                console.error("Error fetching student details:", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load student details." });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [student, toast]);

    const attendancePercentage = details.attendance.total > 0 ? Math.round((details.attendance.present / details.attendance.total) * 100) : 0;
    const chartData = [
        { name: 'Present', value: details.attendance.present },
        { name: 'Absent', value: details.attendance.total - details.attendance.present }
    ];
    const chartColors = {
      Present: 'hsl(var(--primary))',
      Absent: 'hsl(var(--destructive))'
    };

    const DetailRow = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-right">{value || 'N/A'}</p>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft />
                    </Button>
                    <CardTitle>{student.name} ({student.enrollment_number})</CardTitle>
                </div>
                <CardDescription>Viewing details for the selected student.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? <p>Loading details...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-4">
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User />Personal Info</CardTitle></CardHeader>
                                <CardContent>
                                    <DetailRow label="Email" value={student.email} />
                                    <DetailRow label="Phone" value={student.phone} />
                                    <DetailRow label="Gender" value={student.gender} />
                                    <DetailRow label="Date of Birth" value={student.dob} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen />Academic Info</CardTitle></CardHeader>
                                <CardContent>
                                    <DetailRow label="Program" value={student.details?.program} />
                                    <DetailRow label="Department" value={student.department} />
                                    <DetailRow label="Admission Year" value={student.details?.admissionYear} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Percent/>Attendance</CardTitle></CardHeader>
                                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                                     <div className="w-full md:w-1/2 h-40">
                                         {details.attendance.total > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                                         {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={chartColors[entry.name]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                         ) : <p className="text-muted-foreground text-center w-full">No attendance data found.</p>}
                                     </div>
                                     <div className="flex-1 grid grid-cols-2 gap-4">
                                         <div className="text-center p-4 rounded-lg bg-muted">
                                             <p className="text-2xl font-bold">{attendancePercentage}%</p>
                                             <p className="text-xs text-muted-foreground">Overall</p>
                                         </div>
                                         <div className="text-center p-4 rounded-lg bg-muted">
                                             <p className="text-2xl font-bold">{details.attendance.present} / {details.attendance.total}</p>
                                             <p className="text-xs text-muted-foreground">Present / Total</p>
                                         </div>
                                     </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base">Enrolled Classes</CardTitle></CardHeader>
                                <CardContent>
                                    {details.classes.length > 0 ? (
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Class Name</TableHead><TableHead>Department</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {details.classes.map(c => (
                                                    <TableRow key={c.class_id}>
                                                        <TableCell>{c.class_name}</TableCell>
                                                        <TableCell>{c.department}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : <p className="text-muted-foreground text-center">Not enrolled in any classes.</p>}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function AddStudentToCollegeDialog({ onStudentAdded }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSubmit = async () => {
    const year = formData.admissionYear || new Date().getFullYear();
    const departmentCode = (formData.program || "CS").substring(0,2).toUpperCase();

    const { studentName, email, program, mobile, dob, gender, ...details } = formData;
    
    const newStudent = {
      // Top-level fields for easy access and querying
      enrollment_number: `${year}${departmentCode}${uid().substring(0,3).toUpperCase()}`,
      name: studentName || 'N/A',
      email: email || '',
      role: 'student',
      department: program || 'N/A', 
      class: '', // Assigned later
      phone: mobile || '',
      dob: dob || '',
      gender: gender || '',
      
      // A `details` object for all other information from the form
      details: {
          ...details,
          // also save the main fields in details for consistency
          studentName, email, program, mobile, dob, gender,
      },
    };
    
    try {
        const docId = formData.email.replace(/[^a-zA-Z0-9]/g, "");
        await setDoc(doc(db, "users", docId), newStudent);
        onStudentAdded({ ...newStudent, id: docId });
        toast({ title: "Success", description: "New student has been added to the college." });
        setOpen(false);
        setFormData({}); // Reset form
    } catch (error) {
        console.error("Error adding student: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add student." });
    }
  };

  const renderFields = (fields, data) => {
    return fields.map(field => (
        <div className="grid grid-cols-4 items-center gap-4" key={field.id}>
            <Label htmlFor={field.id} className="text-right text-sm">
                {field.label}
            </Label>
            {field.type === 'select' ? (
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} value={data[field.id] || ''}>
                    <SelectTrigger className="col-span-3 h-8">
                        <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : (
                <Input id={field.id} type={field.type || 'text'} value={data[field.id] || ''} onChange={handleInputChange} className="col-span-3 h-8" placeholder={field.placeholder} />
            )}
        </div>
    ));
  }
  
  const personalFields = [
      { id: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Ms.'] },
      { id: 'studentName', label: 'Student Name' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { id: 'dob', label: 'Date of Birth', type: 'date' },
      { id: 'bloodGroup', label: 'Blood Group' },
      { id: 'aadhar', label: 'Aadhar Card No.' },
  ];

  const contactFields = [
      { id: 'mobile', label: 'Mobile' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'permanentAddress', label: 'Permanent Address' },
      { id: 'fatherName', label: "Father's Name" },
      { id: 'fatherMobile', label: "Father's Mobile" },
      { id: 'motherName', label: "Mother's Name" },
  ];

  const academicFields = [
      { id: 'program', label: 'Program', placeholder: 'BTech - CSE' },
      { id: 'admissionYear', label: 'Admission Year', type: 'number', placeholder: '2024' },
      { id: 'tenthBoard', label: '10th Board' },
      { id: 'tenthPercentage', label: '10th Percentage', type: 'number' },
      { id: 'twelfthBoard', label: '12th Board' },
      { id: 'twelfthPercentage', label: '12th Percentage', type: 'number' },
  ];


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Student to College</DialogTitle>
          <DialogDescription>
            Fill in the details for the new student. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="academics">Academics</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
                <Card>
                    <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(personalFields, formData)}</CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="contact">
                 <Card>
                    <CardHeader><CardTitle>Contact & Family Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(contactFields, formData)}</CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="academics">
                 <Card>
                    <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(academicFields, formData)}</CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save New Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStudentDialog({ studentToEdit, onStudentUpdated, children }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
     if(open && studentToEdit) {
        const initialData = {
          ...(studentToEdit.details || {}),
          studentName: studentToEdit.name,
          email: studentToEdit.email,
          program: studentToEdit.department,
          mobile: studentToEdit.phone,
          dob: studentToEdit.dob,
          gender: studentToEdit.gender,
        };
        setFormData(initialData);
     }
  }, [open, studentToEdit]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const { studentName, email, program, mobile, dob, gender, ...details } = formData;
    
    const updatedStudentData = {
      ...studentToEdit,
      name: studentName,
      email: email,
      department: program,
      phone: mobile,
      dob: dob,
      gender: gender,
      details: {
        ...studentToEdit.details, // preserve any other details
        ...details,
      },
    };

    try {
      const studentRef = doc(db, "users", studentToEdit.id);
      await updateDoc(studentRef, updatedStudentData);
      onStudentUpdated({ ...updatedStudentData, id: studentToEdit.id });
      toast({ title: "Success", description: "Student details have been updated." });
      setOpen(false);
    } catch (error) {
      console.error("Error updating student: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update student details." });
    }
  };

  const renderFields = (fields, data) => {
    return fields.map(field => (
        <div className="grid grid-cols-4 items-center gap-4" key={field.id}>
            <Label htmlFor={field.id} className="text-right text-sm">
                {field.label}
            </Label>
            {field.type === 'select' ? (
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} value={data[field.id] || ''}>
                    <SelectTrigger className="col-span-3 h-8">
                        <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : (
                <Input id={field.id} type={field.type || 'text'} value={data[field.id] || ''} onChange={handleInputChange} className="col-span-3 h-8" placeholder={field.placeholder} />
            )}
        </div>
    ));
  };
  
  const personalFields = [
      { id: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Ms.'] },
      { id: 'studentName', label: 'Student Name' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { id: 'dob', label: 'Date of Birth', type: 'date' },
      { id: 'bloodGroup', label: 'Blood Group' },
      { id: 'aadhar', label: 'Aadhar Card No.' },
  ];

  const contactFields = [
      { id: 'mobile', label: 'Mobile' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'permanentAddress', label: 'Permanent Address' },
      { id: 'fatherName', label: "Father's Name" },
      { id: 'fatherMobile', label: "Father's Mobile" },
      { id: 'motherName', label: "Mother's Name" },
  ];

  const academicFields = [
      { id: 'program', label: 'Program', placeholder: 'BTech - CSE' },
      { id: 'admissionYear', label: 'Admission Year', type: 'number', placeholder: '2024' },
      { id: 'tenthBoard', label: '10th Board' },
      { id: 'tenthPercentage', label: '10th Percentage', type: 'number' },
      { id: 'twelfthBoard', label: '12th Board' },
      { id: 'twelfthPercentage', label: '12th Percentage', type: 'number' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Student: {studentToEdit.name}</DialogTitle>
          <DialogDescription>
            Update the student's details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="academics">Academics</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
                <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(personalFields, formData)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="contact">
                 <Card><CardHeader><CardTitle>Contact & Family Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(contactFields, formData)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="academics">
                 <Card><CardHeader><CardTitle>Academic Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(academicFields, formData)}</CardContent></Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function StudentManagementPage() {
  const { toast } = useToast();
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "student"));
            const querySnapshot = await getDocs(q);
            const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllStudents(studentsData);
            setFilteredStudents(studentsData);
        } catch(error) {
            console.error("Error fetching students: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch students from the database." });
        } finally {
            setLoading(false);
        }
    };
    fetchStudents();
  }, [toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = allStudents.filter(item => {
      return (
        item.name?.toLowerCase().includes(lowercasedFilter) ||
        item.email?.toLowerCase().includes(lowercasedFilter) ||
        item.enrollment_number?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredStudents(filtered);
  }, [searchTerm, allStudents]);

  const handleAddStudent = (newStudent) => {
    setAllStudents([...allStudents, newStudent]);
  };

  const handleUpdateStudent = (updatedStudent) => {
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setAllStudents(updatedList);
  };

  const handleDeleteStudent = async (studentDocId) => {
    try {
        await deleteDoc(doc(db, "users", studentDocId));
        setAllStudents(allStudents.filter(s => s.id !== studentDocId));
        toast({ title: "Success", description: "Student has been deleted." });
    } catch(error) {
        console.error("Error deleting student: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete student." });
    }
  }
  
  if (loading) {
      return <div className="flex justify-center items-center h-full"><p>Loading students...</p></div>
  }

  if (selectedStudent) {
    return <StudentDetailsCard student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <AddStudentToCollegeDialog onStudentAdded={handleAddStudent} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All College Students</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or enrollment no..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                    <TableCell colSpan="6" className="text-center h-24">
                      {searchTerm ? "No students match your search." : "No students found in the database."}
                    </TableCell>
                </TableRow>
              ) : filteredStudents.map((student) => (
                <TableRow key={student.id} >
                  <TableCell>{student.enrollment_number}</TableCell>
                  <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => setSelectedStudent(student)}>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.class || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <EditStudentDialog studentToEdit={student} onStudentUpdated={handleUpdateStudent}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </EditStudentDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student's record.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    