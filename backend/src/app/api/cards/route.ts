import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(request: NextRequest) {
  try {
    const { title, columnId, position } = await request.json();

    if (!title || typeof columnId !== 'number' || typeof position !== 'number') {
      return NextResponse.json({ message: 'Título, columnId e posição são obrigatórios.' }, { status: 400 });
    }

    const newCard = await prisma.card.create({
      data: {
        title,
        columnId,
        position,
      },
    });

    const response = NextResponse.json(newCard, { status: 201 });
    
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Erro ao criar card:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao criar card.' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}