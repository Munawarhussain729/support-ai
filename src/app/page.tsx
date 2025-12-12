"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Video,
  ImageIcon,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Edit,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import router from "next/router";

// --- Types ---
interface Comment {
  id: number;
  author: string;
  message: string;
  timestamp: string;
  isStaff: boolean;
}

interface Ticket {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  video_url: string | null;
  screenshot_urls: string[];
  assignee: string | null;
  comments: Comment[];
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

// --- Component ---
const page = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "create">(
    "dashboard",
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === "developer") {
        router.push("/developer");
      }
      setClientInfo({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
      });
    } else {
      router.push("/auth/login");
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
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getStatusIcon = (status: Ticket["status"]): React.ReactNode => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      in_progress: <RefreshCw className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      closed: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || icons.pending;
  };
  // --- Utility functions ---
  const getStatusColor = (status: Ticket["status"]): string => {
    const colors: Record<Ticket["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      in_progress: "bg-blue-100 text-blue-800 border-blue-300",
      resolved: "bg-green-100 text-green-800 border-green-300",
      closed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || colors.pending;
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

  const getPriorityColor = (priority: Ticket["priority"]): string => {
    const colors: Record<Ticket["priority"], string> = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    };
    return colors[priority] || colors.low;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleAddComment = (ticketId: string) => {
    if (!newComment.trim()) return;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              comments: [
                ...ticket.comments,
                {
                  id: ticket.comments.length + 1,
                  author: clientInfo.name,
                  message: newComment,
                  timestamp: new Date().toISOString(),
                  isStaff: false,
                },
              ],
            }
          : ticket,
      ),
    );

    setNewComment("");
  };

  const TicketStats = () => {
    const stats = {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "pending").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
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
          onClick={() => setSelectedTicket(ticket)}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
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
                    <span className="ml-1">
                      {ticket.status.replace("_", " ")}
                    </span>
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ticket.subject}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ticket.message}
                </p>
              </div>
              <div
                className={`text-sm font-medium ${getPriorityColor(ticket.priority)} ml-4`}
              >
                {ticket?.priority?.toUpperCase()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(ticket.createdAt)}
                </div>
                {ticket?.comments?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {ticket.comments.length} comments
                  </div>
                )}
                {ticket.video_url && (
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Video
                  </div>
                )}
                {ticket?.screenshot_urls?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {ticket?.screenshot_urls?.length} images
                  </div>
                )}
              </div>
              {ticket?.assignee && (
                <div className="text-xs text-gray-600">
                  Assigned to: {ticket?.assignee}
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
            onClick={() => setActiveView("create")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Ticket
          </Button>
        </div>
      )}
    </div>
  );

  const TicketDetail = ({ ticket }: { ticket: Ticket }) => (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Button
          onClick={() => setSelectedTicket(null)}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
        >
          ← Back to tickets
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-mono text-gray-600">
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
                <span className="ml-1">{ticket.status.replace("_", " ")}</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {formatDate(ticket.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {formatDate(ticket.updatedAt)}
              </div>
            </div>
          </div>
          <div
            className={`text-sm font-bold ${getPriorityColor(ticket.priority)}`}
          >
            {ticket?.priority?.toUpperCase()} PRIORITY
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{ticket.message}</p>
        </div>

        {/* Attachments */}
        {(ticket?.video_url || ticket?.screenshot_urls?.length > 0) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Attachments
            </h3>

            {ticket?.video_url && (
              <div className="mb-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Video className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Video Recording
                    </p>
                    <p className="text-xs text-gray-600">Click to view</p>
                  </div>
                  <a
                    href={ticket?.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}

            {ticket?.screenshot_urls?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ticket?.screenshot_urls?.map((url: string) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-blue-400 transition-colors group"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignee */}
        {ticket?.assignee && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Assigned to:</span>{" "}
              {ticket?.assignee}
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comments ({ticket?.comments?.length})
          </h3>

          <div className="space-y-4 mb-6">
            {ticket?.comments?.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg ${
                  comment.isStaff
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {comment.author}
                    {comment.isStaff && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Staff
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.timestamp)}
                  </p>
                </div>
                <p className="text-gray-700">{comment.message}</p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={() => handleAddComment(ticket.id)}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                onClick={() => setActiveView("create")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedTicket ? (
          <TicketDetail ticket={selectedTicket} />
        ) : (
          <>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
          </>
        )}
      </div>
    </div>
  );
};

export default page;
