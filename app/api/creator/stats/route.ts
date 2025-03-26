import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "CREATOR") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const [totalContent, totalRevenue, pendingApproval, approvedContent] =
      await Promise.all([
        // Total content count
        prisma.content.count({
          where: {
            creatorId: session.user.id,
          },
        }),
        // Total revenue from transactions
        prisma.transaction.aggregate({
          where: {
            content: {
              creatorId: session.user.id,
            },
            isPaid: true,
          },
          _sum: {
            amount: true,
          },
        }),
        // Pending approval count
        prisma.content.count({
          where: {
            creatorId: session.user.id,
            isApproved: false,
          },
        }),
        // Approved content count
        prisma.content.count({
          where: {
            creatorId: session.user.id,
            isApproved: true,
          },
        }),
      ]);

    return NextResponse.json({
      totalContent,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingApproval,
      approvedContent,
    });
  } catch (error) {
    console.error("Error fetching creator stats:", error);
    return NextResponse.json(
      {
        message:
          "Une erreur est survenue lors de la récupération des statistiques",
      },
      { status: 500 }
    );
  }
}
