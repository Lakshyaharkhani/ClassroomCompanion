
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PlusCircle, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { useToast } from "../../../hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import { createStaffUser } from "../../actions";


function AddStaffDialog({ onStaffAdded }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.staffName || !formData.email || !formData.password || !formData.department || !formData.designation) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
            return;
        }

        const result = await createStaffUser(formData);

        if (result.success) {
            onStaffAdded(result.newUser);
            toast({ title: "Success", description: result.message });
            setOpen(false);
            setFormData({}); // Reset form
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" /> Add New Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new staff member. An authentication account will be created.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="staffName">Full Name</Label>
                        <Input id="staffName" value={formData.staffName || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={formData.password || ''} onChange={handleInputChange} placeholder="Min. 6 characters" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" value={formData.department || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" value={formData.designation || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={formData.phone || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="joiningDate">Joining Date</Label>
                        <Input id="joiningDate" type="date" value={formData.joiningDate || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Create Staff Member</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function StaffManagementPage() {
    const { toast } = useToast();
    const [allStaff, setAllStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "staff"));
                const querySnapshot = await getDocs(q);
                const staffData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllStaff(staffData);
                setFilteredStaff(staffData);
            } catch (error) {
                console.error("Error fetching staff: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch staff from the database." });
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [toast]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = allStaff.filter(item => {
            return (
                item.name?.toLowerCase().includes(lowercasedFilter) ||
                item.email?.toLowerCase().includes(lowercasedFilter) ||
                item.staff_id?.toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredStaff(filtered);
    }, [searchTerm, allStaff]);

    const handleAddStaff = (newStaff) => {
        setAllStaff([...allStaff, newStaff]);
    };

    const handleDeleteStaff = async (staffDocId) => {
        try {
            await deleteDoc(doc(db, "users", staffDocId));
            setAllStaff(allStaff.filter(s => s.id !== staffDocId));
            toast({ title: "Success", description: "Staff member has been deleted." });
        } catch (error) {
            console.error("Error deleting staff: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete staff member." });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading staff data...</p></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <AddStaffDialog onStaffAdded={handleAddStaff} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Staff Members</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or staff ID..."
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
                                <TableHead>Staff ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="6" className="text-center h-24">
                                        {searchTerm ? "No staff match your search." : "No staff found."}
                                    </TableCell>
                                </TableRow>
                            ) : filteredStaff.map((staff) => (
                                <TableRow key={staff.id}>
                                    <TableCell>{staff.staff_id}</TableCell>
                                    <TableCell className="font-medium">{staff.name}</TableCell>
                                    <TableCell>{staff.email}</TableCell>
                                    <TableCell>{staff.department}</TableCell>
                                    <TableCell>{staff.designation}</TableCell>
                                    <TableCell className="text-right">
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
                                                        This action cannot be undone. This will permanently delete the staff member's record. Authentication credentials will remain but will not be associated with a staff profile.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteStaff(staff.id)}>Continue</AlertDialogAction>
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
