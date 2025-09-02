
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Users, UserPlus, BookCopy, Database, ShieldPlus, UserCog } from "lucide-react";
import { Button } from "../ui/button";
import { seedDatabase, createAdminUser } from "../../app/actions";
import { useToast } from "../../hooks/use-toast";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


function AddAdminDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all fields."});
            return;
        }
        setIsSubmitting(true);
        const result = await createAdminUser(formData);
        if (result.success) {
            toast({ title: "Success!", description: result.message });
            setFormData({ name: '', email: '', password: '' });
            setOpen(false);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsSubmitting(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserCog className="mr-2" />
                    Add New Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Administrator</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new admin user. They will be able to log in immediately.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Jane Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., jane.d@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Must be at least 6 characters" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Admin"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminDashboard({ user }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({ studentCount: 0, staffCount: 0, classCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
        const staffQuery = query(collection(db, "users"), where("role", "==", "staff"));
        const classesQuery = collection(db, "classes");

        const [studentSnapshot, staffSnapshot, classSnapshot] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(staffQuery),
          getDocs(classesQuery),
        ]);

        setStats({
          studentCount: studentSnapshot.size,
          staffCount: staffSnapshot.size,
          classCount: classSnapshot.size,
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load dashboard statistics."
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [toast]);


  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const result = await seedDatabase();
    if(result.success) {
        toast({
            title: "Success!",
            description: result.message
        });
        // Optionally, refetch stats after seeding
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message
        });
    }
    setIsSeeding(false);
  }
  
  const StatCard = ({ title, value, icon, description, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name}. Here you can manage the entire application.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
            title="Student Management"
            value={stats.studentCount}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Total students enrolled"
            loading={loadingStats}
        />
        <StatCard 
            title="Staff Management"
            value={stats.staffCount}
            icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
            description="Total staff members"
            loading={loadingStats}
        />
        <StatCard 
            title="Class Management"
            value={stats.classCount}
            icon={<BookCopy className="h-4 w-4 text-muted-foreground" />}
            description="Total classes running"
            loading={loadingStats}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><ShieldPlus/>Admin Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        Create new administrator accounts. Admins have full access to the system.
                    </p>
                    <AddAdminDialog/>
                </div>
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Database/>Database Seeding</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        Populate the database with initial sample data for students, staff, and classes.
                    </p>
                     <Button onClick={handleSeedDatabase} disabled={isSeeding} variant="secondary">
                        {isSeeding ? "Seeding..." : "Seed Database"}
                    </Button>
                </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
