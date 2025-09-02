"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function ExamSchedulePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Exam Schedule</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Exams</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for exam schedule view.</p>
                </CardContent>
            </Card>
        </div>
    );
}
