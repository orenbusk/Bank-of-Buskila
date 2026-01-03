import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// This can be called manually by admin or via cron job
export async function POST(req: NextRequest) {
  try {
    // Check if this is a cron job (via secret) or admin user
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronJob) {
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
    };

    // Get all active allowance configs
    const configs = await prisma.allowanceConfig.findMany({
      where: { active: true },
      include: { user: true },
    });

    for (const config of configs) {
      try {
        const shouldPay = shouldProcessAllowance(config.lastPaid, config.frequency, now);

        if (!shouldPay) {
          results.skipped++;
          continue;
        }

        // Process allowance
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId: config.userId,
              type: "allowance",
              amount: config.amount,
              description: `${capitalizeFirst(config.frequency)} allowance`,
            },
          }),
          prisma.user.update({
            where: { id: config.userId },
            data: { balance: config.user.balance + config.amount },
          }),
          prisma.allowanceConfig.update({
            where: { id: config.id },
            data: { lastPaid: now },
          }),
        ]);

        results.processed++;
      } catch (error) {
        console.error(`Error processing allowance for user ${config.userId}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: "Allowance processing complete",
      results,
    });
  } catch (error) {
    console.error("Allowance processing error:", error);
    return NextResponse.json(
      { error: "Failed to process allowances" },
      { status: 500 }
    );
  }
}

function shouldProcessAllowance(
  lastPaid: Date | null,
  frequency: string,
  now: Date
): boolean {
  if (!lastPaid) return true;

  const lastPaidDate = new Date(lastPaid);
  const diffMs = now.getTime() - lastPaidDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (frequency) {
    case "daily":
      return diffDays >= 1;
    case "weekly":
      return diffDays >= 7;
    case "monthly":
      return diffDays >= 30;
    default:
      return false;
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
