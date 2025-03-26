import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

interface Session {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: string
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    await prisma.content.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Contenu supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la suppression du contenu' },
      { status: 500 }
    )
  }
}