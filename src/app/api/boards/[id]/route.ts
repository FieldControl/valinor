import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma'; 

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const boardId = parseInt(resolvedParams.id, 10);

  if (isNaN(boardId)) {
    return NextResponse.json({ message: 'ID do board inválido' }, { status: 400 });
  }

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: { 
          orderBy: {
            position: 'asc', 
          },
          include: {
            cards: { 
              orderBy: {
                position: 'asc', 
              },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ message: 'Board não encontrado' }, { status: 404 });
    }

    const response = NextResponse.json(board, { status: 200 });
    // CORS Headers
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Erro ao buscar board:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar board.' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}