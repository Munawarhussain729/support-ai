"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Mail,
  MessageSquare,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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

const statusConfig = {
  new: {
    label: "New",
    icon: Circle,
    iconColor: "text-blue-500",
    color: "bg-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    icon: Loader2,
    iconColor: "text-yellow-500",
    color: "bg-yellow-500",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    color: "bg-green-500",
  },
};

function ClientDashboardContent() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setEmail(user.email || "");
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!email.trim()) {
      setTickets([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/support?email=${encodeURIComponent(email)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError("Failed to load tickets. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    // Auto-fetch when email changes (with debounce)
    const timer = setTimeout(() => {
      if (email.trim()) {
        fetchTickets();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, fetchTickets]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${config.iconColor}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Support Tickets
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address to view your support tickets
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>View Your Tickets</CardTitle>
            <CardDescription>
              Enter the email address you used when submitting your support
              ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={fetchTickets}
                    disabled={loading || !email.trim()}
                  >
                    {loading ? "Loading..." : "Search"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading tickets...</p>
          </div>
        )}

        {!loading && email && tickets.length === 0 && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No tickets found for this email address.
              </p>
              <Link href="/support">
                <Button variant="outline" className="mt-4">
                  Submit a New Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Your Tickets ({tickets.length})
              </h2>
              <Link href="/support">
                <Button variant="outline">Submit New Ticket</Button>
              </Link>
            </div>

            {tickets.map((ticket) => {
              const screenshotUrls = JSON.parse(
                ticket.screenshotUrls || "[]",
              ) as string[];
              return (
                <Card
                  key={ticket.id}
                  className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-gray-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {ticket.category}
                          </CardTitle>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <CardDescription>
                          Ticket ID: {ticket.id}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(ticket.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Message
                        </p>
                        <p className="whitespace-pre-wrap">{ticket.message}</p>
                      </div>

                      {ticket.assignedTo && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Assigned To
                          </p>
                          <p>{ticket.assignedTo}</p>
                        </div>
                      )}

                      {ticket.videoUrl && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Video
                          </p>
                          <video
                            src={ticket.videoUrl}
                            controls
                            className="w-full rounded-md border max-w-2xl"
                          >
                            <track kind="captions" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {screenshotUrls.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" />
                            Screenshots ({screenshotUrls.length})
                          </p>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 max-w-2xl">
                            {screenshotUrls.map((url) => (
                              <Image
                                key={url}
                                src={url}
                                alt="Screenshot"
                                width={200}
                                height={128}
                                className="rounded-md border object-cover w-full h-32"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Link href={`/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
                            View Full Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
