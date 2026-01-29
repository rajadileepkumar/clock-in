import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Login attempt for email:", email);
    console.log("Received password hash:", password);

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch user by email
    const result = await db.execute({
      sql: `
        SELECT *
        FROM users_profile
        WHERE email = ? and status = 'Y'
      `,
      args: [email],
    });

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }


    // 3️⃣ SUCCESS (never return password)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      full_name: user.full_name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
