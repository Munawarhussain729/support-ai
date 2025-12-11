import { NextResponse } from "next/server";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

export async function GET() {
  try {
    const allTickets = await db.select().from(tickets);
    return NextResponse.json(allTickets);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
