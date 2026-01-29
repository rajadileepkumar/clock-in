/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Get today's sessions
    const result = await db.execute({
      sql: `SELECT * FROM timesession 
            WHERE userId = ? AND date = ? 
            ORDER BY clockIn DESC`,
      args: [userIdNum, today],
    });

    // Parse location JSON for each session
    const sessions = result.rows.map((session: any) => {
      if (session.location) {
        try {
          session.location = JSON.parse(session.location as string);
        } catch (e) {
          session.location = null;
        }
      }
      return session;
    });

    // Calculate totals
    const totalDuration = sessions.reduce((sum: number, session: any) => {
      return sum + (session.duration || 0);
    }, 0);

    const activeSession = sessions.find((s: any) => s.status === "ACTIVE");
    const breakDuration = sessions.reduce((sum: number, session: any) => {
      return sum + (session.breakDuration || 0);
    }, 0);

    return NextResponse.json({
      date: today,
      totalSessions: sessions.length,
      activeSession: activeSession || null,
      totalDuration,
      breakDuration,
      netDuration: totalDuration - breakDuration,
      sessions: sessions,
    });
  } catch (error) {
    console.error("Get today summary error:", error);
    return NextResponse.json(
      { error: "Failed to get today summary" },
      { status: 500 }
    );
  }
}