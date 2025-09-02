"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function AdmitCardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admit Card</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Admit Card</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Placeholder for admit card view.</p>
                </CardContent>
            </Card>
        </div>
    );
}
