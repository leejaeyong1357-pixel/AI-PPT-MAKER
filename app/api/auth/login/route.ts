import { NextResponse } from "next/server";
import data from "@/data/employees.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const employeeId = String(body.employeeId || "").trim();
    const password = String(body.password || "");

    if (!name || !employeeId || !password) {
      return NextResponse.json({ ok: false, error: "필수 항목 누락" });
    }

    const emp = (data.employees as any[]).find(
      (e) =>
        e.name === name && String(e.employeeId).trim() === employeeId,
    );

    if (!emp) {
      return NextResponse.json({
        ok: false,
        error: "등록되지 않은 사번/이름입니다",
      });
    }

    if (password !== emp.rrnFront) {
      return NextResponse.json({
        ok: false,
        error: "비밀번호가 일치하지 않습니다",
      });
    }

    return NextResponse.json({
      ok: true,
      user: {
        name: emp.name,
        employeeId: String(emp.employeeId),
        team: emp.team,
        position: emp.position,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청" });
  }
}
