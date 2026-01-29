import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const date = new Date().toISOString().split("T")[0];

    // Get active session
    const activeSession = await db.execute({
      sql: `SELECT * FROM timesession 
            WHERE userId = ? AND status = 'ACTIVE' AND date = ?`,
      args: [userId, date],
    });

    if (activeSession.rows.length === 0) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 404 }
      );
    }

    const currentSession = activeSession.rows[0];

    // Calculate duration
    const clockInTime = new Date(currentSession.clockIn as string).getTime();
    const clockOutTime = new Date(now).getTime();
    const duration = clockOutTime - clockInTime;

    // Update session
    await db.execute({
      sql: `UPDATE timesession 
            SET clockOut = ?, 
                duration = ?, 
                status = 'COMPLETED', 
                updatedAt = datetime('now')
            WHERE id = ?`,
      args: [
        now,
        duration,
        currentSession.id,
      ],
    });

    // Get updated session
    const updatedSession = await db.execute({
      sql: `SELECT * FROM timesession WHERE id = ?`,
      args: [currentSession.id],
    });

    // Parse location JSON if exists
    const sessionData = updatedSession.rows[0];
    if (sessionData.location) {
      try {
        sessionData.location = JSON.parse(sessionData.location as string);
      } catch (e) {
        sessionData.location = null;
      }
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Clock out error:", error);
    return NextResponse.json(
      { error: "Failed to clock out" },
      { status: 500 }
    );
  }
}