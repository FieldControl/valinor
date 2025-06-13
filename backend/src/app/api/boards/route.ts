import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function GET(request: Request) {
  try {
    const boards = await prisma.board.findMany({
      include: {
        columns: {
          include: {
            cards: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    return NextResponse.json(boards, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar boards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar boards.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'O título do board é obrigatório.' },
        { status: 400 }
      );
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
      },
    });

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar board:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar board.' },
      { status: 500 }
    );
  }
}