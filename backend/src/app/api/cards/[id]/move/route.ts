import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  const resolvedParams = await Promise.resolve(params);
  const cardId = parseInt(resolvedParams.id, 10); 

  if (isNaN(cardId)) {
    return NextResponse.json({ message: 'ID do card inválido' }, { status: 400 });
  }

  try {
    const { newColumnId, newPosition } = await request.json();

    if (typeof newColumnId !== 'number' || typeof newPosition !== 'number') {
      return NextResponse.json({ message: 'newColumnId e newPosition são obrigatórios e devem ser números.' }, { status: 400 });
    }

    const movedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        columnId: newColumnId,
        position: newPosition,
      },
    });

    const response = NextResponse.json(movedCard, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.headers.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Erro ao mover card:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao mover card.' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}