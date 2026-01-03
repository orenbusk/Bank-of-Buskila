import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { userId: string };
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frequency, amount, active } = await req.json();
    const userId = params.userId;

    if (!frequency || amount === undefined) {
      return NextResponse.json(
        { error: "Frequency and amount are required" },
        { status: 400 }
      );
    }

    if (!["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "kid") {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    const allowanceConfig = await prisma.allowanceConfig.upsert({
      where: { userId },
      update: {
        frequency,
        amount: Math.floor(amount),
        active: active ?? true,
      },
      create: {
        userId,
        frequency,
        amount: Math.floor(amount),
        active: active ?? true,
      },
    });

    return NextResponse.json(allowanceConfig);
  } catch (error) {
    console.error("Allowance config error:", error);
    return NextResponse.json(
      { error: "Failed to update allowance config" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.allowanceConfig.delete({
      where: { userId: params.userId },
    });

    return NextResponse.json({ message: "Allowance config deleted" });
  } catch (error) {
    console.error("Delete allowance config error:", error);
    return NextResponse.json(
      { error: "Failed to delete allowance config" },
      { status: 500 }
    );
  }
}
