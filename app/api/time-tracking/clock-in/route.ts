/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, status, clockIn, clockOut, date:selectedDate } = body;

    console.log("Clock-in request:", { userId });

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const date = new Date().toISOString().split("T")[0];

    // Check if user already has an active session today
    const activeSession = await db.execute({
      sql: `SELECT * FROM timesession 
            WHERE userId = ? AND status = 'ACTIVE' AND date = ?`,
      args: [userId, date],
    });

    if (activeSession.rows.length > 0 && status !== "PENDING") {
      return NextResponse.json(
        { error: "User already has an active session" },
        { status: 400 },
      );
    }

    console.log("Inserting new session...");

    const sql = `INSERT INTO timesession 
             (userId, date, clockIn, status, createdAt, updatedAt) 
             VALUES (${userId}, '${date}', '${now}', 'ACTIVE', datetime('now'), datetime('now'))`;

    console.log("SQL Query:", sql);

    // Insert new session - FIXED SQL SYNTAX
    // Your table columns: id, userId, date, clockIn, clockOut, duration, status, breakDuration, createdAt, updatedAt

    const result =
      status === "PENDING"
        ? await db.execute({
            sql: `INSERT INTO timesession 
            (userId, date, clockIn, clockOut, status, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            args: [userId, selectedDate, clockIn, clockOut, status],
          })
        : await db.execute({
            sql: `INSERT INTO timesession 
            (userId, date, clockIn, status, createdAt, updatedAt) 
            VALUES (?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))`,
            args: [userId, date, now],
          });

    console.log("Insert result:", result);

    // Get the inserted session
    const lastId = result.lastInsertRowid;
    if (!lastId) {
      return NextResponse.json(
        { error: "Failed to create session - no ID returned" },
        { status: 500 },
      );
    }

    console.log("New session ID:", lastId);

    const session = await db.execute({
      sql: `SELECT * FROM timesession WHERE id = ?`,
      args: [lastId],
    });

    if (session.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve created session" },
        { status: 500 },
      );
    }

    const sessionData = session.rows[0];
    console.log("Created session:", sessionData);

    return NextResponse.json(sessionData);
  } catch (error: any) {
    console.error("Clock in error:", error);
    return NextResponse.json(
      {
        error: "Failed to clock in",
        details: error?.message || "Unknown error",
        code: error?.code || "UNKNOWN_ERROR",
      },
      { status: 500 },
    );
  }
}
