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
    const { title } = await request.json(); 

    if (!title) {
      return NextResponse.json({ message: 'Título do card é obrigatório.' }, { status: 400 });
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { title },
    });

    const response = NextResponse.json(updatedCard, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.headers.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao atualizar card.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  const resolvedParams = await Promise.resolve(params);
  const cardId = parseInt(resolvedParams.id, 10); 

  if (isNaN(cardId)) {
    return NextResponse.json({ message: 'ID do card inválido' }, { status: 400 });
  }

  try {
    const deletedCard = await prisma.card.delete({
      where: { id: cardId },
    });

    const response = NextResponse.json(deletedCard, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.headers.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Erro ao deletar card:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao deletar card.' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS'); 
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}