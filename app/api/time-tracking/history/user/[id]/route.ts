/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Count total records
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM timesession WHERE userId = ?`,
      args: [userId],
    });

    const total = countResult.rows[0]?.total as number || 0;

    // Fetch paginated records
    const query = `
      SELECT * FROM timesession 
      WHERE userId = ? 
      ORDER BY date DESC, clockIn DESC 
      LIMIT ? OFFSET ?
    `;

    const result = await db.execute({
      sql: query,
      args: [userId, limit, offset],
    });
    const sessions = result.rows;
   
    return NextResponse.json({
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}