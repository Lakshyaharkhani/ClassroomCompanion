
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { createStaffUser } from "../../actions";


function AddStaffDialog({ onStaffAdded }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState("password123");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSubmit = async () => {
    if (!formData.email || !password) {
        toast({ variant: "destructive", title: "Error", description: "Email and password are required." });
        return;
    }
    const result = await createStaffUser({ ...formData, password });
    if (result.success) {
        onStaffAdded(result.newUser);
        toast({ title: "Success", description: result.message });
        setOpen(false);
        setFormData({});
        setPassword("password123");
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const renderFields = (fields) => {
    return fields.map(field => (
        <div className="grid grid-cols-4 items-center gap-4" key={field.id}>
            <Label htmlFor={field.id} className="text-right text-sm">
                {field.label}
            </Label>
            {field.type === 'select' ? (
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} defaultValue={formData[field.id]}>
                    <SelectTrigger className="col-span-3 h-8">
                        <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ) : (
                <Input id={field.id} type={field.type || 'text'} value={formData[field.id] || ''} onChange={handleInputChange} className="col-span-3 h-8" placeholder={field.placeholder} />
            )}
        </div>
    ));
  }
  
  const personalFields = [
      { id: 'title', label: 'Title', type: 'select', options: ['Dr.', 'Prof.', 'Mr.', 'Ms.'] },
      { id: 'staffName', label: 'Full Name', placeholder: 'e.g., Dr. Ian Malcolm' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { id: 'dob', label: 'Date of Birth', type: 'date' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'e.g., ian.m@example.com' },
      { id: 'phone', label: 'Phone Number', placeholder: 'e.g., 123-456-7890' },
  ];

  const professionalFields = [
      { id: 'department', label: 'Department', placeholder: 'e.g., Mathematics' },
      { id: 'designation', label: 'Designation', placeholder: 'e.g., Head of Department' },
      { id: 'joiningDate', label: 'Date of Joining', type: 'date' },
      { id: 'qualification', label: 'Highest Qualification', placeholder: 'e.g., Ph.D. in Mathematics' },
  ];

  const contactFields = [
      { id: 'address', label: 'Permanent Address' },
      { id: 'city', label: 'City' },
      { id: 'state', label: 'State' },
      { id: 'pincode', label: 'Pincode' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add New Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new staff member. An account will be created in Firebase Authentication with the specified password.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-6">
            <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
                <Card>
                    <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(personalFields)}</CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="professional">
                 <Card>
                    <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(professionalFields)}</CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="contact">
                 <Card>
                    <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">{renderFields(contactFields)}</CardContent>
                </Card>
            </TabsContent>
            </Tabs>
             <div className="p-4 space-y-2 border-t mt-4">
                <Label htmlFor="password">Set Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground">Set an initial password for the new staff member.</p>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save New Staff</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStaffDialog({ staffToEdit, onStaffUpdated, children }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // This combines the top-level fields and the `details` object into one flat object for the form
    const initialData = {
      ...(staffToEdit.details || {}),
      staffName: staffToEdit.name,
      email: staffToEdit.email,
      department: staffToEdit.department,
      designation: staffToEdit.designation,
      phone: staffToEdit.phone,
      joiningDate: staffToEdit.joining_date,
      qualification: staffToEdit.qualification,
      gender: staffToEdit.gender,
      dob: staffToEdit.dob,
    };
    setFormData(initialData);
  }, [staffToEdit]);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSubmit = async () => {
    // Reconstruct the object to be saved in Firestore
    const updatedStaffData = {
      ...staffToEdit,
      name: formData.staffName,
      email: formData.email, // Note: email is not editable to maintain consistency with Firebase Auth
      department: formData.department,
      designation: formData.designation,
      phone: formData.phone,
      joining_date: formData.joiningDate,
      qualification: formData.qualification,
      gender: formData.gender,
      dob: formData.dob,
      details: {
        ...formData,
      },
    };

    try {
      const staffRef = doc(db, "users", staffToEdit.id);
      await updateDoc(staffRef, updatedStaffData);
      onStaffUpdated(updatedStaffData);
      toast({ title: "Success", description: "Staff details have been updated." });
      setOpen(false);
    } catch (error) {
      console.error("Error updating staff: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update staff details." });
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
                <Input id={field.id} type={field.type || 'text'} value={data[field.id] || ''} onChange={handleInputChange} className="col-span-3 h-8" placeholder={field.placeholder} disabled={field.disabled} />
            )}
        </div>
    ));
  }

  const personalFields = [
      { id: 'title', label: 'Title', type: 'select', options: ['Dr.', 'Prof.', 'Mr.', 'Ms.'] },
      { id: 'staffName', label: 'Full Name', placeholder: 'e.g., Dr. Ian Malcolm' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { id: 'dob', label: 'Date of Birth', type: 'date' },
      { id: 'email', label: 'Email', type: 'email', disabled: true },
      { id: 'phone', label: 'Phone Number', placeholder: 'e.g., 123-456-7890' },
  ];

  const professionalFields = [
      { id: 'department', label: 'Department', placeholder: 'e.g., Mathematics' },
      { id: 'designation', label: 'Designation', placeholder: 'e.g., Head of Department' },
      { id: 'joiningDate', label: 'Date of Joining', type: 'date' },
      { id: 'qualification', label: 'Highest Qualification', placeholder: 'e.g., Ph.D. in Mathematics' },
  ];

  const contactFields = [
      { id: 'address', label: 'Permanent Address' },
      { id: 'city', label: 'City' },
      { id: 'state', label: 'State' },
      { id: 'pincode', label: 'Pincode' },
  ];


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Staff: {staffToEdit.name}</DialogTitle>
          <DialogDescription>
            Update the staff member's details. The email address cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(personalFields, formData)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="professional">
              <Card><CardHeader><CardTitle>Professional Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(professionalFields, formData)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="contact">
              <Card><CardHeader><CardTitle>Contact Information</CardTitle></CardHeader><CardContent className="space-y-4">{renderFields(contactFields, formData)}</CardContent></Card>
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


export default function StaffManagementPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "staff"));
            const querySnapshot = await getDocs(q);
            const staffData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStaff(staffData);
        } catch(error) {
            console.error("Error fetching staff: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch staff from the database." });
        } finally {
            setLoading(false);
        }
    };
    fetchStaff();
  }, [toast]);


  const handleAddStaff = (newStaff) => {
    setStaff([...staff, newStaff]);
  };

  const handleUpdateStaff = (updatedStaff) => {
    const updatedList = staff.map(s => s.id === updatedStaff.id ? updatedStaff : s);
    setStaff(updatedList);
  };

  const handleDeleteStaff = async (staffDocId) => {
    try {
        await deleteDoc(doc(db, "users", staffDocId));
        setStaff(staff.filter(s => s.id !== staffDocId));
        toast({ title: "Success", description: "Staff member has been deleted." });
    } catch (error) {
        console.error("Error deleting staff: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete staff member." });
    }
  }

  if (loading) {
      return <div className="flex justify-center items-center h-full"><p>Loading staff...</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <AddStaffDialog onStaffAdded={handleAddStaff} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan="6" className="text-center h-24">No staff found in the database.</TableCell>
                </TableRow>
              ) : staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.staff_id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.assigned_classes?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <EditStaffDialog staffToEdit={s} onStaffUpdated={handleUpdateStaff}>
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </EditStaffDialog>
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
                                This action cannot be undone. This will permanently delete the staff member's record. Associated Firebase Auth user must be deleted manually.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStaff(s.id)}>Continue</AlertDialogAction>
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
