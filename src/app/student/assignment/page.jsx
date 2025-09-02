
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/auth/auth-provider";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "../../../hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";

function AssignmentView({ assignment, studentId, onSubmission }) {
    const { toast } = useToast();
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: value }));
    };

    const handleSubmit = async () => {
        const submission = {
            assignmentId: assignment.id,
            studentId: studentId,
            submittedAt: serverTimestamp(),
            answers: assignment.questions.map((q, i) => ({
                questionText: q.text,
                answer: answers[i] || ""
            })),
            graded: false,
        };

        try {
            await addDoc(collection(db, "submissions"), submission);
            toast({ title: "Success", description: "Your assignment has been submitted." });
            onSubmission(assignment.id);
        } catch (error) {
            console.error("Error submitting assignment: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your assignment." });
        }
    };

    const allQuestionsAnswered = assignment.questions.every((_, i) => answers[i] && answers[i].trim() !== "");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{assignment.assignmentName}</CardTitle>
                <CardDescription>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {assignment.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded-lg">
                        <Label className="font-semibold">Question {qIndex + 1}: {q.text}</Label>
                        {q.type === 'mcq' ? (
                            <RadioGroup onValueChange={(value) => handleAnswerChange(qIndex, value)} className="mt-2 space-y-2">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt} id={`q${qIndex}-opt${oIndex}`} />
                                        <Label htmlFor={`q${qIndex}-opt${oIndex}`}>{opt}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <Textarea
                                className="mt-2"
                                placeholder="Type your answer here..."
                                onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>Submit Assignment</Button>
            </CardFooter>
        </Card>
    )
}

export default function StudentAssignmentPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState({ upcoming: [], past: [] });
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignmentsAndSubmissions = async () => {
            if (!user || !user.enrollment_number) return;
            setLoading(true);

            try {
                // Fetch student's classes
                const studentClassesQuery = query(collection(db, "classes"), where("students", "array-contains", user.enrollment_number));
                const studentClassesSnapshot = await getDocs(studentClassesQuery);
                const studentClassIds = studentClassesSnapshot.docs.map(doc => doc.id);

                if (studentClassIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch assignments for those classes
                const assignmentsQuery = query(collection(db, "assignments"), where("classId", "in", studentClassIds));
                const assignmentsSnapshot = await getDocs(assignmentsQuery);
                const allAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch student's submissions
                const submissionsQuery = query(collection(db, "submissions"), where("studentId", "==", user.enrollment_number));
                const submissionsSnapshot = await getDocs(submissionsQuery);
                const submissionIds = submissionsSnapshot.docs.map(doc => doc.data().assignmentId);
                setSubmissions(submissionIds);

                // Categorize assignments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = [];
                const past = [];

                allAssignments.forEach(assignment => {
                    if (new Date(assignment.dueDate) >= today) {
                        upcoming.push(assignment);
                    } else {
                        past.push(assignment);
                    }
                });

                setAssignments({ upcoming, past });

            } catch (error) {
                console.error("Error fetching assignments:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch assignments." });
            } finally {
                setLoading(false);
            }
        };

        fetchAssignmentsAndSubmissions();
    }, [user, toast]);

    const handleSubmission = (submittedAssignmentId) => {
        setSubmissions([...submissions, submittedAssignmentId]);
    }

    if (loading) {
        return <div>Loading assignments...</div>;
    }

    const renderAssignmentList = (list) => {
        if (list.length === 0) {
            return <p className="text-muted-foreground p-4">No assignments here.</p>
        }
        return (
             <Accordion type="single" collapsible className="w-full space-y-4">
                {list.map(assignment => {
                    const isSubmitted = submissions.includes(assignment.id);
                    const isPastDue = new Date(assignment.dueDate) < new Date();
                    return (
                        <AccordionItem value={assignment.id} key={assignment.id}>
                            <AccordionTrigger disabled={isSubmitted || isPastDue} className="p-4 border rounded-lg hover:no-underline justify-between data-[disabled]:opacity-70 data-[disabled]:cursor-not-allowed">
                                <div className="flex flex-col text-left">
                                   <span className="font-semibold">{assignment.assignmentName}</span>
                                   <span className="text-sm text-muted-foreground">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                {isSubmitted && <Badge variant="secondary">Submitted</Badge>}
                                {!isSubmitted && isPastDue && <Badge variant="destructive">Past Due</Badge>}
                            </AccordionTrigger>
                            <AccordionContent className="mt-2">
                               <AssignmentView assignment={assignment} studentId={user.enrollment_number} onSubmission={handleSubmission} />
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Assignments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderAssignmentList(assignments.upcoming)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Past Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderAssignmentList(assignments.past)}
                </CardContent>
            </Card>
        </div>
    );
}
