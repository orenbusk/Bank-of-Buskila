import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
