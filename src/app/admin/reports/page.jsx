"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

// This is a placeholder for the Reports page.
// In the next steps, we will implement the full functionality.

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Placeholder for viewing and generating reports.</p>
        </CardContent>
      </Card>
    </div>
  );
}
