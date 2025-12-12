"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

import type { LucideIcon } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; icon: LucideIcon; color: string; bgColor: string }
> = {
  new: {
    label: "New",
    icon: Circle,
    color: "text-blue-600",
    bgColor: "bg-blue-100 border-blue-300",
  },
  "in-progress": {
    label: "In Progress",
    icon: Loader2,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 border-yellow-300",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 border-green-300",
  },
};

function TicketDetailContent() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.ticketId as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"client" | "developer" | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;

      setLoading(true);
      setError("");

      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        // Build API URL
        let apiUrl = `/api/support`;
        if (user?.role === "client") {
          apiUrl += `?email=${encodeURIComponent(user.email)}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch ticket");
        }

        const tickets: Ticket[] = await response.json();
        const foundTicket = tickets.find((t) => t.id === ticketId);

        if (!foundTicket) {
          setError("Ticket not found");
        } else {
          // Check if client is trying to access another client's ticket
          if (
            user?.role === "client" &&
            foundTicket.clientEmail !== user.email
          ) {
            setError("You don't have permission to view this ticket");
          } else {
            setTicket(foundTicket);
          }
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Failed to load ticket. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config =
      statusConfig[status] ||
      statusConfig.new;
    const Icon = config.icon;
    return (
      <Badge
        className={`flex items-center gap-2 px-3 py-1 ${config.bgColor} ${config.color} border`}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      // biome-ignore lint/correctness/noUnusedVariables: bg-gradient-to-br is correct Tailwind syntax
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      // biome-ignore lint/correctness/noUnusedVariables: bg-gradient-to-br is correct Tailwind syntax
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Ticket Not Found"}
            </h1>
            <p className="text-gray-600 mb-6">
              {error ||
                "The ticket you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
              <Link href={userRole === "developer" ? "/developer" : "/"}>
                <Button className="flex-1">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const screenshotUrls = JSON.parse(ticket.screenshotUrls || "[]") as string[];
  const statusBadge = getStatusBadge(ticket.status);

  return (
    // biome-ignore lint/correctness/noUnusedVariables: bg-gradient-to-br is correct Tailwind syntax
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ticket Details
              </h1>
              <p className="text-gray-600 font-mono text-sm">{ticket.id}</p>
            </div>
            {statusBadge}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Ticket Info Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                  Ticket Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {ticket.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  </div>
                  {ticket.updatedAt !== ticket.createdAt && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(ticket.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {ticket.assignedTo && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="font-medium text-gray-900">
                          {ticket.assignedTo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                  Client Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {ticket.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {ticket.clientEmail}
                      </p>
                    </div>
                  </div>
                  {ticket.clientPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {ticket.clientPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Message
              </h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>
          </div>

          {/* Video Section */}
          {ticket.videoUrl && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Video Recording
                </h2>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <video
                  src={ticket.videoUrl}
                  controls
                  className="w-full h-auto max-h-[600px]"
                  preload="metadata"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Screenshots Section */}
          {screenshotUrls.length > 0 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Screenshots ({screenshotUrls.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {screenshotUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all cursor-pointer bg-gray-50"
                  >
                    <Image
                      src={url}
                      alt={`Screenshot ${index + 1} of ticket ${ticket.id}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["client", "developer"]}>
      <TicketDetailContent />
    </ProtectedRoute>
  );
}
