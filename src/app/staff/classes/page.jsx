
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, addDoc, query, where, getDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, X, FilePlus, CheckSquare, Type, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../hooks/use-toast";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { useAuth } from "../../../components/auth/auth-provider";


function CreateAssignmentDialog({ classDetails, onAssignmentCreated }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [assignmentName, setAssignmentName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [questions, setQuestions] = useState([{ text: '', type: 'mcq', options: ['', ''], correctAnswerIndex: 0 }]);

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
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    }

    const addQuestion = (type) => {
        if (type === 'mcq') {
            setQuestions([...questions, { text: '', type: 'mcq', options: ['', ''], correctAnswerIndex: 0 }]);
        } else {
            setQuestions([...questions, { text: '', type: 'brief' }]);
        }
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        if (!assignmentName || !dueDate || questions.some(q => !q.text)) {
            toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
            return;
        }

        const newAssignment = {
            classId: classDetails.class_id,
            assignmentName,
            dueDate,
            questions: questions.map(q => {
                if (q.type === 'mcq') {
                    return {
                        text: q.text,
                        type: q.type,
                        options: q.options,
                        correctAnswer: q.options[q.correctAnswerIndex]
                    }
                }
                return q;
            }),
        };

        try {
            const docRef = await addDoc(collection(db, "assignments"), newAssignment);
            onAssignmentCreated({ ...newAssignment, id: docRef.id });
            toast({ title: "Success", description: "New assignment has been created." });
            setOpen(false);
            setAssignmentName('');
            setDueDate('');
            setQuestions([{ text: '', type: 'mcq', options: ['', ''], correctAnswerIndex: 0 }]);
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
                                <Input id="assignmentName" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                                                     <Textarea id={`q-text-${qIndex}`} value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="Enter your question text..." />
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-destructive mt-4" onClick={() => removeQuestion(qIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {q.type === 'mcq' && (
                                                <div className="mt-4 pl-2 space-y-3">
                                                    <Label>Options (select the correct answer)</Label>
                                                    <RadioGroup value={String(q.correctAnswerIndex)} onValueChange={(val) => handleQuestionChange(qIndex, 'correctAnswerIndex', parseInt(val,10))}>
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-2">
                                                          <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-opt${oIndex}`} />
                                                          <Input value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="flex-1 h-8" />
                                                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options.length <= 2}>
                                                              <X className="h-4 w-4"/>
                                                          </Button>
                                                        </div>
                                                    ))}
                                                    </RadioGroup>
                                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => addOption(qIndex)}>
                                                        Add Option
                                                    </Button>
                                                </div>
                                            )}
                                             {q.type === 'brief' && (
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
                                <Button variant="outline" onClick={() => addQuestion('mcq')}><CheckSquare className="mr-2"/> Add MCQ</Button>
                                <Button variant="outline" onClick={() => addQuestion('brief')}><Type className="mr-2"/> Add Brief Answer</Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Create Assignment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StaffClassDetails({ classDetails, onBack, onAssignmentCreated }) {
    const [allStudents, setAllStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (classDetails.students && classDetails.students.length > 0) {
                const studentQuery = query(collection(db, "users"), where("enrollment_number", "in", classDetails.students));
                const studentSnapshot = await getDocs(studentQuery);
                setAllStudents(studentSnapshot.docs.map(doc => doc.data()));
            }
        }
        fetchStudents();
    }, [classDetails.students]);

    useEffect(() => {
        const fetchAssignments = async () => {
             const assignmentsQuery = query(collection(db, "assignments"), where("classId", "==", classDetails.class_id));
             const assignmentsSnapshot = await getDocs(assignmentsQuery);
             setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        fetchAssignments();
    }, [classDetails.class_id])


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
                     <CreateAssignmentDialog classDetails={classDetails} onAssignmentCreated={onAssignmentCreated} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Enrolled Students</CardTitle></CardHeader>
                        <CardContent>
                        {allStudents.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Enrollment No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allStudents.map((student) => (
                                        <TableRow key={student.enrollment_number}>
                                            <TableCell>{student.enrollment_number}</TableCell>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p>No students enrolled.</p>
                        )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-base">Assignments</CardTitle></CardHeader>
                        <CardContent>
                            {assignments.length > 0 ? (
                                <ul>
                                    {assignments.map(assignment => (
                                        <li key={assignment.id} className="flex justify-between items-center p-2 border-b">
                                            <span>{assignment.assignmentName}</span>
                                            <span className="text-sm text-muted-foreground">Due: {assignment.dueDate}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No assignments created for this class.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}

export default function StaffClassesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (!user || !user.staff_id) return;
    
    const fetchClasses = async () => {
        try {
            const q = query(collection(db, "classes"), where("staff", "array-contains", user.staff_id));
            const querySnapshot = await getDocs(q);
            const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(classesData);
        } catch(error) {
            console.error("Error fetching classes: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch your classes from the database." });
        } finally {
            setLoading(false);
        }
    };
    fetchClasses();
  }, [user, toast]);
  
  const handleAssignmentCreated = (newAssignment) => {
      if (selectedClass) {
        setSelectedClass(prev => ({...prev, assignments: [...(prev.assignments || []), newAssignment]}));
      }
  };

  const viewClassDetails = (classId) => {
    const classToShow = classes.find(c => c.class_id === classId);
    setSelectedClass(classToShow);
  }

  const goBackToList = () => {
      setSelectedClass(null);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Loading your classes...</p></div>
  }

  if (selectedClass) {
    return <StaffClassDetails 
        classDetails={selectedClass} 
        onBack={goBackToList} 
        onAssignmentCreated={handleAssignmentCreated}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Classes</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class ID</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                    <TableCell colSpan="5" className="text-center h-24">You are not assigned to any classes.</TableCell>
                </TableRow>
              ) : classes.map((c) => (
                <TableRow key={c.class_id} className="cursor-pointer" onClick={() => viewClassDetails(c.class_id)}>
                  <TableCell>{c.class_id}</TableCell>
                  <TableCell className="font-medium">{c.class_name}</TableCell>
                  <TableCell>{c.department}</TableCell>
                  <TableCell>{c.semester}</TableCell>
                  <TableCell>{c.students.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
