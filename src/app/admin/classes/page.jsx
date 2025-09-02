

"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PlusCircle, Edit, Trash2, UserPlus, ArrowLeft, UserSquare, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { seedStudents, seedStaff, uid } from "../../../lib/data";
import { Separator } from "../../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../hooks/use-toast";


function CreateClassDialog({ onClassCreated }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [capacity, setCapacity] = useState('');
  const [room, setRoom] = useState('');
  const [subjects, setSubjects] = useState([{ subjectName: '', staffId: '' }]);
  const [allStaff] = useState(seedStaff);


  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', staffId: '' }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleSubmit = async () => {
    const classId = `${department.substring(0,2).toUpperCase()}${uid().substring(0,3)}`;
    const newClass = {
      class_id: classId,
      class_name: className,
      department,
      semester: parseInt(semester, 10) || 0,
      subjects: subjects, 
      capacity: parseInt(capacity, 10) || 0,
      room_number: room,
      staff: [...new Set(subjects.map(s => s.staffId).filter(Boolean))],
      students: [],
    };

    try {
        await setDoc(doc(db, "classes", classId), newClass);
        onClassCreated(newClass);
        toast({ title: "Success", description: "New class has been created." });
        setOpen(false);
        // Reset form
        setClassName('');
        setDepartment('');
        setSemester('');
        setCapacity('');
        setRoom('');
        setSubjects([{ subjectName: '', staffId: '' }]);
    } catch (error) {
        console.error("Error creating class: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not create the class." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Create Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g., Year 1 Section A" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Computer Science" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" type="number" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g., 1" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g., 60" />
            </div>
             <div className="space-y-2 col-span-2">
                <Label htmlFor="room">Room No.</Label>
                <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g., A-301" />
            </div>
          </div>
          
          <Separator className="my-4" />

          <div>
            <Label className="text-lg font-semibold">Subjects</Label>
            <div className="space-y-4 mt-2">
              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-9 gap-2 items-center p-2 rounded-md border">
                  <div className="col-span-4">
                    <Label htmlFor={`subjectName-${index}`} className="text-xs text-muted-foreground">Subject Name</Label>
                    <Input id={`subjectName-${index}`} value={subject.subjectName} onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)} placeholder="e.g., Web Technologies" />
                  </div>
                   <div className="col-span-4">
                     <Label htmlFor={`staff-${index}`} className="text-xs text-muted-foreground">Teacher</Label>                    <Select onValueChange={(value) => handleSubjectChange(index, 'staffId', value)} value={subject.staffId}>
                      <SelectTrigger id={`staff-${index}`}>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStaff.map(staff => <SelectItem key={staff.staff_id} value={staff.staff_id}>{staff.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="mt-4 text-destructive" onClick={() => removeSubject(index)} disabled={subjects.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={addSubject} variant="outline" size="sm" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
          </div>
        </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Create Class</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditClassDialog({ classToEdit, onClassUpdated, children }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState(classToEdit.class_name);
  const [department, setDepartment] = useState(classToEdit.department);
  const [semester, setSemester] = useState(classToEdit.semester);
  const [capacity, setCapacity] = useState(classToEdit.capacity);
  const [room, setRoom] = useState(classToEdit.room_number);
  const [subjects, setSubjects] = useState(classToEdit.subjects || []);
  const [allStaff] = useState(seedStaff);


  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', staffId: '' }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleSubmit = async () => {
    const updatedClass = {
      ...classToEdit,
      class_name: className,
      department,
      semester: parseInt(semester, 10),
      subjects: subjects,
      capacity: parseInt(capacity, 10),
      room_number: room,
      staff: [...new Set(subjects.map(s => s.staffId).filter(Boolean))],
    };
    
    try {
        const classRef = doc(db, "classes", classToEdit.class_id);
        await updateDoc(classRef, updatedClass);
        onClassUpdated(updatedClass);
        toast({ title: "Success", description: "Class details have been updated." });
        setOpen(false);
    } catch(error) {
        console.error("Error updating class: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update class details." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Class: {classToEdit.class_name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" type="number" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
             <div className="space-y-2 col-span-2">
                <Label htmlFor="room">Room No.</Label>
                <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} />
            </div>
          </div>
          
          <Separator className="my-4" />

          <div>
            <Label className="text-lg font-semibold">Subjects</Label>
            <div className="space-y-4 mt-2">
              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-9 gap-2 items-center p-2 rounded-md border">
                  <div className="col-span-4">
                    <Label htmlFor={`subjectName-${index}`} className="text-xs text-muted-foreground">Subject Name</Label>
                    <Input id={`subjectName-${index}`} value={subject.subjectName} onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)} />
                  </div>
                   <div className="col-span-4">
                     <Label htmlFor={`staff-${index}`} className="text-xs text-muted-foreground">Teacher</Label>
                     <Select onValueChange={(value) => handleSubjectChange(index, 'staffId', value)} value={subject.staffId}>
                      <SelectTrigger id={`staff-${index}`}>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStaff.map(staff => <SelectItem key={staff.staff_id} value={staff.staff_id}>{staff.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="mt-4 text-destructive" onClick={() => removeSubject(index)} disabled={subjects.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={addSubject} variant="outline" size="sm" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
          </div>
        </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function AddStudentToClassDialog({ classDetails, onStudentAdded }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [error, setError] = useState('');
    const [allStudents] = useState(seedStudents);

    const handleSubmit = async () => {
        const studentExists = allStudents.some(s => s.enrollment_number === enrollmentNumber);
        if (!studentExists) {
            setError("No student found with this enrollment number in the college records.");
            return;
        }

        const studentAlreadyInClass = classDetails.students.includes(enrollmentNumber);
        if (studentAlreadyInClass) {
            setError("This student is already enrolled in this class.");
            return;
        }
        
        try {
            const classRef = doc(db, "classes", classDetails.class_id);
            await updateDoc(classRef, {
                students: arrayUnion(enrollmentNumber)
            });
            onStudentAdded(classDetails.class_id, enrollmentNumber);
            toast({ title: "Success", description: "Student added to class."});
            setOpen(false);
            setEnrollmentNumber('');
            setError('');
        } catch(e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "Could not add student to class." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Student to {classDetails.class_name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>Enter the enrollment number of the student to add them to this class.</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enrollmentNumber" className="text-right">
                            Enrollment No.
                        </Label>
                        <Input id="enrollmentNumber" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} className="col-span-3" placeholder="e.g., 2021CS001" />
                    </div>
                    {error && <p className="text-destructive text-sm text-center col-span-4">{error}</p>}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Add Student</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AddStaffToClassDialog({ classDetails, onStaffAdded }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [staffId, setStaffId] = useState('');
    const [error, setError] = useState('');
    const [allStaff] = useState(seedStaff);

    const handleSubmit = async () => {
        const staffExists = allStaff.some(s => s.staff_id === staffId);
        if (!staffExists) {
            setError("No staff member found with this ID in the college records.");
            return;
        }

        const staffAlreadyInClass = classDetails.staff.includes(staffId);
        if (staffAlreadyInClass) {
            setError("This staff member is already assigned to this class.");
            return;
        }

        try {
            const classRef = doc(db, "classes", classDetails.class_id);
            await updateDoc(classRef, {
                staff: arrayUnion(staffId)
            });
            onStaffAdded(classDetails.class_id, staffId);
            toast({ title: "Success", description: "Staff assigned to class."});
            setOpen(false);
            setStaffId('');
            setError('');
        } catch(e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "Could not assign staff to class." });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserSquare className="mr-2" />
                    Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Staff to {classDetails.class_name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>Enter the ID of the staff member to add them to this class.</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staffId" className="text-right">
                            Staff ID
                        </Label>
                        <Input id="staffId" value={staffId} onChange={(e) => setStaffId(e.target.value)} className="col-span-3" placeholder="e.g., STF-01" />
                    </div>
                    {error && <p className="text-destructive text-sm text-center col-span-4">{error}</p>}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Add Staff</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ClassDetails({ classDetails, onBack, onStudentAddedToClass, onStudentRemovedFromClass, onStaffAddedToClass, onStaffRemovedFromClass }) {
    const [allStudents] = useState(seedStudents);
    const [allStaff] = useState(seedStaff);
    
    const studentsInClass = allStudents.filter(s => classDetails.students.includes(s.enrollment_number));
    const staffInClass = allStaff.filter(s => classDetails.staff.includes(s.staff_id));

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle>{classDetails.class_name} ({classDetails.class_id})</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Assigned Staff</h3>
                        <AddStaffToClassDialog classDetails={classDetails} onStaffAdded={onStaffAddedToClass} />
                    </div>
                    {staffInClass.length > 0 ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffInClass.map((staff) => (
                                    <TableRow key={staff.staff_id}>
                                        <TableCell>{staff.staff_id}</TableCell>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onStaffRemovedFromClass(classDetails.class_id, staff.staff_id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No staff have been assigned to this class yet.</p>
                    )}
                </div>

                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Enrolled Students</h3>
                        <AddStudentToClassDialog classDetails={classDetails} onStudentAdded={onStudentAddedToClass} />
                    </div>
                    {studentsInClass.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Enrollment No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsInClass.map((student) => (
                                    <TableRow key={student.enrollment_number}>
                                        <TableCell>{student.enrollment_number}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onStudentRemovedFromClass(classDetails.class_id, student.enrollment_number)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No students have been enrolled in this class yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ClassManagementPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "classes"));
            const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(classesData);
        } catch(error) {
            console.error("Error fetching classes: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch classes from the database." });
        } finally {
            setLoading(false);
        }
    };
    fetchClasses();
  }, [toast]);

  const handleCreateClass = (newClass) => {
    setClasses([...classes, newClass]);
  };

  const handleUpdateClass = (updatedClass) => {
    const updatedClasses = classes.map(c => c.class_id === updatedClass.class_id ? updatedClass : c);
    setClasses(updatedClasses);
    if(selectedClass && selectedClass.class_id === updatedClass.class_id) {
        setSelectedClass(updatedClass);
    }
  }

  const handleDeleteClass = async (classId) => {
    try {
        await deleteDoc(doc(db, "classes", classId));
        const updatedClasses = classes.filter(c => c.class_id !== classId);
        setClasses(updatedClasses);
        toast({ title: "Success", description: "Class has been deleted."});
        if (selectedClass && selectedClass.class_id === classId) {
            setSelectedClass(null);
        }
    } catch (error) {
        console.error("Error deleting class: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete the class." });
    }
  }

  const handleAddStudentToClass = (classId, studentEnrollmentNumber) => {
      const updatedClasses = classes.map(c => {
          if (c.class_id === classId) {
              return { ...c, students: [...c.students, studentEnrollmentNumber] };
          }
          return c;
      });
      setClasses(updatedClasses);

      if(selectedClass && selectedClass.class_id === classId) {
        const updatedSelectedClass = updatedClasses.find(c => c.class_id === classId);
        setSelectedClass(updatedSelectedClass);
      }
  };

  const handleRemoveStudentFromClass = async (classId, studentEnrollmentNumber) => {
      try {
        const classRef = doc(db, "classes", classId);
        await updateDoc(classRef, {
            students: arrayRemove(studentEnrollmentNumber)
        });
        
        const updatedClasses = classes.map(c => {
            if (c.class_id === classId) {
                return { ...c, students: c.students.filter(sid => sid !== studentEnrollmentNumber) };
            }
            return c;
        });
        setClasses(updatedClasses);

        if(selectedClass && selectedClass.class_id === classId) {
            const updatedSelectedClass = updatedClasses.find(c => c.class_id === classId);
            setSelectedClass(updatedSelectedClass);
        }
        toast({ title: "Success", description: "Student removed from class." });
      } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Error", description: "Could not remove student." });
      }
  }

  const handleAddStaffToClass = (classId, staffId) => {
      const updatedClasses = classes.map(c => {
          if (c.class_id === classId) {
              if (c.staff.includes(staffId)) return c;
              return { ...c, staff: [...c.staff, staffId] };
          }
          return c;
      });
      setClasses(updatedClasses);

       if(selectedClass && selectedClass.class_id === classId) {
        const updatedSelectedClass = updatedClasses.find(c => c.class_id === classId);
        setSelectedClass(updatedSelectedClass);
      }
  };

  const handleRemoveStaffFromClass = async (classId, staffId) => {
      try {
        const classRef = doc(db, "classes", classId);
        await updateDoc(classRef, {
            staff: arrayRemove(staffId)
        });

        const updatedClasses = classes.map(c => {
            if (c.class_id === classId) {
                return { ...c, staff: c.staff.filter(sid => sid !== staffId) };
            }
            return c;
        });
        setClasses(updatedClasses);

         if(selectedClass && selectedClass.class_id === classId) {
          const updatedSelectedClass = updatedClasses.find(c => c.class_id === classId);
          setSelectedClass(updatedSelectedClass);
        }
        toast({ title: "Success", description: "Staff removed from class." });
      } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Error", description: "Could not remove staff." });
      }
  }

  const viewClassDetails = (classId) => {
    const classToShow = classes.find(c => c.class_id === classId);
    setSelectedClass(classToShow);
  }

  const goBackToList = () => {
      setSelectedClass(null);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Loading classes...</p></div>
  }

  if (selectedClass) {
    return <ClassDetails 
        classDetails={selectedClass} 
        onBack={goBackToList} 
        onStudentAddedToClass={handleAddStudentToClass}
        onStudentRemovedFromClass={handleRemoveStudentFromClass}
        onStaffAddedToClass={handleAddStaffToClass}
        onStaffRemovedFromClass={handleRemoveStaffFromClass}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <CreateClassDialog onClassCreated={handleCreateClass} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class ID</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                    <TableCell colSpan="8" className="text-center h-24">No classes found. You can create one to get started.</TableCell>
                </TableRow>
              ) : classes.map((c) => (
                <TableRow key={c.class_id}>
                  <TableCell className="cursor-pointer hover:underline" onClick={() => viewClassDetails(c.class_id)}>{c.class_id}</TableCell>
                  <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => viewClassDetails(c.class_id)}>{c.class_name}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>{c.department}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>{c.semester}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>{c.subjects?.length || (c.subject ? 1 : 0)}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>{c.staff.length}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>{c.students.length}</TableCell>
                  <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                        <EditClassDialog classToEdit={c} onClassUpdated={handleUpdateClass}>
                            <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </EditClassDialog>
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
                                    This action cannot be undone. This will permanently delete the class
                                    and remove all associated student and staff data from it.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClass(c.class_id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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
