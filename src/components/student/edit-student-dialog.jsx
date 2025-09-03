
"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../../hooks/use-toast";

export default function EditStudentDialog({ student, onStudentUpdated, children }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (open && student) {
            // Merge top-level fields and the nested 'details' object
            const initialData = {
                ...(student.details || {}), // Start with everything in details
                name: student.name,
                email: student.email,
                phone: student.phone,
                dob: student.dob,
                gender: student.gender,
                program: student.program,
                admissionYear: student.admissionYear,
                tenthBoard: student.tenthBoard,
                tenthPercentage: student.tenthPercentage,
                twelfthBoard: student.twelfthBoard,
                twelfthPercentage: student.twelfthPercentage,
                permanentAddress: student.permanentAddress,
                fatherName: student.fatherName,
                fatherMobile: student.fatherMobile,
                motherName: student.motherName,
                bloodGroup: student.bloodGroup,
                aadhar: student.aadhar,
            };
            setFormData(initialData);
        }
    }, [open, student]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        // Extract top-level fields for the main document
        const {
            name, email, phone, dob, gender, program, admissionYear,
            tenthBoard, tenthPercentage, twelfthBoard, twelfthPercentage,
            permanentAddress, fatherName, fatherMobile, motherName,
            bloodGroup, aadhar,
            ...otherDetails
        } = formData;

        const updatedStudentData = {
            ...student,
            name, email, phone, dob, gender, program, department: program, admissionYear,
            tenthBoard, tenthPercentage, twelfthBoard, twelfthPercentage,
            permanentAddress, fatherName, fatherMobile, motherName,
            bloodGroup, aadhar,
            // Keep all other fields in the details object
            details: {
                ...student.details,
                ...otherDetails,
                 // Also ensure the main fields are consistent in `details`
                name, email, phone, dob, gender, program, admissionYear,
                tenthBoard, tenthPercentage, twelfthBoard, twelfthPercentage,
                permanentAddress, fatherName, fatherMobile, motherName,
                bloodGroup, aadhar,
            },
        };
        
        try {
            // Find the student document by their email to get the correct doc ID
            const docId = student.email.replace(/[^a-zA-Z0-9]/g, "");
            const studentRef = doc(db, "users", docId);
            await updateDoc(studentRef, updatedStudentData);
            
            onStudentUpdated(updatedStudentData);
            toast({ title: "Success", description: "Your details have been updated." });
            setOpen(false);
        } catch (error) {
            console.error("Error updating student details: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update your details." });
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
        { id: 'name', label: 'Full Name' },
        { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { id: 'dob', label: 'Date of Birth', type: 'date' },
        { id: 'bloodGroup', label: 'Blood Group' },
        { id: 'aadhar', label: 'Aadhar Card No.' },
    ];

    const contactFields = [
        { id: 'phone', label: 'Mobile' },
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
                    <DialogTitle>Edit My Profile</DialogTitle>
                    <DialogDescription>
                        Update your details below. Click save when you're done.
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
