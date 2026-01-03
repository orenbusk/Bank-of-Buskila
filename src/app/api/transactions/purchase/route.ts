import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get the last Saturday at 23:59 (weekly reset time)
function getLastSaturdayReset(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate days since last Saturday at 23:59
  let daysSinceSaturday: number;
  if (dayOfWeek === 6) {
    // It's Saturday - check if we're past 23:59
    const saturdayReset = new Date(now);
    saturdayReset.setHours(23, 59, 0, 0);
    if (now >= saturdayReset) {
      // Past 23:59 on Saturday, use today
      daysSinceSaturday = 0;
    } else {
      // Before 23:59 on Saturday, use last Saturday
      daysSinceSaturday = 7;
    }
  } else {
    // Days since Saturday (Sunday = 1 day ago, Monday = 2, etc.)
    daysSinceSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
  }

  const lastSaturday = new Date(now);
  lastSaturday.setDate(now.getDate() - daysSinceSaturday);
  lastSaturday.setHours(23, 59, 0, 0);

  return lastSaturday;
}

// Get the next Saturday at 23:59
function getNextSaturdayReset(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();

  let daysUntilSaturday: number;
  if (dayOfWeek === 6) {
    const saturdayReset = new Date(now);
    saturdayReset.setHours(23, 59, 0, 0);
    if (now >= saturdayReset) {
      // Past reset time, next Saturday is in 7 days
      daysUntilSaturday = 7;
    } else {
      // Before reset time, next reset is today
      daysUntilSaturday = 0;
    }
  } else {
    // Calculate days until Saturday
    daysUntilSaturday = 6 - dayOfWeek;
  }

  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  nextSaturday.setHours(23, 59, 0, 0);

  return nextSaturday;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user and product
    const [user, product] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user already purchased this product this week
    const lastReset = getLastSaturdayReset();
    const recentPurchase = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        type: "purchase",
        createdAt: { gte: lastReset },
      },
    });

    if (recentPurchase) {
      const nextReset = getNextSaturdayReset();
      return NextResponse.json(
        {
          error: "Already purchased this week",
          message: `You already bought "${product.name}" this week. Available again on ${nextReset.toLocaleDateString()} at 23:59`,
          availableAt: nextReset.toISOString(),
        },
        { status: 400 }
      );
    }

    if (user.balance < product.price) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create transaction and update balance
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "purchase",
          amount: -product.price,
          description: `Purchased ${product.name}`,
          productId: product.id,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: user.balance - product.price },
      }),
    ]);

    return NextResponse.json({
      message: "Purchase successful",
      newBalance: user.balance - product.price,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Failed to complete purchase" },
      { status: 500 }
    );
  }
}
