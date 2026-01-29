/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const period = searchParams.get("period") || "week";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    let dateRangeStart = startDate;
    let dateRangeEnd = endDate;

    // Calculate date range if not provided
    if (!dateRangeStart || !dateRangeEnd) {
      const now = new Date();
      if (period === "week") {
        // Start of week (Monday)
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        dateRangeStart = start.toISOString().split("T")[0];

        // End of week (Sunday)
        const end = new Date(now);
        end.setDate(now.getDate() + (7 - now.getDay()));
        dateRangeEnd = end.toISOString().split("T")[0];
      } else if (period === "month") {
        // Start of month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateRangeStart = start.toISOString().split("T")[0];

        // End of month
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateRangeEnd = end.toISOString().split("T")[0];
      } else {
        // Default to last 30 days
        const start = new Date(now);
        start.setDate(now.getDate() - 30);
        dateRangeStart = start.toISOString().split("T")[0];
        dateRangeEnd = now.toISOString().split("T")[0];
      }
    }

    // Get sessions for date range
    const result = await db.execute({
      sql: `SELECT * FROM timesession 
            WHERE userId = ? AND date BETWEEN ? AND ?
            ORDER BY date DESC`,
      args: [userIdNum, dateRangeStart, dateRangeEnd],
    });

    const sessions = result.rows;

    // Group by date
    const dailySummary = sessions.reduce((acc: Record<string, any>, session: any) => {
      const date = session.date as string;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalDuration: 0,
          breakDuration: 0,
          sessions: 0,
        };
      }
      acc[date].totalDuration += session.duration || 0;
      acc[date].breakDuration += session.breakDuration || 0;
      acc[date].sessions += 1;
      return acc;
    }, {});

    // Calculate totals
    const totalSummary = {
      period: `${dateRangeStart} to ${dateRangeEnd}`,
      totalDays: Object.keys(dailySummary).length,
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0),
      totalBreakDuration: sessions.reduce(
        (sum: number, session: any) => sum + (session.breakDuration || 0),
        0
      ),
      netDuration: sessions.reduce(
        (sum: number, session: any) => sum + (session.duration || 0) - (session.breakDuration || 0),
        0
      ),
      averageDailyHours:
        Object.values(dailySummary).reduce((sum: number, day: any) => sum + day.totalDuration, 0) /
        Math.max(1, Object.keys(dailySummary).length) /
        (1000 * 60 * 60),
      dailySummary: Object.values(dailySummary),
    };

    return NextResponse.json(totalSummary);
  } catch (error) {
    console.error("Get summary error:", error);
    return NextResponse.json(
      { error: "Failed to get summary" },
      { status: 500 }
    );
  }
}