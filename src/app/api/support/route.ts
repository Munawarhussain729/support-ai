import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const clientName = formData.get("clientName") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const clientPhone = formData.get("clientPhone") as string;
    const category = formData.get("category") as string;
    const message = formData.get("message") as string;
    const video = formData.get("video") as File | null;
    const screenshots = formData.getAll("screenshots") as File[];

    // Validate required fields
    if (!clientName || !clientEmail || !category || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    let videoUrl: string | null = null;
    const screenshotUrls: string[] = [];

    // Handle video upload
    if (video && video.size > 0) {
      const videoExtension = video.name.split(".").pop();
      const videoFileName = `${randomUUID()}.${videoExtension}`;
      const videoPath = join(uploadsDir, videoFileName);
      const videoBytes = await video.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      await writeFile(videoPath, videoBuffer);
      videoUrl = `/uploads/${videoFileName}`;
    }

    // Handle screenshot uploads
    for (const screenshot of screenshots) {
      if (screenshot && screenshot.size > 0) {
        const screenshotExtension = screenshot.name.split(".").pop();
        const screenshotFileName = `${randomUUID()}.${screenshotExtension}`;
        const screenshotPath = join(uploadsDir, screenshotFileName);
        const screenshotBytes = await screenshot.arrayBuffer();
        const screenshotBuffer = Buffer.from(screenshotBytes);
        await writeFile(screenshotPath, screenshotBuffer);
        screenshotUrls.push(`/uploads/${screenshotFileName}`);
      }
    }

    // Create ticket in database


    return NextResponse.json(
      { ticketId: ticket.id, message: "Ticket created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

