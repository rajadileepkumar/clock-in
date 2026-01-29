/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id);
    const body = await req.json();
    const { task, notes, breakDuration, status } = body;

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await db.execute({
      sql: `SELECT * FROM timesession WHERE id = ?`,
      args: [sessionId],
    });

    if (existingSession.rows.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (task !== undefined) {
      updates.push("task = ?");
      values.push(task);
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }

    if (breakDuration !== undefined) {
      updates.push("breakDuration = ?");
      values.push(breakDuration);
    }

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updates.push("updatedAt = datetime('now')");
    values.push(sessionId);

    const query = `UPDATE timesession SET ${updates.join(", ")} WHERE id = ?`;

    await db.execute({
      sql: query,
      args: values,
    });

    // Get updated session
    const updatedSession = await db.execute({
      sql: `SELECT * FROM timesession WHERE id = ?`,
      args: [sessionId],
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
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await db.execute({
      sql: `SELECT * FROM timesession WHERE id = ?`,
      args: [sessionId],
    });

    if (existingSession.rows.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Delete session
    await db.execute({
      sql: `DELETE FROM timesession WHERE id = ?`,
      args: [sessionId],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}