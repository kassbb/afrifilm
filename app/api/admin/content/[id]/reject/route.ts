import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

interface Session {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string;
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { reason } = await request.json();

    const content = await prisma.content.update({
      where: {
        id: params.id,
      },
      data: {
        isApproved: false,
        rejectionReason: reason,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error rejecting content:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors du rejet du contenu" },
      { status: 500 }
    );
  }
}
