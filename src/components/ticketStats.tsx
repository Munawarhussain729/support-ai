import { Ticket } from "@/app/page";
import { CheckCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface TicketStatsProps {
tickets: Ticket[];
}
function TicketStats({ tickets }: TicketStatsProps) {
    const t = useTranslations();

    const stats = {
      total: tickets?.length,
      pending: tickets?.filter(
        (ticket) => ticket.status === "new" || ticket.status === "pending",
      ).length,
      in_progress: tickets?.filter(
        (ticket) => ticket.status === "in-progress" || ticket.status === "in_progress",
      ).length,
      resolved: tickets?.filter(
        (ticket) => ticket.status === "done" || ticket.status === "resolved",
      ).length,
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.totalTickets")}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.pending")}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.inProgress")}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.in_progress}
              </p>
            </div>
            <RefreshCw className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("dashboard.resolved")}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.resolved}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>
      </div>
    );
  };


export default TicketStats