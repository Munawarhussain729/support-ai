import { NextResponse } from "next/server";
import { db } from "@/db";
import { Users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // check duplicate email
    const existing = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email));
    if (existing.length > 0) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    await db.insert(Users).values({
      name,
      email,
      password: password,
      role: "client",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = db.select().from(Users);

    // If email is provided, filter by client email
    if (email) {
      query = query.where(eq(Users.email, email)) as typeof query;
    }

    const allUsers = await query.orderBy(desc(Users.createdAt));
    return NextResponse.json(allUsers);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, password } = body;

    await db
      .update(Users)
      .set({
        password: password || undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(Users.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update user password" },
      { status: 500 },
    );
  }
}
