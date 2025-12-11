import { NextResponse } from "next/server";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { desc, eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const clientName = formData.get("clientName") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const clientPhone = formData.get("clientPhone") as string;
    const category = formData.get("category") as string;
    const message = formData.get("message") as string;
    const videoFile = formData.get("video") as File | null;
    const screenshotFiles = formData.getAll("screenshots") as File[];

    // Handle file uploads
    const screenshotUrls: string[] = [];
    let videoUrl: string | null = null;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Upload video if provided
    if (videoFile && videoFile.size > 0) {
      const videoBytes = await videoFile.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const videoPath = join(uploadsDir, videoFileName);
      await writeFile(videoPath, videoBuffer);
      videoUrl = `/uploads/${videoFileName}`;
    }

    // Upload screenshots if provided
    if (screenshotFiles.length > 0) {
      for (const screenshotFile of screenshotFiles) {
        if (screenshotFile.size > 0) {
          const screenshotBytes = await screenshotFile.arrayBuffer();
          const screenshotBuffer = Buffer.from(screenshotBytes);
          const screenshotFileName = `${Date.now()}-${screenshotFile.name}`;
          const screenshotPath = join(uploadsDir, screenshotFileName);
          await writeFile(screenshotPath, screenshotBuffer);
          screenshotUrls.push(`/uploads/${screenshotFileName}`);
        }
      }
    }

    // Insert ticket into database
    const [newTicket] = await db
      .insert(tickets)
      .values({
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        category,
        message,
        videoUrl,
        screenshotUrls: JSON.stringify(screenshotUrls),
      })
      .returning();

    return NextResponse.json({ success: true, ticketId: newTicket.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = db.select().from(tickets);

    // If email is provided, filter by client email
    if (email) {
      query = query.where(eq(tickets.clientEmail, email)) as typeof query;
    }

    const allTickets = await query.orderBy(desc(tickets.createdAt));
    return NextResponse.json(allTickets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, assignedTo } = body;

    await db
      .update(tickets)
      .set({
        status: status || undefined,
        assignedTo: assignedTo || undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(tickets.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
