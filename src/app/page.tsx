"use client";
import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Video,
  ImageIcon,
  Calendar,
  FileText,
  RefreshCw,
  LayoutDashboard,
  User,
  Plus,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useTranslations } from "next-intl";
import TicketStats from "@/components/ticketStats";
import TicketList from "@/components/ticketList";
import DashboardHeader from "@/components/Header";

// --- Types ---
export interface Ticket {
  id: string;
  category: string;
  message: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  videoUrl?: string;
  screenshotUrls: string;
  assignedTo?: string;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

// --- Component ---
function ClientDashboard() {

  const t = useTranslations();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setClientInfo({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
      });
    }
  }, []);

  // --- Mock data ---
  useEffect(() => {
    const fetchTickets = async () => {
      const response = await fetch(
        `/api/support?email=${encodeURIComponent(clientInfo.email)}`,
      );
      const data = await response.json();
      setTickets(data);
      setFilteredTickets(data);
    };
    if (clientInfo.email) {
      fetchTickets();
    }
  }, [clientInfo.email]);

  // --- Filtering ---
  useEffect(() => {
    let filtered = tickets;

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.category === filterCategory,
      );
    }

    setFilteredTickets(filtered);
  }, [searchQuery, filterStatus, filterCategory, tickets]);
 



  return (
    // biome-ignore lint/correctness/noUnusedVariables: bg-linear-to-br is correct Tailwind syntax
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TicketStats tickets={tickets||[]} />
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("tickets.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              {t("common.filter")}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("tickets.status")}
                    </Label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">{t("tickets.allStatuses")}</option>
                      <option value="new">{t("tickets.new")}</option>
                      <option value="in-progress">{t("dashboard.inProgress")}</option>
                      <option value="done">{t("tickets.done")}</option>
                      <option value="pending">{t("dashboard.pending")}</option>
                      <option value="in_progress">{t("dashboard.inProgress")}</option>
                      <option value="resolved">{t("dashboard.resolved")}</option>
                      <option value="closed">{t("tickets.closed")}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("tickets.category")}
                    </Label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">{t("tickets.allCategories")}</option>
                      <option value="bug">{t("tickets.bug")}</option>
                      <option value="feature">{t("tickets.feature")}</option>
                      <option value="question">{t("tickets.question")}</option>
                      <option value="suggestion">{t("tickets.suggestion")}</option>
                      <option value="other">{t("tickets.other")}</option>
                    </select>
                  </div>
            </div>
          )}
        </div>

        {/* Tickets List */}
        <TicketList tickets={filteredTickets||[]} />
      </div>
    </div>
  );
}

const page = () => {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientDashboard />
    </ProtectedRoute>
  );
};

export default page;
