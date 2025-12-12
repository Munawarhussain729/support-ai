"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Circle,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  MessageSquare,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  category: string;
  message: string;
  videoUrl?: string;
  screenshotUrls: string;
  status: string;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
};

const statusColumns = [
  {
    id: "new",
    title: "New",
    icon: Circle,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: Loader2,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    id: "done",
    title: "Done",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    id: "blocked",
    title: "Blocked",
    icon: CheckCircle2,
    gradient: "from-gray-800 via-gray-900 to-black",
    shadow: "shadow-gray-800/20",
  },
];

function DeveloperDashboardContent() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(false);
    try {
      const res = await fetch("/api/support");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicketStatus = useCallback(
    async (ticketId: string, newStatus: string, assignedTo?: string) => {
      setUpdating(ticketId);
      try {
        const res = await fetch("/api/support", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: ticketId,
            status: newStatus,
            assignedTo: assignedTo || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to update ticket");
        await fetchTickets();
      } catch (err) {
        console.error("Error updating ticket:", err);
      } finally {
        setUpdating(null);
      }
    },
    [fetchTickets],
  );

  // useEffect(() => {
  //   fetchTickets();
  //   const interval = setInterval(fetchTickets, 30000);
  //   return () => clearInterval(interval);
  // }, [fetchTickets]);

  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedTicket) {
      updateTicketStatus(draggedTicket, targetStatus);
      setDraggedTicket(null);
    }
    setHoveredColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
    setHoveredColumn(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };
  const getTicketsByStatus = (status: string) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="relative h-12 w-12 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 lg:p-6">
      <div>
        {/* Header with Stats */}
        <div className="mb-2 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 ">
                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Developer Dashboard
                </h1>
              </div>
              <p className="text-slate-600 ml-14">
                Manage and track all support tickets with ease
              </p>
            </div>
          <div className="flex flex-col items-center gap-2">
          <Button
              onClick={fetchTickets}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition-all duration-200"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>  <Button
              onClick={handleLogout}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition-all duration-200"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid  lg:grid-cols-4 gap-6">
            {statusColumns.map((column) => {
              const columnTickets = getTicketsByStatus(column.id);
              const Icon = column.icon;
              const isHovered = hoveredColumn === column.id && draggedTicket;

              return (
                <section
                  key={column.id}
                  aria-label={`${column.title} tickets column`}
                  className="flex flex-col"
                  onDragOver={(e) => {
                    handleDragOver(e);
                    setHoveredColumn(column.id);
                  }}
                  onDragLeave={() => setHoveredColumn(null)}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div
                    className={`bg-linear-to-r ${column.gradient} rounded-xl p-2 text-white shadow-lg ${column.shadow} transition-all duration-300 ${isHovered ? "scale-105 shadow-2xl" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <Icon
                            className={`h-5 w-5 ${column.id === "in-progress" ? "animate-spin" : ""}`}
                          />
                        </div>
                        <h2 className="font-bold text-lg">{column.title}</h2>
                      </div>
                      <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 font-semibold px-3 py-1">
                        {columnTickets.length}
                      </Badge>
                    </div>
                  </div>

                  <div
                    className={`flex-1 bg-white/60 backdrop-blur-sm rounded-b-xl p-4 space-y-4 min-h-[400px] max-h-[calc(100vh-200px)] overflow-y-auto transition-all duration-300 ${isHovered ? "bg-white/80 ring-2 ring-blue-400" : ""}`}
                  >
                    {columnTickets.length === 0 ? (
                      <div className="text-center text-slate-400 py-12">
                        <div className="mb-3 flex justify-center">
                          <div className="p-4 bg-slate-100 rounded-full">
                            <MessageSquare className="h-8 w-8" />
                          </div>
                        </div>
                        <p className="text-sm font-medium">No tickets here</p>
                        <p className="text-xs mt-1">
                          Drag tickets to this column
                        </p>
                      </div>
                    ) : (
                      columnTickets.map((ticket) => {
                        const screenshotUrls = JSON.parse(
                          ticket.screenshotUrls || "[]",
                        ) as string[];
                        const isDragging = draggedTicket === ticket.id;
                        const isUpdating = updating === ticket.id;

                        return (
                          <div
                            key={ticket.id}
                            draggable
                            onDragStart={() => handleDragStart(ticket.id)}
                            onDragEnd={handleDragEnd}
                            className={`cursor-move transition-all duration-300 ${
                              isDragging
                                ? "opacity-30 scale-95 rotate-3"
                                : "hover:scale-[1.02] hover:-translate-y-1"
                            } ${isUpdating ? "opacity-75" : ""}`}
                          >
                            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
                              <div
                                className={`h-1 bg-linear-to-r ${column.gradient}`}
                              ></div>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base flex justify-between capitalize truncate font-semibold text-slate-900">
                                      <div>
                                        <p>
                                          {ticket.category}{" "}
                                          <span>#{ticket.id.slice(0, 8)}</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                          <Clock className="h-3.5 w-3.5" />
                                          <span>
                                            {formatDate(ticket.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-sm">
                                          <div className="p-1.5 bg-blue-50 rounded-md">
                                            <User className="h-3.5 w-3.5 text-blue-600" />
                                          </div>
                                          <span className="truncate text-slate-700 font-medium">
                                            {ticket.clientName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <div className="p-1.5 bg-purple-50 rounded-md">
                                            <Mail className="h-3.5 w-3.5 text-purple-600" />
                                          </div>
                                          <span className="truncate text-slate-600 text-xs">
                                            {ticket.clientEmail}
                                          </span>
                                        </div>
                                        {ticket.assignedTo && (
                                          <div className="flex items-center gap-2">
                                            <Badge className="bg-linear-to-r from-indigo-500 to-purple-500 text-white border-0 text-xs">
                                              👤 {ticket.assignedTo}
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 font-mono text-slate-500"></CardDescription>
                                  </div>
                                  {isUpdating && (
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm line-clamp-3 text-slate-700">
                                    {ticket.message}
                                  </p>
                                </div>

                                {(ticket.videoUrl ||
                                  screenshotUrls.length > 0) && (
                                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
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
                                )}

                                <div className="flex gap-2 pt-2">
                                  {ticket.status === "new" && (
                                    <Button
                                      size="sm"
                                      className="flex-1 text-xs bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-sm"
                                      onClick={() =>
                                        updateTicketStatus(
                                          ticket.id,
                                          "in-progress",
                                          "Developer",
                                        )
                                      }
                                      disabled={isUpdating}
                                    >
                                      Claim Ticket
                                    </Button>
                                  )}
                                  {ticket.status === "in-progress" && (
                                    <Button
                                      size="sm"
                                      className="flex-1 text-xs bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-sm"
                                      onClick={() =>
                                        updateTicketStatus(ticket.id, "done")
                                      }
                                      disabled={isUpdating}
                                    >
                                      ✓ Complete
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs hover:bg-slate-100 text-slate-700 font-medium"
                                    onClick={() => {
                                      window.location.href = `/tickets/${ticket.id}`;
                                    }}
                                  >
                                    View →
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {tickets.length === 0 && (
          <Card className="mt-8 border-0 shadow-xl bg-linear-to-br from-white to-slate-50">
            <CardContent className="py-16 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-6 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <MessageSquare className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No tickets yet
              </h3>
              <p className="text-slate-600">
                All clear! No support tickets to display.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function DeveloperDashboard() {
  return <DeveloperDashboardContent />;
}
