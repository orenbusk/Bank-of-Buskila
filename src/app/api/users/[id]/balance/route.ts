import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, description } = await req.json();
    const userId = params.id;

    if (amount === undefined || !description) {
      return NextResponse.json(
        { error: "Amount and description are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adjustedAmount = Math.floor(amount);
    const newBalance = user.balance + adjustedAmount;

    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Balance cannot be negative" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: "adjustment",
          amount: adjustedAmount,
          description,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
    ]);

    return NextResponse.json({
      message: "Balance adjusted",
      newBalance,
    });
  } catch (error) {
    console.error("Balance adjustment error:", error);
    return NextResponse.json(
      { error: "Failed to adjust balance" },
      { status: 500 }
    );
  }
}
