import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function PUT(req: Request) {
    const { sessionId, status,userId } = await req.json();
    console.log("Updating session:", sessionId, "to status:", status);
    try {
        const sqlquery = `UPDATE timesession SET status = ?, approvedBy = "AUTHOR", approvedId = ? WHERE id = ?`;
        console.log("Executing SQL:", sqlquery, "with args:", [status, userId, sessionId]);
        await db.execute({
            sql: `
        UPDATE timesession SET status = ?, approvedBy = "AUTHOR", approvedId = ? WHERE id = ?`,
            args: [status, userId, sessionId]
        });
        return NextResponse.json({ message: "Session updated successfully" });
    }
    catch (error) {
        console.error("Update session error:", error);
        return NextResponse.json(
            { error: "Failed to update session" },
            { status: 500 }
        );
    }
}