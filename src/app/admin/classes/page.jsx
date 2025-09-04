
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  PlusCircle,
  Edit,
  Trash2,
  UserPlus,
  ArrowLeft,
  UserSquare,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { uid } from "../../../lib/data";
import { Separator } from "../../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../hooks/use-toast";
import { query, where } from "firebase/firestore";

function ManageStudentsDialog({ classDetails, onStudentsUpdated, children }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const studentsQuery = query(
            collection(db, "users"),
            where("role", "==", "student")
          );
          const querySnapshot = await getDocs(studentsQuery);
          setAllStudents(
            querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (error) {
          console.error("Error fetching students:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch student list.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  }, [open, toast]);

  // Set enrolled students only when dialog opens or class details change
  useEffect(() => {
    if (open) {
      setEnrolledStudentIds(classDetails.students || []);
    }
  }, [open, classDetails.students]);


  const handleToggleStudent = (studentId) => {
    setEnrolledStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSaveChanges = async () => {
    const classRef = doc(db, "classes", classDetails.id);
    try {
      await updateDoc(classRef, {
        students: enrolledStudentIds,
      });
      onStudentsUpdated(classDetails.id, enrolledStudentIds);
      toast({ title: "Success", description: "Student list updated." });
      setOpen(false);
    } catch (error) {
      console.error("Error updating students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save changes.",
      });
    }
  };

  const filteredStudents = allStudents.filter((student) => {
    const isEnrolled = enrolledStudentIds.includes(student.enrollment_number);
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollment_number.includes(searchTerm);
    return matchesSearch && !isEnrolled;
  });

  const enrolledStudents = allStudents.filter((student) =>
    enrolledStudentIds.includes(student.enrollment_number)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Students for {classDetails.class_name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Enrolled Students Column */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">
              Enrolled Students ({enrolledStudents.length}/{classDetails.capacity})
            </h3>
            <div className="border rounded-md flex-1 min-h-0">
              <ScrollArea className="h-full">
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 border-b"
                    >
                      <span className="text-sm">
                        {student.name} ({student.enrollment_number})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStudent(student.enrollment_number)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No students enrolled.</div>
                )}
              </ScrollArea>
            </div>
          </div>
          {/* Available Students Column */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Available Students</h3>
            <Input
              placeholder="Search available students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="border rounded-md flex-1 min-h-0">
              <ScrollArea className="h-full">
                 {loading ? <p className="p-4 text-center">Loading...</p> : (
                  filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 border-b"
                      >
                        <span className="text-sm">
                          {student.name} ({student.enrollment_number})
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStudent(student.enrollment_number)}
                          disabled={enrolledStudentIds.length >= classDetails.capacity}
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No available students found.</div>
                  )
                 )}
              </ScrollArea>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Class Form Dialog (Create/Edit) ----------------
function ClassFormDialog({ mode = 'create', classToEdit, onClassCreated, onClassUpdated, children }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [subjects, setSubjects] = useState([{ subjectName: "", staffId: "" }]);
  const [allStaff, setAllStaff] = useState([]);

  useEffect(() => {
    if (!open) return;
    
    // Fetch all staff members when dialog opens
    const fetchStaff = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "staff"));
            const querySnapshot = await getDocs(q);
            const staffData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAllStaff(staffData);
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch staff list." });
        }
    };
    fetchStaff();
    
    // If in edit mode, populate form with existing data
    if (mode === 'edit' && classToEdit) {
        setFormData({
            className: classToEdit.class_name,
            department: classToEdit.department,
            semester: classToEdit.semester,
            capacity: classToEdit.capacity,
            room: classToEdit.room_number,
        });
        setSubjects(classToEdit.subjects || [{ subjectName: "", staffId: "" }]);
    } else {
        // Reset for create mode
        setFormData({});
        setSubjects([{ subjectName: "", staffId: "" }]);
    }
  }, [open, mode, classToEdit, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const addSubject = () => setSubjects([...subjects, { subjectName: "", staffId: "" }]);
  const removeSubject = (index) => setSubjects(subjects.filter((_, i) => i !== index));
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async () => {
    if (!formData.className || !formData.department || !formData.semester || !formData.capacity || !formData.room) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
      return;
    }

    const assignedStaffIds = [...new Set(subjects.map(s => s.staffId).filter(Boolean))];

    if(mode === 'create') {
        const newClass = {
            class_id: `${formData.department.slice(0, 3).toUpperCase()}-${uid().slice(0, 4)}`,
            class_name: formData.className,
            department: formData.department,
            semester: parseInt(formData.semester, 10),
            capacity: parseInt(formData.capacity, 10),
            room_number: formData.room,
            subjects,
            staff: assignedStaffIds,
            students: [],
        };
        try {
            await setDoc(doc(db, "classes", newClass.class_id), newClass);
            onClassCreated({ ...newClass, id: newClass.class_id });
            toast({ title: "Success", description: "New class has been created." });
            setOpen(false);
        } catch (error) {
            console.error("Error creating class:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create class." });
        }
    } else { // Edit mode
        const updatedClassData = {
            ...classToEdit,
            class_name: formData.className,
            department: formData.department,
            semester: parseInt(formData.semester, 10),
            capacity: parseInt(formData.capacity, 10),
            room_number: formData.room,
            subjects,
            staff: assignedStaffIds,
        };
         try {
            await setDoc(doc(db, "classes", classToEdit.id), updatedClassData);
            onClassUpdated({ ...updatedClassData, id: classToEdit.id });
            toast({ title: "Success", description: "Class has been updated." });
            setOpen(false);
        } catch (error) {
            console.error("Error updating class:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update class." });
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Class' : 'Edit Class'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input id="className" value={formData.className || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={formData.department || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" type="number" value={formData.semester || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" value={formData.capacity || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="room">Room</Label>
              <Input id="room" value={formData.room || ''} onChange={handleInputChange} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">Subjects & Teachers</h3>
            {subjects.map((sub, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={sub.subjectName}
                  onChange={(e) => handleSubjectChange(index, "subjectName", e.target.value)}
                  placeholder="Subject Name"
                  className="flex-1"
                />
                <Select
                  onValueChange={(val) => handleSubjectChange(index, "staffId", val)}
                  value={sub.staffId}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Assign Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStaff.length > 0 ? allStaff.map((staff) => (
                      <SelectItem key={staff.staff_id} value={staff.staff_id}>
                        {staff.name} ({staff.staff_id})
                      </SelectItem>
                    )) : <SelectItem disabled>No staff found</SelectItem>}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeSubject(index)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSubject}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSubmit}>{mode === 'create' ? 'Create Class' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClassDetailsCard({ classDetails, onBack, onStudentsUpdated }) {
  const [allStudents, setAllStudents] = useState([]);
  const [staffDetails, setStaffDetails] = useState({});

  useEffect(() => {
    const fetchStudentsAndStaff = async () => {
      // Fetch details for enrolled students
      if (classDetails.students && classDetails.students.length > 0) {
        const studentQuery = query(
          collection(db, "users"),
          where("enrollment_number", "in", classDetails.students)
        );
        const studentSnapshot = await getDocs(studentQuery);
        setAllStudents(studentSnapshot.docs.map((doc) => doc.data()));
      } else {
        setAllStudents([]);
      }

      // Fetch details for assigned staff
      if (classDetails.staff && classDetails.staff.length > 0) {
        const staffQuery = query(
          collection(db, "users"),
          where("staff_id", "in", classDetails.staff)
        );
        const staffSnapshot = await getDocs(staffQuery);
        const staffMap = staffSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.staff_id] = data.name;
          return acc;
        }, {});
        setStaffDetails(staffMap);
      } else {
        setStaffDetails({});
      }
    };
    
    fetchStudentsAndStaff();

  }, [classDetails]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <CardTitle>{classDetails.class_name} ({classDetails.id})</CardTitle>
                    <CardDescription>
                    {classDetails.department} - Semester {classDetails.semester}
                    </CardDescription>
                </div>
            </div>
            <ManageStudentsDialog
                classDetails={classDetails}
                onStudentsUpdated={onStudentsUpdated}
            >
                <Button variant="outline">
                    <UserPlus className="mr-2" /> Manage Students
                </Button>
            </ManageStudentsDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              {allStudents.length > 0 ? (
                <ScrollArea className="h-72">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enrollment No.</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allStudents.map((student) => (
                        <TableRow key={student.enrollment_number}>
                          <TableCell>{student.enrollment_number}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p>No students enrolled.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserSquare /> Subjects & Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classDetails.subjects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classDetails.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {subject.subjectName}
                        </TableCell>
                        <TableCell>{staffDetails[subject.staffId] || subject.staffId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No subjects assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "classes"));
      const classesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch classes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleClassCreated = (newClass) => {
    setClasses([...classes, newClass]);
  };
  
  const handleClassUpdated = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
     if (selectedClass && selectedClass.id === updatedClass.id) {
      setSelectedClass(updatedClass);
    }
  };

  const handleStudentsUpdated = (classId, newStudentIds) => {
    const updatedClasses = classes.map((c) => {
      if (c.id === classId) {
        return { ...c, students: newStudentIds };
      }
      return c;
    });
    setClasses(updatedClasses);
    if (selectedClass && selectedClass.id === classId) {
        setSelectedClass(prev => ({...prev, students: newStudentIds}));
    }
  };

  const handleDeleteClass = async (classId) => {
    // Here you might want to check if the class has students or staff and warn the user.
    try {
      await deleteDoc(doc(db, "classes", classId));
      setClasses(classes.filter((c) => c.id !== classId));
      toast({ title: "Success", description: "Class has been deleted." });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete class.",
      });
    }
  };

  const viewClassDetails = (classData) => {
    setSelectedClass(classData);
  };

  if (loading) {
    return <p>Loading classes...</p>;
  }

  if (selectedClass) {
    return <ClassDetailsCard 
        classDetails={selectedClass} 
        onBack={() => setSelectedClass(null)} 
        onStudentsUpdated={handleStudentsUpdated}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <ClassFormDialog mode="create" onClassCreated={handleClassCreated} onClassUpdated={handleClassUpdated}>
            <Button>
                <PlusCircle className="mr-2" /> Create Class
            </Button>
        </ClassFormDialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => viewClassDetails(c)}
                  >
                    {c.class_name}
                  </TableCell>
                  <TableCell>{c.department}</TableCell>
                  <TableCell>{c.semester}</TableCell>
                  <TableCell>
                    {c.students?.length || 0} / {c.capacity}
                  </TableCell>
                  <TableCell>{c.staff?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <ClassFormDialog mode="edit" classToEdit={c} onClassUpdated={handleClassUpdated}>
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </ClassFormDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the class record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClass(c.id)}>
                            Continue
                          </AlertDialogAction>
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
