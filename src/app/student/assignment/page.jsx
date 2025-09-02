"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function StudentAssignmentPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Assignments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for student assignment view.</p>
                </CardContent>
            </Card>
        </div>
    );
}
