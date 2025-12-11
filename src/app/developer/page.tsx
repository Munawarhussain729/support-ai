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
  Video,
  Image as ImageIcon,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  { id: "new", title: "New", icon: Circle, color: "bg-blue-500" },
  {
    id: "in-progress",
    title: "In Progress",
    icon: Loader2,
    color: "bg-yellow-500",
  },
  { id: "done", title: "Done", icon: CheckCircle2, color: "bg-green-500" },
];

export default function DeveloperDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchTickets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

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
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
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
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Developer Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage and track all support tickets
            </p>
          </div>
          <Button onClick={fetchTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {statusColumns.map((column) => {
            const columnTickets = getTicketsByStatus(column.id);
            const Icon = column.icon;

            return (
              <section
                key={column.id}
                aria-label={`${column.title} tickets column`}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className={`${column.color} rounded-t-lg p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h2 className="font-semibold text-lg">{column.title}</h2>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white"
                    >
                      {columnTickets.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 bg-muted/30 rounded-b-lg p-4 space-y-4 min-h-[400px] max-h-[calc(100vh-250px)] overflow-y-auto">
                  {columnTickets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="text-sm">No tickets in this column</p>
                    </div>
                  ) : (
                    columnTickets.map((ticket) => {
                      const screenshotUrls = JSON.parse(
                        ticket.screenshotUrls || "[]",
                      ) as string[];
                      const isDragging = draggedTicket === ticket.id;
                      const isUpdating = updating === ticket.id;

                      return (
                        <button
                          type="button"
                          key={ticket.id}
                          tabIndex={0}
                          draggable
                          onDragStart={() => handleDragStart(ticket.id)}
                          onDragEnd={handleDragEnd}
                          className={`cursor-move w-full transition-all ${
                            isDragging ? "opacity-50" : ""
                          } ${isUpdating ? "opacity-75" : ""}`}
                        >
                          <Card className="hover:shadow-md">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base capitalize truncate">
                                    {ticket.category}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    ID: {ticket.id.slice(0, 8)}...
                                  </CardDescription>
                                </div>
                                {isUpdating && (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <p className="text-sm line-clamp-3">
                                  {ticket.message}
                                </p>
                              </div>

                              <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">
                                    {ticket.clientName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">
                                    {ticket.clientEmail}
                                  </span>
                                </div>
                                {ticket.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Assigned: {ticket.assignedTo}
                                    </Badge>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(ticket.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-2 border-t">
                                {ticket.videoUrl && (
                                  <Badge variant="outline" className="text-xs">
                                    <Video className="h-3 w-3 mr-1" />
                                    Video
                                  </Badge>
                                )}
                                {screenshotUrls.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    {screenshotUrls.length} Screenshot
                                    {screenshotUrls.length > 1 ? "s" : ""}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex gap-2 pt-2">
                                {ticket.status === "new" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() =>
                                      updateTicketStatus(
                                        ticket.id,
                                        "in-progress",
                                        "Developer",
                                      )
                                    }
                                    disabled={isUpdating}
                                  >
                                    Claim
                                  </Button>
                                )}
                                {ticket.status === "in-progress" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() =>
                                      updateTicketStatus(ticket.id, "done")
                                    }
                                    disabled={isUpdating}
                                  >
                                    Mark Done
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs"
                                  onClick={() => {
                                    window.open(
                                      `/ticket-submitted/${ticket.id}`,
                                      "_blank",
                                    );
                                  }}
                                >
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {tickets.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tickets found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
