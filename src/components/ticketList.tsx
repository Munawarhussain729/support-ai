import { Ticket } from "@/app/page";
import { Calendar, CheckCircle, Clock, FileText, ImageIcon, RefreshCw, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

interface TicketListProps {
tickets: Ticket[];
}
function TicketList({ tickets }: TicketListProps) {
    const t = useTranslations();
    const router = useRouter();


  const getStatusIcon = (status: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      new: <Clock className="w-4 h-4" />,
      "in-progress": <RefreshCw className="w-4 h-4" />,
      done: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      in_progress: <RefreshCw className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      closed: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || icons.new || <Clock className="w-4 h-4" />;
  };
  // --- Utility functions ---
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
      done: "bg-green-100 text-green-800 border-green-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      in_progress: "bg-blue-100 text-blue-800 border-blue-300",
      resolved: "bg-green-100 text-green-800 border-green-300",
      closed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      colors[status] ||
      colors.new ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const getCategoryColor = (category: Ticket["category"]): string => {
    const colors: Record<Ticket["category"] | "other", string> = {
      bug: "bg-red-100 text-red-800",
      feature: "bg-blue-100 text-blue-800",
      question: "bg-green-100 text-green-800",
      suggestion: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const formatDate = (timestamp: string | number): string => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp); 
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
  
    return date.toLocaleDateString();
  };
  
    return (
        <div className="space-y-2 flex flex-wrap justify-center gap-2">
        {tickets.map((ticket) => {
             const screenshotUrls = JSON.parse(
                ticket.screenshotUrls || "[]",
              ) as string[];
            return(
                <button
                type="button"
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border w-[300px] border-gray-200 hover:border-blue-400  hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-3 mb-2">
                        <p className="text-sm font-mono text-gray-500">
                          {ticket.id?.slice(0, 6)}...{ticket.id?.slice(-4)}
                        </p>
                     
                        <div
                          className={`px-3 py-1 flex items-center rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}
                        >
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">
                            {ticket.status.replace("_", " ").replace("-", " ")}
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-2 capitalize ${getCategoryColor(ticket?.category)}`}>
                        {ticket.category}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {ticket.message}
                      </p>
                    </div>
                  </div>
      
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(ticket.createdAt)}
                      </div>
                      {ticket.videoUrl && (
                            <Badge className="bg-linear-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                            🎥 Video
                            </Badge>
                        )}
                      {screenshotUrls.length > 0 && (
                            <Badge className="bg-linear-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs">
                            🖼️ {screenshotUrls.length} Image
                            {screenshotUrls.length > 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>
                    {ticket?.assignedTo && (
                      <div className="text-xs text-gray-600">
                        Assigned to: {ticket?.assignedTo}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
        })}
  
        {tickets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("dashboard.noTickets")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("dashboard.tryAdjusting")}
            </p>
            <Button
              onClick={() => router.push("/support")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t("dashboard.createNewTicket")}
            </Button>
          </div>
        )}
      </div>
    );
  };


export default TicketList