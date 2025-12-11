import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function TicketSubmittedPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
            <h1 className="text-2xl font-bold text-destructive">
              Ticket Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              The ticket you're looking for doesn't exist.
            </p>
            <Link href="/support">
              <Button className="mt-4">Submit New Ticket</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const screenshotUrls = JSON.parse(ticket.screenshotUrls || "[]") as string[];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
              Ticket Submitted Successfully!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your support ticket has been created and we'll get back to you
              soon.
            </p>
          </div>

          <div className="mt-8 space-y-6 border-t pt-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground">
                Ticket ID
              </h2>
              <p className="mt-1 text-lg font-mono text-card-foreground">
                {ticket.id}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Name
                </h2>
                <p className="mt-1 text-card-foreground">{ticket.clientName}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Email
                </h2>
                <p className="mt-1 text-card-foreground">{ticket.clientEmail}</p>
              </div>
              {ticket.clientPhone && (
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Phone
                  </h2>
                  <p className="mt-1 text-card-foreground">
                    {ticket.clientPhone}
                  </p>
                </div>
              )}
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Category
                </h2>
                <p className="mt-1 capitalize text-card-foreground">
                  {ticket.category}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground">
                Message
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-card-foreground">
                {ticket.message}
              </p>
            </div>

            {ticket.videoUrl && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                  Video
                </h2>
                <video
                  src={ticket.videoUrl}
                  controls
                  className="w-full rounded-md border"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {screenshotUrls.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                  Screenshots ({screenshotUrls.length})
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {screenshotUrls.map((url) => (
                    <Image
                      key={url}
                      src={url}
                      alt={`Screenshot ${url}`}
                      width={200}
                      height={128}
                      className="rounded-md border object-cover w-full h-32"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/support" className="flex-1">
                <Button variant="outline" className="w-full">
                  Submit Another Ticket
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

