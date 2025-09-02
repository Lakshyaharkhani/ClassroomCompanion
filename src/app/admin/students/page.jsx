
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
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
    const newStudent = {
       // Top-level fields for easy access and querying
      enrollment_number: `${year}${departmentCode}${uid().substring(0,3).toUpperCase()}`,
      name: formData.studentName || 'N/A',
      email: formData.email || '',
      role: 'student',
      department: formData.program || 'N/A', 
      class: '', // Assigned later
      phone: formData.mobile || '',
      dob: formData.dob || '',
      gender: formData.gender || '',
      
      // A `details` object for all other information from the form
      details: {
          ...formData,
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
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} value={data[field.id]}>
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
  const [formData, setFormData] = useState(studentToEdit.details || {});

  useEffect(() => {
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
  }, [studentToEdit]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const updatedStudentData = {
      ...studentToEdit,
      name: formData.studentName,
      email: formData.email,
      department: formData.program,
      phone: formData.mobile,
      dob: formData.dob,
      gender: formData.gender,
      details: {
        ...formData,
      },
    };

    try {
      const studentRef = doc(db, "users", studentToEdit.id);
      await updateDoc(studentRef, updatedStudentData);
      onStudentUpdated(updatedStudentData);
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
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} value={data[field.id]}>
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
                <TableRow key={student.id}>
                  <TableCell>{student.enrollment_number}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
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
