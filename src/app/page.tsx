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

// --- Types ---
interface Ticket {
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
  const router = useRouter();
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

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const TicketStats = () => {
    const stats = {
      total: tickets?.length,
      pending: tickets?.filter(
        (t) => t.status === "new" || t.status === "pending",
      ).length,
      in_progress: tickets?.filter(
        (t) => t.status === "in-progress" || t.status === "in_progress",
      ).length,
      resolved: tickets?.filter(
        (t) => t.status === "done" || t.status === "resolved",
      ).length,
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
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
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
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
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
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

  const TicketList = () => (
    <div className="space-y-4">
      {filteredTickets.map((ticket) => (
        <button
          type="button"
          key={ticket.id}
          onClick={() => router.push(`/tickets/${ticket.id}`)}
          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-400 transform hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-500">
                    {ticket.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}
                  >
                    {ticket.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}
                  >
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1 capitalize">
                      {ticket.status.replace("_", " ").replace("-", " ")}
                    </span>
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
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
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Video
                  </div>
                )}
                {(() => {
                  try {
                    const screenshots = JSON.parse(
                      ticket.screenshotUrls || "[]",
                    );
                    return screenshots.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {screenshots.length} images
                      </div>
                    ) : null;
                  } catch {
                    return null;
                  }
                })()}
              </div>
              {ticket?.assignedTo && (
                <div className="text-xs text-gray-600">
                  Assigned to: {ticket?.assignedTo}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}

      {filteredTickets.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
          <Button
            onClick={() => router.push("/support")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Ticket
          </Button>
        </div>
      )}
    </div>
  );

  const handleAddNew = () => {
    router.push("/support");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };
  return (
    // biome-ignore lint/correctness/noUnusedVariables: bg-linear-to-br is correct Tailwind syntax
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Autofixia Support
                </h1>
                <p className="text-sm text-gray-600">Client Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {clientInfo.name}
              </div>
              <Button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Ticket
              </Button>
              <Button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <TicketStats />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets by ID, subject, or description..."
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
              Filters
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
                  Status
                </Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="question">Question</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tickets List */}
        <TicketList />
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
