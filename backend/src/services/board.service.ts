import * as admin from 'firebase-admin';
import { db, storage } from '../config/firebase';
import { Board, Column, Card, ColumnUpdateInput } from '../types/schema';
import { DecodedIdToken } from 'firebase-admin/auth';

export class BoardService {
  private boardsRef = db.collection('boards');
  private bucket = storage.bucket();

  async getBoard(id: string, userId?: string): Promise<Board | null> {
    const doc = await this.boardsRef.doc(id).get();
    if (!doc.exists) return null;
    
    const board = { id: doc.id, ...doc.data() } as Board;
    
    // Verificar se o board pertence ao usuário
    if (userId && board.userId && board.userId !== userId) {
      // Tenta recuperar do storage se não encontrar pelo userId atual
      // Isso pode acontecer após logout/login com outro usuário
      try {
        const backupBoard = await this.getBoardFromStorage(id);
        if (backupBoard) {
          console.log(`Recuperando board ${id} do Storage para o usuário ${userId}`);
          return backupBoard;
        }
      } catch (error) {
        console.error(`Erro ao recuperar board do storage: ${error}`);
      }
      
      return null; // O board não pertence a este usuário
    }
    
    return board;
  }

  async getBoards(userId?: string): Promise<Board[]> {
    let query: any = this.boardsRef;
    
    // Se um userId foi fornecido, filtre os boards deste usuário
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    const boards = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Board;
      return { ...data, id: doc.id };
    });
    
    // Se não houver boards e houver userId, tente recuperar do storage
    if (boards.length === 0 && userId) {
      try {
        console.log(`Tentando recuperar boards do storage para usuário ${userId}`);
        const backupBoards = await this.getBoardsFromStorage(userId);
        if (backupBoards && backupBoards.length > 0) {
          console.log(`Recuperados ${backupBoards.length} boards do Storage`);
          // Restaurar os boards do storage para o Firestore
          for (const board of backupBoards) {
            await this.restoreBoardToFirestore(board, userId);
          }
          return backupBoards;
        }
      } catch (error) {
        console.error(`Erro ao recuperar boards do storage: ${error}`);
      }
    }
    
    return boards;
  }

  async createBoard(input: { title: string }, userId?: string): Promise<Board> {
    const board: Omit<Board, 'id'> = {
      title: input.title,
      columns: [],
      userId: userId || 'anonymous', // Associar o board ao usuário
      createdAt: new Date()
    };
    
    const docRef = await this.boardsRef.add(board);
    const newBoard = { id: docRef.id, ...board };
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(newBoard);
    
    return newBoard;
  }

  async updateBoard(id: string, input: { title: string }, userId?: string): Promise<Board> {
    const board = await this.getBoard(id, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    await this.boardsRef.doc(id).update({
      title: input.title
    });
    
    const updatedBoard = { ...board, title: input.title };
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(updatedBoard);
    
    return updatedBoard;
  }

  async deleteBoard(id: string, userId?: string): Promise<boolean> {
    const board = await this.getBoard(id, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    await this.boardsRef.doc(id).delete();
    
    // Remover também do Storage
    try {
      await this.deleteBoardFromStorage(id, userId);
    } catch (error) {
      console.error(`Erro ao excluir board do storage: ${error}`);
    }
    
    return true;
  }

  async addColumn(boardId: string, column: Omit<Column, 'id'>, userId?: string): Promise<Board> {
    const board = await this.getBoard(boardId, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    const newColumn: Column = {
      ...column,
      id: Date.now().toString(),
      cards: column.cards || [] // Garantir que cards seja um array
    };
    
    board.columns.push(newColumn);
    await this.boardsRef.doc(boardId).update({
      columns: board.columns
    });
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(board);
    
    return board;
  }

  async updateColumn(boardId: string, columnId: string, input: ColumnUpdateInput, userId?: string): Promise<Board> {
    console.log(`Atualizando coluna no board ${boardId}. ID da coluna: ${columnId}`);
    console.log('Dados recebidos para atualização:', JSON.stringify(input, null, 2));

    const board = await this.getBoard(boardId, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) throw new Error('Column not found');
    
    // Preservar os cards existentes se não forem fornecidos no input
    const existingCards = board.columns[columnIndex].cards || [];
    
    // Se existirem cards no input, mapear cada CardInput para Card com um id válido
    const updatedCards = input.cards 
      ? input.cards.map((cardInput, index) => {
          // Se já houver um card existente com o mesmo índice, preservar o id
          const existingId = (existingCards[index] && existingCards[index].id) || `new_card_${Date.now()}_${index}`;
          
          // Converter TagInput para Tag
          const tags = cardInput.tags 
            ? cardInput.tags.map((tagInput, tagIndex) => ({
                ...tagInput,
                id: `tag_${Date.now()}_${index}_${tagIndex}`
              }))
            : undefined;
            
          // Converter AttachmentInput para Attachment
          const attachments = cardInput.attachments
            ? cardInput.attachments.map((attachInput, attachIndex) => ({
                ...attachInput,
                id: `attach_${Date.now()}_${index}_${attachIndex}`
              }))
            : undefined;
            
          return {
            ...cardInput,
            id: existingId,
            tags,
            attachments
          };
        })
      : existingCards;
    
    // Garantir que o ID da coluna original seja preservado
    board.columns[columnIndex] = {
      ...board.columns[columnIndex],
      ...input,
      id: columnId, // Garantir que o ID da coluna não mude
      cards: updatedCards // Usar os cards atualizados ou preservar os existentes
    };
    
    console.log('Coluna após atualização:', JSON.stringify(board.columns[columnIndex], null, 2));
    
    await this.boardsRef.doc(boardId).update({
      columns: board.columns
    });
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(board);
    
    return board;
  }

  async deleteColumn(boardId: string, columnId: string, userId?: string): Promise<Board> {
    console.log(`Serviço: Excluindo coluna ${columnId} do board ${boardId}`);
    
    try {
      // Recuperar o board com eficiência
      const board = await this.getBoard(boardId, userId);
      if (!board) {
        console.error(`Board não encontrado ou acesso negado: ${boardId}`);
        throw new Error('Board not found or access denied');
      }
      
      // Verificar se a coluna existe
      if (!board.columns.some(col => col.id === columnId)) {
        console.error(`Coluna não encontrada: ${columnId}`);
        throw new Error('Column not found');
      }
      
      // Filtrar a coluna de forma otimizada
      const columnsBeforeRemoval = board.columns.length;
      board.columns = board.columns.filter(col => col.id !== columnId);
      
      if (board.columns.length === columnsBeforeRemoval) {
        console.warn(`Nenhuma coluna removida com o ID ${columnId}`);
      } else {
        console.log(`Coluna ${columnId} removida com sucesso. Colunas restantes: ${board.columns.length}`);
      }
      
      // Atualizar o board no Firestore em uma única operação
      await this.boardsRef.doc(boardId).update({
        columns: board.columns,
        updatedAt: new Date()
      });
      
      // Salvar backup no Storage de forma assíncrona
      this.saveBoardToStorage(board).catch(error => {
        console.error(`Erro ao salvar backup do board após remoção de coluna: ${error.message}`);
      });
      
      return board;
    } catch (error) {
      console.error(`Erro ao excluir coluna ${columnId}:`, error);
      throw error;
    }
  }

  async addCard(boardId: string, columnId: string, card: Omit<Card, 'id'>, userId?: string): Promise<Board> {
    const board = await this.getBoard(boardId, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) throw new Error('Column not found');
    
    // Tratar a data
    const processedCard = {
      ...card,
      dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
      id: Date.now().toString()
    };
    
    console.log(`Processando data para addCard: ${card.dueDate} -> ${processedCard.dueDate}`);
    
    // Inicializar o array de cards se ele não existir
    if (!board.columns[columnIndex].cards) {
      board.columns[columnIndex].cards = [];
    }
    
    board.columns[columnIndex].cards.push(processedCard);
    await this.boardsRef.doc(boardId).update({
      columns: board.columns
    });
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(board);
    
    return board;
  }

  async updateCard(boardId: string, columnId: string, cardId: string, input: Omit<Card, 'id'>, userId?: string): Promise<Board> {
    console.log(`Atualizando card ${cardId} na coluna ${columnId} do board ${boardId}`);
    console.log('Dados recebidos para atualização do card:', JSON.stringify(input, null, 2));
    
    const board = await this.getBoard(boardId, userId);
    if (!board) throw new Error('Board not found or access denied');
    
    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) throw new Error('Column not found');
    
    const cardIndex = board.columns[columnIndex].cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) throw new Error('Card not found');
    
    // Preservar campos que podem não estar incluídos no input
    const existingCard = board.columns[columnIndex].cards[cardIndex];
    
    // Tratar a data
    const processedInput = {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined
    };
    
    console.log(`Processando data para updateCard: ${input.dueDate} -> ${processedInput.dueDate}`);
    
    board.columns[columnIndex].cards[cardIndex] = {
      ...existingCard,
      ...processedInput,
      id: cardId, // Garantir que o ID do card não mude
      // Preservar tags e anexos se não forem fornecidos
      tags: processedInput.tags || existingCard.tags,
      attachments: processedInput.attachments || existingCard.attachments
    };
    
    console.log('Card após atualização:', JSON.stringify(board.columns[columnIndex].cards[cardIndex], null, 2));
    
    await this.boardsRef.doc(boardId).update({
      columns: board.columns
    });
    
    // Salvar backup no Storage
    await this.saveBoardToStorage(board);
    
    return board;
  }

  async deleteCard(boardId: string, columnId: string, cardId: string, userId?: string): Promise<Board> {
    console.log(`Backend: Excluindo card ${cardId} da coluna ${columnId} no board ${boardId}`);
    
    try {
      // Buscar o board atualizado
      const board = await this.getBoard(boardId, userId);
      if (!board) {
        console.error(`Board não encontrado ou acesso negado: ${boardId}`);
        throw new Error('Board not found or access denied');
      }
      
      // Verificar se a coluna existe
      const columnIndex = board.columns.findIndex(col => col.id === columnId);
      if (columnIndex === -1) {
        console.error(`Coluna não encontrada: ${columnId}`);
        throw new Error('Column not found');
      }
      
      // Verificar se o card existe na coluna
      const cardIndex = board.columns[columnIndex].cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        console.error(`Card não encontrado: ${cardId}`);
        throw new Error('Card not found');
      }
      
      console.log(`Removendo card ${cardId} da coluna ${columnId}. Cards antes: ${board.columns[columnIndex].cards.length}`);
      
      // Antes de remover, fazer uma cópia de segurança dos cards e seus títulos
      const cardsBefore = JSON.parse(JSON.stringify(board.columns[columnIndex].cards));
      
      // Remover o card
      board.columns[columnIndex].cards = board.columns[columnIndex].cards.filter(card => card.id !== cardId);
      
      console.log(`Cards após remoção: ${board.columns[columnIndex].cards.length}`);
      
      // Reordenar os cards restantes
      board.columns[columnIndex].cards.forEach((card, index) => {
        card.order = index;
        
        // Verificar se o título do card está intacto, caso contrário use o da cópia
        if (!card.title || card.title.trim() === '') {
          const originalCard = cardsBefore.find((c: any) => c.id === card.id);
          if (originalCard && originalCard.title) {
            console.log(`Restaurando título do card ${card.id} após exclusão`);
            card.title = originalCard.title;
          } else {
            card.title = 'Sem título';
          }
        }
      });
      
      // Atualizar o board no Firestore
      await this.boardsRef.doc(boardId).update({
        columns: board.columns
      });
      
      // Salvar backup no Storage
      await this.saveBoardToStorage(board);
      
      console.log(`Board atualizado após exclusão do card: ${board.columns.length} colunas`);
      board.columns.forEach((col, idx) => {
        console.log(`Coluna ${idx+1} (${col.id}): ${col.cards.length} cards`);
      });
      
      return board;
    } catch (error) {
      console.error(`Erro ao excluir card ${cardId}:`, error);
      throw error;
    }
  }

  async moveCard(boardId: string, sourceColumnId: string, targetColumnId: string, cardId: string, newOrder: number, userId?: string): Promise<Board> {
    try {
      console.log(`Executando moveCard: board=${boardId}, source=${sourceColumnId}, target=${targetColumnId}, card=${cardId}, order=${newOrder}`);
      
      const board = await this.getBoard(boardId, userId);
      if (!board) throw new Error('Board not found or access denied');
      
      // Validar os IDs das colunas
      const sourceColumnIndex = board.columns.findIndex(col => col.id === sourceColumnId);
      const targetColumnIndex = board.columns.findIndex(col => col.id === targetColumnId);
      
      if (sourceColumnIndex === -1 || targetColumnIndex === -1) {
        throw new Error('Column not found');
      }
      
      // Verificar se o card existe na coluna de origem
      let cardIndex = board.columns[sourceColumnIndex].cards.findIndex(card => card.id === cardId);
      
      // Se não encontrou na coluna de origem e as colunas são diferentes,
      // verificar se já está na coluna de destino
      if (cardIndex === -1 && sourceColumnId !== targetColumnId) {
        const targetCardIndex = board.columns[targetColumnIndex].cards.findIndex(card => card.id === cardId);
        
        if (targetCardIndex !== -1) {
          console.log(`Card ${cardId} já está na coluna de destino ${targetColumnId}, apenas reordenando`);
          // O card já está na coluna de destino, então é só uma questão de reordenar
          
          // Obter o card e sanitizar para o Firestore
          const card = this.sanitizeCardForFirestore({...board.columns[targetColumnIndex].cards[targetCardIndex]});
          
          // Remover da posição atual
          board.columns[targetColumnIndex].cards.splice(targetCardIndex, 1);
          
          // Ajustar ordem
          card.order = newOrder;
          
          // Recolocar na nova posição
          const safeIndex = Math.min(newOrder, board.columns[targetColumnIndex].cards.length);
          board.columns[targetColumnIndex].cards.splice(safeIndex, 0, card);
          
          // Reordenar todos os cards da coluna
          board.columns[targetColumnIndex].cards.forEach((c, idx) => {
            c.order = idx;
          });
          
          // Salvar no banco de dados
          await this.boardsRef.doc(boardId).update({
            columns: board.columns
          });
          
          // Salvar backup
          await this.saveBoardToStorage(board);
          
          return board;
        }
      }
      
      // Se depois das verificações o card ainda não foi encontrado, é um erro
      if (cardIndex === -1) {
        // Verificar em todas as colunas para diagnóstico
        for (let i = 0; i < board.columns.length; i++) {
          const foundCardIndex = board.columns[i].cards.findIndex(card => card.id === cardId);
          if (foundCardIndex !== -1) {
            throw new Error(`Card found in column ${board.columns[i].id} but expected in ${sourceColumnId}`);
          }
        }
        
        throw new Error(`Card not found in any column`);
      }
      
      // Clone completo do card e sanitize dados para evitar erros de serialização
      const card = this.sanitizeCardForFirestore(
        JSON.parse(JSON.stringify(board.columns[sourceColumnIndex].cards[cardIndex]))
      );
      
      // Remover o card da coluna de origem
      board.columns[sourceColumnIndex].cards.splice(cardIndex, 1);
      
      // Reordenar os cards na coluna de origem após remoção
      board.columns[sourceColumnIndex].cards.forEach((c, idx) => {
        c.order = idx;
      });
      
      // Definir a nova ordem para o card
      card.order = newOrder;
      
      // Inicializar o array de cards se ele não existir
      if (!board.columns[targetColumnIndex].cards) {
        board.columns[targetColumnIndex].cards = [];
      }
      
      // Inserir o card na posição correta na coluna de destino
      const safeIndex = Math.min(newOrder, board.columns[targetColumnIndex].cards.length);
      board.columns[targetColumnIndex].cards.splice(safeIndex, 0, card);
      
      // Atualizar a ordem de todos os cards na coluna de destino
      board.columns[targetColumnIndex].cards.forEach((c, idx) => {
        c.order = idx;
        
        // Garantir que todos os cards tenham títulos
        if (!c.title || c.title.trim() === '') {
          console.log(`Corrigindo título ausente do card ${c.id} durante a movimentação`);
          c.title = 'Sem título';
        }
      });
      
      // Persistir as alterações no Firestore
      await this.boardsRef.doc(boardId).update({
        columns: board.columns
      });
      
      // Tentar salvar backup no Storage (capturar erro não crítico)
      try {
        await this.saveBoardToStorage(board);
      } catch (error) {
        console.error("Erro não crítico ao salvar backup:", error);
      }
      
      return board;
    } catch (error) {
      console.error(`Erro ao mover card ${cardId} entre colunas:`, error);
      throw error;
    }
  }
  
  // Método auxiliar para sanitizar dados de cards para Firestore
  private sanitizeCardForFirestore(card: any): any {
    // Clone para não modificar o original
    const sanitizedCard = {...card};
    
    // Garantir que o card tenha um título
    if (!sanitizedCard.title || sanitizedCard.title.trim() === '') {
      sanitizedCard.title = 'Sem título';
    }
    
    // Converter objeto de data para string ISO
    if (sanitizedCard.dueDate) {
      try {
        if (typeof sanitizedCard.dueDate === 'object') {
          // Se for um objeto do Firebase
          if ('_seconds' in sanitizedCard.dueDate && '_nanoseconds' in sanitizedCard.dueDate) {
            const timestamp = new Date(sanitizedCard.dueDate._seconds * 1000);
            sanitizedCard.dueDate = timestamp.toISOString();
          } 
          // Se for um Date
          else if (sanitizedCard.dueDate instanceof Date || 
                 (typeof sanitizedCard.dueDate.getMonth === 'function')) {
            sanitizedCard.dueDate = sanitizedCard.dueDate.toISOString();
          }
        } 
        // Se for uma string, garantir que é ISO válida
        else if (typeof sanitizedCard.dueDate === 'string') {
          const d = new Date(sanitizedCard.dueDate);
          if (!isNaN(d.getTime())) {
            sanitizedCard.dueDate = d.toISOString();
          } else {
            // Se não for válida, remover
            delete sanitizedCard.dueDate;
          }
        } 
        // Para outros tipos, remover
        else {
          delete sanitizedCard.dueDate;
        }
      } catch (err) {
        console.error('Erro ao sanitizar data do card:', err);
        delete sanitizedCard.dueDate;
      }
    }
    
    return sanitizedCard;
  }

  // Métodos para persistência no Firebase Storage
  private async saveBoardToStorage(board: Board): Promise<void> {
    // Desabilitando temporariamente a funcionalidade de Storage
    console.log(`Storage temporariamente desabilitado - ignorando backup do board ${board.id}`);
    return;
    
    // Código original comentado
    /*
    try {
      if (!board.userId || board.userId === 'anonymous') {
        console.log('Pulando backup para usuário anônimo');
        return;
      }

      const boardFile = this.bucket.file(`users/${board.userId}/boards/${board.id}.json`);
      const boardData = JSON.stringify(board);
      
      await boardFile.save(boardData, {
        contentType: 'application/json',
        metadata: {
          updatedAt: new Date().toISOString()
        }
      });
      
      console.log(`Board ${board.id} salvo no Storage para o usuário ${board.userId}`);
    } catch (error) {
      console.error(`Erro ao salvar board no storage: ${error}`);
    }
    */
  }

  private async getBoardFromStorage(boardId: string): Promise<Board | null> {
    // Desabilitando temporariamente a funcionalidade de Storage
    console.log(`Storage temporariamente desabilitado - ignorando recuperação do board ${boardId}`);
    return null;
    
    // Código original comentado
    /*
    try {
      const [files] = await this.bucket.getFiles({
        prefix: `users/`
      });
      
      const boardFile = files.find(file => file.name.endsWith(`/boards/${boardId}.json`));
      
      if (!boardFile) {
        return null;
      }
      
      const [content] = await boardFile.download();
      const board = JSON.parse(content.toString()) as Board;
      
      return board;
    } catch (error) {
      console.error(`Erro ao obter board do storage: ${error}`);
      return null;
    }
    */
  }

  private async getBoardsFromStorage(userId: string): Promise<Board[]> {
    // Desabilitando temporariamente a funcionalidade de Storage
    console.log(`Storage temporariamente desabilitado - ignorando recuperação dos boards do usuário ${userId}`);
    return [];
    
    // Código original comentado
    /*
    try {
      const [files] = await this.bucket.getFiles({
        prefix: `users/${userId}/boards/`
      });
      
      if (files.length === 0) {
        return [];
      }
      
      const boards: Board[] = [];
      
      for (const file of files) {
        try {
          const [content] = await file.download();
          const board = JSON.parse(content.toString()) as Board;
          boards.push(board);
        } catch (downloadError) {
          console.error(`Erro ao baixar arquivo ${file.name}: ${downloadError}`);
        }
      }
      
      return boards;
    } catch (error) {
      console.error(`Erro ao listar boards do storage: ${error}`);
      return [];
    }
    */
  }

  private async deleteBoardFromStorage(boardId: string, userId?: string): Promise<void> {
    // Desabilitando temporariamente a funcionalidade de Storage
    console.log(`Storage temporariamente desabilitado - ignorando exclusão do board ${boardId}`);
    return;
    
    // Código original comentado
    /*
    try {
      if (!userId) {
        // Tentar encontrar arquivos para este boardId em qualquer pasta de usuário
        const [files] = await this.bucket.getFiles();
        const boardFiles = files.filter(file => file.name.includes(`/boards/${boardId}.json`));
        
        for (const file of boardFiles) {
          await file.delete();
          console.log(`Arquivo ${file.name} excluído do Storage`);
        }
      } else {
        // Excluir apenas para o usuário específico
        const boardFile = this.bucket.file(`users/${userId}/boards/${boardId}.json`);
        await boardFile.delete();
        console.log(`Board ${boardId} excluído do Storage para o usuário ${userId}`);
      }
    } catch (error) {
      console.error(`Erro ao excluir board do storage: ${error}`);
    }
    */
  }

  private async restoreBoardToFirestore(board: Board, userId: string): Promise<void> {
    try {
      // Atualizar o userId para garantir que o board pertence ao usuário atual
      board.userId = userId;
      
      // Verificar se já existe um documento com este ID
      const existingDoc = await this.boardsRef.doc(board.id).get();
      
      if (existingDoc.exists) {
        // Atualizar o documento existente
        await this.boardsRef.doc(board.id).update({
          ...board,
          userId: userId // Garantir que pertence ao usuário correto
        });
      } else {
        // Criar um novo documento com o mesmo ID
        await this.boardsRef.doc(board.id).set({
          ...board,
          userId: userId // Garantir que pertence ao usuário correto
        });
      }
      
      console.log(`Board ${board.id} restaurado para o Firestore para o usuário ${userId}`);
    } catch (error) {
      console.error(`Erro ao restaurar board para o Firestore: ${error}`);
    }
  }

  async resetBoard(boardId: string, userId?: string): Promise<Board> {
    console.log(`Service: Iniciando resetBoard para board ${boardId}, usuário ${userId || 'anônimo'}`);
    
    try {
      // Verificar se o usuário tem acesso ao board
      const board = await this.getBoard(boardId, userId);
      if (!board) {
        console.error(`Board não encontrado ou acesso negado: ${boardId}`);
        throw new Error('Board not found or access denied');
      }
      
      console.log(`Board encontrado. Título: ${board.title}, Colunas: ${board.columns.length}`);
      
      // Criar um novo objeto board com colunas vazias, preservando informações básicas
      const resetedBoard: Board = {
        id: boardId,
        title: board.title,
        userId: board.userId,
        createdAt: board.createdAt,
        columns: [] // Limpar todas as colunas
      };
      
      // Atualizar o Firestore com o board resetado
      await this.boardsRef.doc(boardId).update({
        columns: [], // Limpar todas as colunas no Firestore
        updatedAt: new Date() // Registrar quando foi resetado
      });
      
      console.log(`Firestore atualizado para o board ${boardId}. Columns resetadas para array vazio.`);
      
      // Remover o board do Storage e salvar a versão limpa - TEMPORARIAMENTE DESABILITADO
      console.log(`Storage temporariamente desabilitado - operações de reset não afetarão o Storage`);
      
      /*
      try {
        // Primeiro excluir o backup antigo
        await this.deleteBoardFromStorage(boardId, userId);
        console.log(`Versão antiga do board ${boardId} removida do Storage`);
        
        // Depois salvar o board limpo
        await this.saveBoardToStorage(resetedBoard);
        console.log(`Versão limpa do board ${boardId} salva no Storage`);
      } catch (storageError) {
        // Erros de Storage não devem impedir a conclusão da operação
        console.error(`Erro ao manipular Storage durante reset: ${storageError}`);
      }
      */
      
      console.log(`Reset completo para o board ${boardId}`);
      
      return resetedBoard;
    } catch (error) {
      console.error(`Erro ao resetar board ${boardId}:`, error);
      throw error;
    }
  }
} 