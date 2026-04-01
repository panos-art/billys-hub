import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Στατιστικά επισκεψιμότητας και συμπεριφοράς χρηστών
        </p>
      </div>

      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="py-16 text-center">
          <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Σύντομα Διαθέσιμο
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Σύνδεση με Google Analytics 4 για προβολή sessions, χρηστών,
            bounce rate, δημοφιλών σελίδων και πολλά ακόμα.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400">Google Analytics 4</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
