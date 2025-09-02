"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function ResultPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Exam Result</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for exam results view.</p>
                </CardContent>
            </Card>
        </div>
    );
}
