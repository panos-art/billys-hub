import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Διαφημίσεων</h1>
        <p className="text-sm text-gray-500 mt-1">
          Παρακολούθηση διαφημιστικής δαπάνης και απόδοσης
        </p>
      </div>

      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="py-16 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Σύντομα Διαθέσιμο
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Το dashboard διαφημίσεων θα εμφανίζει δεδομένα από Meta Ads, Google Ads
            και TikTok Ads. Συνδέστε τους λογαριασμούς σας για να ξεκινήσετε.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400">Meta Ads</div>
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400">Google Ads</div>
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-400">TikTok Ads</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
