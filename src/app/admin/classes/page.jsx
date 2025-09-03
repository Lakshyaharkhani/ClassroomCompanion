
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
  addDoc,
  query,
  where,
  writeBatch,
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
  FilePlus,
  FileText,
  CheckSquare,
  Type,
  Users,
  Search,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";


// ---------------- Create Assignment Dialog ----------------
function CreateAssignmentDialog({ classDetails, onAssignmentCreated }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [assignmentName, setAssignmentName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [fileSize, setFileSize] = useState(5);
  const [questions, setQuestions] = useState([
    { text: "", type: "mcq", options: ["", ""], correctAnswerIndex: 0 },
  ]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const addQuestion = (type) => {
    if (type === "mcq") {
      setQuestions([
        ...questions,
        { text: "", type: "mcq", options: ["", ""], correctAnswerIndex: 0 },
      ]);
    } else {
      setQuestions([...questions, { text: "", type: "brief" }]);
    }
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!assignmentName || !dueDate || questions.some((q) => !q.text)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all required fields.",
      });
      return;
    }

    const newAssignment = {
      classId: classDetails.class_id,
      assignmentName,
      dueDate,
      fileSubmission: {
          required: true,
          allowedType: fileType,
          maxSizeMB: fileSize
      },
      questions: questions.map((q) => {
        if (q.type === "mcq") {
          return {
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.options[q.correctAnswerIndex],
          };
        }
        return q;
      }),
    };

    try {
      const docRef = await addDoc(collection(db, "assignments"), newAssignment);
      onAssignmentCreated({ ...newAssignment, id: docRef.id });
      toast({ title: "Success", description: "New assignment has been created." });
      setOpen(false);
      setAssignmentName("");
      setDueDate("");
      setQuestions([{ text: "", type: "mcq", options: ["", ""], correctAnswerIndex: 0 }]);
    } catch (error) {
      console.error("Error creating assignment: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not create assignment." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilePlus className="mr-2" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Assignment for {classDetails.class_name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-6">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignmentName">Assignment Name</Label>
                <Input
                  id="assignmentName"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
             <Separator />
            
             <div>
                <h3 className="text-lg font-semibold mb-2">File Submission Settings</h3>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="fileType">Allowed File Type</Label>
                        <Select onValueChange={setFileType} value={fileType}>
                            <SelectTrigger id="fileType">
                                <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="zip">ZIP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fileSize">Max File Size (MB)</Label>
                        <Input
                          id="fileSize"
                          type="number"
                          value={fileSize}
                          onChange={(e) => setFileSize(parseInt(e.target.value, 10))}
                        />
                    </div>
                </div>
             </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Questions</h3>
              <div className="space-y-4">
                {questions.map((q, qIndex) => (
                  <Card key={qIndex}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="w-full pr-4">
                          <Label htmlFor={`q-text-${qIndex}`}>Question {qIndex + 1}</Label>
                          <Textarea
                            id={`q-text-${qIndex}`}
                            value={q.text}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, "text", e.target.value)
                            }
                            placeholder="Enter your question text..."
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive mt-4"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {q.type === "mcq" && (
                        <div className="mt-4 pl-2 space-y-3">
                          <Label>Options (select the correct answer)</Label>
                          <RadioGroup
                            value={String(q.correctAnswerIndex)}
                            onValueChange={(val) =>
                              handleQuestionChange(qIndex, "correctAnswerIndex", parseInt(val, 10))
                            }
                          >
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-opt${oIndex}`} />
                                <Input
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-1 h-8"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive h-8 w-8"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  disabled={q.options.length <= 2}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </RadioGroup>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => addOption(qIndex)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                          </Button>
                        </div>
                      )}

                      {q.type === "brief" && (
                        <div className="mt-4 pl-2 space-y-2">
                          <Label className="text-muted-foreground">Brief Answer</Label>
                          <Textarea placeholder="Student will type their answer here..." disabled />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => addQuestion("mcq")}>
                  <CheckSquare className="mr-2" /> Add MCQ
                </Button>
                <Button variant="outline" onClick={() => addQuestion("brief")}>
                  <Type className="mr-2" /> Add Brief Answer
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Create Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function ManageStudentsDialog({ classDetails, onStudentsUpdated, children }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Fetch all students in the college
                const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                const studentsSnapshot = await getDocs(studentsQuery);
                const allStudentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllStudents(allStudentsData);

                // Filter for students already in this class
                const enrolled = allStudentsData.filter(s => classDetails.students.includes(s.enrollment_number));
                setEnrolledStudents(enrolled);

            } catch (error) {
                console.error("Error fetching students:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch student list." });
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [open, classDetails, toast]);
    
    const handleAddStudent = (student) => {
        setEnrolledStudents([...enrolledStudents, student]);
    };
    
    const handleRemoveStudent = (studentId) => {
        setEnrolledStudents(enrolledStudents.filter(s => s.enrollment_number !== studentId));
    };

    const handleSaveChanges = async () => {
        const classRef = doc(db, "classes", classDetails.id);
        const newStudentIds = enrolledStudents.map(s => s.enrollment_number);

        try {
            await updateDoc(classRef, {
                students: newStudentIds
            });
            onStudentsUpdated(classDetails.id, newStudentIds);
            toast({ title: "Success", description: "Student list updated." });
            setOpen(false);
        } catch (error) {
            console.error("Error updating students:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save changes." });
        }
    };

    const unenrolledStudents = allStudents
        .filter(s => !enrolledStudents.some(es => es.enrollment_number === s.enrollment_number))
        .filter(s => {
            const lowercasedFilter = searchTerm.toLowerCase();
            return (
                s.name?.toLowerCase().includes(lowercasedFilter) ||
                s.enrollment_number?.toLowerCase().includes(lowercasedFilter)
            );
        });


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Manage Students for {classDetails.class_name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 h-[60vh]">
                    {/* Enrolled Students Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Enrolled Students ({enrolledStudents.length}/{classDetails.capacity})</h3>
                        <ScrollArea className="border rounded-md p-2 flex-1">
                           {enrolledStudents.length > 0 ? (
                            enrolledStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.enrollment_number}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveStudent(student.enrollment_number)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                           ) : <p className="text-muted-foreground text-center py-4">No students enrolled.</p>}
                        </ScrollArea>
                    </div>

                    {/* Available Students Column */}
                     <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Available Students</h3>
                         <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search students..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="border rounded-md p-2 flex-1">
                            {loading ? <p>Loading...</p> : (
                                unenrolledStudents.map(student => (
                                     <div key={student.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.enrollment_number}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleAddStudent(student)}>
                                            Add
                                        </Button>
                                    </div>
                                ))
                            )}
                            {!loading && unenrolledStudents.length === 0 && <p className="text-muted-foreground text-center py-4">No students to add.</p>}
                        </ScrollArea>
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

function ClassDetailsCard({ classDetails, onBack, onAssignmentCreated, onStudentsUpdated }) {
    const [allStudents, setAllStudents] = useState([]);
    const [staffDetails, setStaffDetails] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    
    useEffect(() => {
        const fetchDetails = async () => {
            // Students
            if (classDetails.students && classDetails.students.length > 0) {
                const studentQuery = query(collection(db, "users"), where("enrollment_number", "in", classDetails.students));
                const studentSnapshot = await getDocs(studentQuery);
                setAllStudents(studentSnapshot.docs.map(doc => doc.data()));
            } else {
                setAllStudents([]);
            }
            
            // Staff
            if (classDetails.staff && classDetails.staff.length > 0) {
                const staffQuery = query(collection(db, "users"), where("staff_id", "in", classDetails.staff));
                const staffSnapshot = await getDocs(staffQuery);
                const staffMap = staffSnapshot.docs.reduce((acc, doc) => {
                    const data = doc.data();
                    acc[data.staff_id] = data.name;
                    return acc;
                }, {});
                setStaffDetails(staffMap);
            }

            // Assignments
            const assignmentsQuery = query(collection(db, "assignments"), where("classId", "==", classDetails.id));
            const assignmentsSnapshot = await getDocs(assignmentsQuery);
            const assignmentsData = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAssignments(assignmentsData);

            // Submissions
             if (assignmentsData.length > 0) {
                const submissionsQuery = query(collection(db, "submissions"), where("assignmentId", "in", assignmentsData.map(a => a.id)));
                const submissionsSnapshot = await getDocs(submissionsQuery);
                const submissionsData = submissionsSnapshot.docs.map(doc => doc.data());
                setSubmissions(submissionsData);
            }
        }
        fetchDetails();
    }, [classDetails]);
    
    const getSubmissionsForAssignment = (assignmentId) => {
        return submissions.filter(s => s.assignmentId === assignmentId);
    }
    
    const getStudentName = (studentId) => {
        const student = allStudents.find(s => s.enrollment_number === studentId);
        return student ? student.name : studentId;
    }

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
                            <CardDescription>{classDetails.department} - Semester {classDetails.semester}</CardDescription>
                        </div>
                    </div>
                     <CreateAssignmentDialog classDetails={classDetails} onAssignmentCreated={onAssignmentCreated} />
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="students">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects</TabsTrigger>
                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="students" className="mt-4">
                         <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base flex items-center gap-2"><Users /> Enrolled Students ({classDetails.students.length}/{classDetails.capacity})</CardTitle>
                                     <ManageStudentsDialog classDetails={classDetails} onStudentsUpdated={onStudentsUpdated}>
                                        <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4" /> Manage</Button>
                                     </ManageStudentsDialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                               {allStudents.length > 0 ? (
                                <ScrollArea className="h-64">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Enrollment No.</TableHead><TableHead>Name</TableHead></TableRow></TableHeader>
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
                                <p className="text-muted-foreground text-center py-4">No students enrolled.</p>
                            )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="subjects" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><UserSquare /> Subjects & Teachers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 {classDetails.subjects.length > 0 ? (
                                    <ScrollArea className="h-64">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Teacher</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {classDetails.subjects.map((subject, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                                        <TableCell>{staffDetails[subject.staffId] || subject.staffId}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                 ) : (
                                    <p className="text-muted-foreground text-center py-4">No subjects assigned.</p>
                                 )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="assignments" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><FileText /> Assignments & Submissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assignments.length > 0 ? (
                                    <ScrollArea className="h-64">
                                        {assignments.map(assignment => (
                                            <div key={assignment.id} className="mb-4">
                                                <h4 className="font-semibold">{assignment.assignmentName}</h4>
                                                <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow><TableHead>Student</TableHead><TableHead>Submitted On</TableHead><TableHead className="text-right">File</TableHead></TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {getSubmissionsForAssignment(assignment.id).map(sub => (
                                                            <TableRow key={sub.studentId}>
                                                                <TableCell>{getStudentName(sub.studentId)}</TableCell>
                                                                <TableCell>{new Date(sub.submittedAt.seconds * 1000).toLocaleString()}</TableCell>
                                                                <TableCell className="text-right">
                                                                     <Button asChild variant="outline" size="sm">
                                                                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                            <Download className="mr-2"/> Download
                                                                        </a>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {getSubmissionsForAssignment(assignment.id).length === 0 && (
                                                            <TableRow><TableCell colSpan={3} className="text-center">No submissions yet.</TableCell></TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                 ) : (
                                    <p className="text-muted-foreground text-center py-4">No assignments created for this class yet.</p>
                                 )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
            const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(classesData);
        } catch(error) {
            console.error("Error fetching classes:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch classes." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [toast]);
    
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
        const updatedClasses = classes.map(c => {
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
    
    const handleAssignmentCreated = (newAssignment) => {
        // Refetch class details to show the new assignment
        if (selectedClass) {
            const updatedClass = { ...selectedClass };
            if (!updatedClass.assignments) updatedClass.assignments = [];
            updatedClass.assignments.push(newAssignment);
            setSelectedClass(updatedClass);
        }
    };

    const handleDeleteClass = async (classId) => {
        // Here you might want to check if the class has students or staff and warn the user.
        try {
            await deleteDoc(doc(db, "classes", classId));
            setClasses(classes.filter(c => c.id !== classId));
            toast({title: "Success", description: "Class has been deleted."});
        } catch(error) {
            console.error("Error deleting class:", error);
            toast({variant: "destructive", title: "Error", description: "Could not delete class."});
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
            onAssignmentCreated={handleAssignmentCreated}
            onStudentsUpdated={handleStudentsUpdated}
        />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Class Management</h1>
                <ClassFormDialog mode="create" onClassCreated={handleClassCreated}>
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
                            {classes.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => viewClassDetails(c)}>{c.class_name}</TableCell>
                                    <TableCell>{c.department}</TableCell>
                                    <TableCell>{c.semester}</TableCell>
                                    <TableCell>{c.students?.length || 0} / {c.capacity}</TableCell>
                                    <TableCell>{c.staff?.length || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <ClassFormDialog mode="edit" classToEdit={c} onClassUpdated={handleClassUpdated}>
                                             <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </ClassFormDialog>
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
                                                    This action cannot be undone. This will permanently delete the class record.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteClass(c.id)}>Continue</AlertDialogAction>
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
