import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Προσφορές</h1>
        <p className="text-sm text-gray-500 mt-1">
          Δημιουργία και διαχείριση προσφορών πελατών
        </p>
      </div>

      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Σύντομα Διαθέσιμο
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Δημιουργήστε επαγγελματικές προσφορές με templates, μοναδικά links
            και αυτόματη παραγωγή PDF. Παρακολουθήστε πότε ο πελάτης βλέπει
            την προσφορά σας.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
