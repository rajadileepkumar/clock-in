import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const result = await db.execute(
    "SELECT id,full_name,email,role,status,created_at,updated_at from users_profile order by id desc",
  );

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { full_name, email, password, role } = await req.json();

  await db.execute({
    sql: "INSERT INTO users_profile (full_name, email,password,role,status,created_at,updated_at) VALUES (?, ?,?,?,'Y',datetime('now'),datetime('now'))",
    args: [full_name, email, bcrypt.hashSync(password, 10), role],
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, full_name, email, role } = body;

  await db.execute({
    sql: `
      UPDATE users_profile
      SET full_name = ?, email = ?, role = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
    args: [full_name, email, role, id],
  });

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 },
    );
  } 
  await db.execute({
    sql: "DELETE FROM users_profile WHERE id = ?",
    args: [id],
  });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  await db.execute({
    sql: `
      UPDATE users_profile
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `,
    args: [status, id],
  });
  return NextResponse.json({ success: true });
}