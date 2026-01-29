/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build query for sessions
    let query = `SELECT * FROM timesession WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM timesession WHERE 1=1`;
    const args: any[] = [];
    const countArgs: any[] = [];

    // Add filters
    if (userId) {
      const userIdNum = parseInt(userId);
      if (!isNaN(userIdNum)) {
        query += ` AND userId = ?`;
        countQuery += ` AND userId = ?`;
        args.push(userIdNum);
        countArgs.push(userIdNum);
      }
    }

    if (startDate) {
      query += ` AND date >= ?`;
      countQuery += ` AND date >= ?`;
      args.push(startDate);
      countArgs.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      countQuery += ` AND date <= ?`;
      args.push(endDate);
      countArgs.push(endDate);
    }

    if (status && status !== "all") {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      args.push(status);
      countArgs.push(status);
    }

    // Add pagination
    query += ` ORDER BY date DESC, clockIn DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    // Execute queries
    const [sessionsResult, countResult] = await Promise.all([
      db.execute({ sql: query, args }),
      db.execute({ sql: countQuery, args: countArgs }),
    ]);

    // Parse location JSON for each session
    const sessions = sessionsResult.rows.map((session: any) => {
      if (session.location) {
        try {
          session.location = JSON.parse(session.location as string);
        } catch (e) {
          session.location = null;
        }
      }
      return session;
    });

    return NextResponse.json({
      sessions: sessions,
      pagination: {
        page,
        limit,
        total: Number(countResult.rows[0].total),
        totalPages: Math.ceil(Number(countResult.rows[0].total) / limit),
      },
    });
  } catch (error) {
    console.error("Fetch all sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}