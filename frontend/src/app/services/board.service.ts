import { Injectable } from "@angular/core"
import type { Board, Card, Column } from "../models/board.model"
import { BoardGraphqlService } from "./board-graphql.service"
import { BehaviorSubject, catchError, of, switchMap, tap } from "rxjs"
import { Observable, Subscription } from "rxjs"
import { ToastService } from './toast.service'
import { AuthService } from './auth.service'
import { User } from '@angular/fire/auth'
import { OnDestroy } from '@angular/core'

@Injectable({
  providedIn: "root",
})
export class BoardService implements OnDestroy {
  // Manter o board mockado para desenvolvimento local
  private mockBoard: Board = {
    id: "mock_local_board",
    title: "Meu Kanban",
    columns: [
      {
        id: "col1",
        title: "A Fazer",
        color: "#2D8CFF",
        cards: [
          {
            id: "card1",
            title: "Implementar drag and drop",
            description: "Adicionar funcionalidade de arrastar e soltar para os cards entre colunas",
            tags: [
              { id: "tag1", name: "Feature", color: "#00C781" },
              { id: "tag2", name: "UI/UX", color: "#7D4CDB" },
            ],
            dueDate: new Date("2023-12-15"),
            order: 0,
          },
          {
            id: "card2",
            title: "Criar componente de modal",
            description: "Desenvolver um componente reutilizável para modais",
            tags: [{ id: "tag1", name: "Feature", color: "#00C781" }],
            order: 1,
          },
        ],
      },
      {
        id: "col2",
        title: "Em Progresso",
        color: "#FFAA15",
        cards: [
          {
            id: "card3",
            title: "Estilizar componentes com SCSS",
            description: "Aplicar estilos usando SCSS para todos os componentes do board",
            tags: [{ id: "tag2", name: "UI/UX", color: "#7D4CDB" }],
            order: 0,
          },
        ],
      },
      {
        id: "col3",
        title: "Concluído",
        color: "#00C781",
        cards: [
          {
            id: "card4",
            title: "Configurar projeto Angular",
            description: "Inicializar o projeto e configurar as dependências necessárias",
            tags: [{ id: "tag3", name: "Setup", color: "#2D8CFF" }],
            order: 0,
          },
          {
            id: "card5",
            title: "Criar estrutura de componentes",
            description: "Definir a arquitetura e criar os componentes base",
            tags: [{ id: "tag3", name: "Setup", color: "#2D8CFF" }],
            order: 1,
          },
        ],
      },
    ],
  }

  private boardSubject = new BehaviorSubject<Board>({
    id: "1",
    title: "Kanban Board",
    columns: []
  });
  board$ = this.boardSubject.asObservable();
  
  private currentUserId = '';
  private previousUserId = '';
  private authSubscription: Subscription;

  constructor(
    private boardGraphqlService: BoardGraphqlService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    // Obter o ID do usuário quando o serviço é inicializado
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        const newUserId = user.uid || user.email || 'anonymous';
        
        // Verificar se o usuário mudou
        if (this.currentUserId && this.currentUserId !== newUserId) {
          console.log('Usuário mudou de', this.currentUserId, 'para', newUserId);
          this.previousUserId = this.currentUserId;
          // Limpar o board atual antes de carregar o board do novo usuário
          this.resetLocalBoard();
        }
        
        this.currentUserId = newUserId;
        console.log('ID do usuário para persistência de dados:', this.currentUserId);
        // Carregar os dados após identificar o usuário
        this.loadBoardsFromApi();
      } else {
        // Se estava logado e agora não está mais
        if (this.currentUserId && this.currentUserId !== 'anonymous') {
          this.previousUserId = this.currentUserId;
          this.resetLocalBoard();
        }
        
        this.currentUserId = 'anonymous';
        console.log('Usuário não autenticado. Usando ID anônimo para persistência.');
        this.loadBoardsFromApi();
      }
    });
  }
  
  // Função para limpar o board local quando troca de usuário
  private resetLocalBoard(): void {
    console.log('Limpando board local antes de carregar dados do novo usuário');
    const emptyBoard: Board = {
      id: "",
      title: "Carregando...",
      columns: []
    };
    this.boardSubject.next(emptyBoard);
  }

  // Função para criar uma cópia profunda (deep clone) de um objeto
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  private loadBoardsFromApi(): void {
    // Se houve troca de usuário, é essencial garantir que o board anterior seja completamente limpo
    if (this.previousUserId) {
      console.log(`Troca de usuário detectada: ${this.previousUserId} -> ${this.currentUserId}`);
      console.log('Limpando completamente o board anterior antes de carregar o novo');
      
      // Resetar completamente o board para eliminar quaisquer vestígios do usuário anterior
      const emptyBoard: Board = {
        id: "",
        title: "Carregando dados do usuário...",
        columns: []
      };
      this.boardSubject.next(emptyBoard);
      
      // Esperar um momento para garantir que a UI atualize antes de fazer a chamada à API
      setTimeout(() => {
        this.fetchBoardsFromAPI();
      }, 100);
    } else {
      // Inicializar com o mockBoard apenas para feedback visual quando não há troca de usuário
      console.log('Inicializando com mockBoard para feedback visual');
      this.updateBoardState(this.deepClone(this.mockBoard));
      this.fetchBoardsFromAPI();
    }
  }
  
  // Método para extrair a lógica de busca na API e facilitar a manutenção
  private fetchBoardsFromAPI(): void {
    console.log(`Buscando boards da API para usuário: ${this.currentUserId}`);
    
    // Verificar se temos um token de autenticação antes de fazer a chamada
    const authToken = this.authService.getToken();
    if (!authToken) {
      console.warn('Não há token de autenticação disponível. Tentando carregar os boards mesmo assim...');
    } else {
      console.log('Token de autenticação disponível para a chamada à API');
    }
    
    this.boardGraphqlService.getBoards().pipe(
      tap(boards => {
        if (Array.isArray(boards)) {
          console.log(`Obteve ${boards.length} boards da API`);
          boards.forEach((board, index) => {
            console.log(`Board ${index + 1}: ID=${board.id}, Título=${board.title}, UserId=${board.userId || 'não definido'}, Colunas=${board.columns?.length || 0}`);
          });
        } else {
          console.warn('Resposta da API não é um array:', boards);
        }
      }),
      catchError(error => {
        console.error('Erro ao carregar boards:', error);
        
        // Verificar se é um erro de autenticação
        if (error.message?.includes('unauthorized') || 
            error.message?.includes('Unauthorized') || 
            error.networkError?.status === 401) {
          console.warn('Erro de autenticação. Verifique se o usuário está logado corretamente.');
          this.toastService.show('Erro de autenticação. Faça login novamente.', 'error');
        } else {
          this.toastService.show('Erro ao carregar dados do servidor. Criando um novo board.', 'warning');
        }
        
        // Caso de erro, criamos um novo board a partir do modelo
        return this.boardGraphqlService.createBoard(this.mockBoard.title).pipe(
          catchError(createError => {
            console.error('Erro ao criar board:', createError);
            this.toastService.show('Erro ao criar quadro no servidor.', 'error');
            return of(this.deepClone(this.mockBoard));
          })
        );
      }),
      switchMap(boards => {
        if (Array.isArray(boards) && boards.length > 0) {
          // Verificar se algum dos boards pertence ao usuário atual
          const userBoards = boards.filter(board => board.userId === this.currentUserId);
          if (userBoards.length > 0) {
            console.log(`Encontrado ${userBoards.length} boards pertencentes ao usuário ${this.currentUserId}`);
            return of(userBoards[0]);
          }
          
          // Se não encontrar boards específicos do usuário, usar o primeiro
          console.log('Board encontrado na API mas não pertence ao usuário atual. Usando primeiro board:', boards[0]);
          return of(boards[0]);
        } else if (!Array.isArray(boards) && boards.id) {
          // Se recebemos um único board (do createBoard)
          console.log('Board único recebido (provavelmente novo):', boards);
          return of(boards);
        } else {
          // Se não existir nenhum board, cria um novo baseado no mockBoard
          console.log('Nenhum quadro encontrado na API. Criando um novo...');
          return this.boardGraphqlService.createBoard(this.mockBoard.title).pipe(
            tap(newBoard => {
              console.log('Novo board criado na API com ID:', newBoard.id);
            }),
            catchError(error => {
              console.error('Erro ao criar board:', error);
              this.toastService.show('Erro ao criar quadro no servidor.', 'error');
              return of(this.deepClone(this.mockBoard));
            })
          );
        }
      })
    ).subscribe({
      next: (board) => {
        console.log('Board carregado/criado da API:', board);
        
        if (!board || !board.columns) {
          console.error('Board recebido da API é inválido:', board);
          this.toastService.show('Board recebido da API é inválido, usando board local.', 'warning');
          this.updateBoardState(this.deepClone(this.mockBoard));
          return;
        }
        
        // Log para debug
        console.log(`Atualizando board: ID=${board.id}, UserId=${board.userId || 'não definido'}, CurrentUserId=${this.currentUserId}`);
        
        // Atualizar o board no estado local
        this.updateBoardState(board);
        
        // Informar o usuário que os dados foram carregados com sucesso
        this.toastService.show('Dados carregados com sucesso!', 'success');
        
        // Atualizar o userId no board se estiver vazio ou diferente do usuário atual
        if (!board.userId || board.userId !== this.currentUserId) {
          console.log(`Board com userId ${board.userId || 'não definido'}. Atualizando para o usuário atual: ${this.currentUserId}`);
          this.boardGraphqlService.updateBoard(board.id, { title: board.title }).pipe(
            catchError(error => {
              console.error('Erro ao atualizar userId do board:', error);
              return of(null);
            })
          ).subscribe();
        }
        
        // Se o board não tem colunas, inicia a criação das colunas mockadas
        if (board.columns.length === 0) {
          console.log('Board está vazio. Criando colunas iniciais...');
          this.initializeBoardWithMockColumns(board.id);
        } else {
          console.log('Board já tem colunas:', board.columns.length);
        }
      },
      error: (error) => {
        console.error('Erro ao processar board:', error);
        this.toastService.show('Erro ao processar dados do servidor. Usando board local.', 'error');
        // Em caso de erro, usar o board mockado
        this.updateBoardState(this.deepClone(this.mockBoard));
      }
    });
  }

  // Método para inicializar o board com colunas mockadas
  private initializeBoardWithMockColumns(boardId: string): void {
    // Criando as colunas uma por uma do mockBoard
    this.mockBoard.columns.forEach((column, index) => {
      setTimeout(() => {
        const columnInput: Omit<Column, 'id' | 'cards'> = {
          title: column.title,
          color: column.color,
          cardLimit: column.cardLimit || 0
        };
        
        // Adicionando coluna
        this.addColumn(columnInput);
        
        // Se for a última coluna, após ela ser adicionada, vamos adicionar os cards
        if (index === this.mockBoard.columns.length - 1) {
          setTimeout(() => {
            this.initializeBoardWithMockCards();
          }, 1000);
        }
      }, index * 500); // Espaçamento de tempo entre cada adição de coluna
    });
  }
  
  // Método para inicializar as colunas com cards mockados
  private initializeBoardWithMockCards(): void {
    const board = this.getBoard();
    if (!board || !board.columns || board.columns.length === 0) return;
    
    // Para cada coluna do mockBoard
    this.mockBoard.columns.forEach((mockColumn, colIndex) => {
      // Encontramos a coluna correspondente no board atual
      const targetColumn = board.columns[colIndex];
      if (!targetColumn) return;
      
      // Para cada card da coluna mockada
      mockColumn.cards.forEach((mockCard, cardIndex) => {
        setTimeout(() => {
          // Garantir que a data esteja no formato correto
          let formattedDueDate;
          if (mockCard.dueDate) {
            formattedDueDate = this.formatDateForGraphQL(mockCard.dueDate);
          }
          
          const cardInput: Omit<Card, 'id'> = {
            title: mockCard.title,
            description: mockCard.description,
            tags: mockCard.tags,
            dueDate: formattedDueDate,
            order: cardIndex,
            attachments: mockCard.attachments
          };
          
          // Adicionando card
          this.addCard(targetColumn.id, cardInput);
        }, cardIndex * 300); // Espaçamento de tempo entre cada adição de card
      });
    });
  }

  private createMockBoard(): Board {
    // Criar um board mockado para uso offline
    return {
      id: "local_" + Date.now(),
      title: "Meu Quadro Kanban (Offline)",
      columns: [
        {
          id: "col_1",
          title: "A Fazer",
          color: "#5BC2E7",
          cards: [],
          cardLimit: 10
        },
        {
          id: "col_2",
          title: "Em Progresso",
          color: "#9966FF",
          cards: [],
          cardLimit: 5
        },
        {
          id: "col_3",
          title: "Concluído",
          color: "#47B04B",
          cards: [],
          cardLimit: 0
        }
      ]
    };
  }

  getBoard(): Board {
    return this.boardSubject.value;
  }

  getBoardObservable(): Observable<Board> {
    return this.boardSubject.asObservable();
  }

  updateBoard(board: Board): void {
    this.updateBoardState(this.deepClone(board));
  }

  addColumn(column: Omit<Column, 'id' | 'cards'>): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível adicionar coluna: board inválido');
      this.toastService.show('Erro ao adicionar coluna: board inválido.', 'error');
      return;
    }
    
    this.boardGraphqlService.addColumn(board.id, column).pipe(
      catchError(error => {
        console.error('Erro ao adicionar coluna:', error);
        this.toastService.show('Erro ao adicionar coluna.', 'error');
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        this.updateBoardState(updatedBoard);
        this.toastService.show('Coluna adicionada com sucesso!', 'success');
      }
    });
  }
  
  // Método para garantir a atualização consistente do estado do board
  private updateBoardState(board: Board): void {
    console.log('Atualizando estado do board:', board);
    console.log('Número de colunas:', board.columns?.length || 0);
    
    // Criar uma cópia profunda para evitar mutações não intencionais
    const boardCopy = this.deepClone(board);
    
    // Garantir que a data de criação do board seja tratada corretamente
    if (boardCopy.createdAt) {
      try {
        boardCopy.createdAt = this.formatDateForGraphQL(boardCopy.createdAt);
      } catch (error) {
        console.error('Erro ao processar data de criação do board:', error);
        boardCopy.createdAt = new Date().toISOString();
      }
    }
    
    // Processar todas as colunas e cards
    if (boardCopy.columns) {
      boardCopy.columns.forEach(column => {
        if (column.cards && Array.isArray(column.cards)) {
          // Verificar e remover cards undefined ou null
          column.cards = column.cards.filter(card => card && typeof card === 'object');
          
          // Garantir que todos os cards tenham um valor de ordem válido
          column.cards.forEach((card, index) => {
            if (card.order === undefined || card.order === null) {
              console.log(`Card ${card.id} sem ordem definida, configurando para ${index}`);
              card.order = index;
            }
          });
          
          // Limpar qualquer referência duplicada antes da ordenação
          const uniqueCardIds = new Set();
          column.cards = column.cards.filter(card => {
            if (!card.id) {
              console.warn('Card sem ID encontrado, ignorando');
              return false;
            }
            
            if (uniqueCardIds.has(card.id)) {
              console.warn(`Card duplicado encontrado: ${card.id}, removendo duplicata.`);
              return false;
            }
            uniqueCardIds.add(card.id);
            return true;
          });
          
          // Ordenar cards por ordem
          column.cards.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 0;
            const orderB = typeof b.order === 'number' ? b.order : 0;
            return orderA - orderB;
          });
          
          // Garantir que as ordens sejam sequenciais (0, 1, 2, ...)
          column.cards.forEach((card, index) => {
            if (card.order !== index) {
              console.log(`Ajustando ordem do card ${card.id} de ${card.order} para ${index}`);
              card.order = index;
            }
            
            // Garantir que o card tenha suas propriedades básicas
            if (!card.title || card.title.trim() === '') {
              console.warn(`Card ${card.id} sem título detectado, definindo título padrão`);
              card.title = 'Sem título';
            }
            
            if (!card.description) {
              card.description = '';
            }
            
            // Garantir que tags seja um array válido
            if (!card.tags || !Array.isArray(card.tags)) {
              card.tags = [];
            }
            
            // Garantir que attachments seja um array válido
            if (!card.attachments || !Array.isArray(card.attachments)) {
              card.attachments = [];
            }
          });
          
          // Processar as datas dos cards
          column.cards.forEach(card => {
            if (card.dueDate) {
              try {
                // Converter qualquer tipo de data para string ISO
                card.dueDate = this.formatDateForGraphQL(card.dueDate);
                if (!card.dueDate) {
                  card.dueDate = undefined;
                }
              } catch (error) {
                console.error(`Erro ao processar data em card ${card.id}:`, error);
                card.dueDate = undefined;
              }
            }
          });
        } else {
          // Se cards for undefined ou não for um array, inicializar como array vazio
          column.cards = [];
        }
      });
    }
    
    console.log('Estado do board após processamento:', boardCopy);
    
    // Notificar os observadores
    this.boardSubject.next(boardCopy);
  }

  updateColumn(column: Column): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível atualizar coluna: board inválido');
      this.toastService.show('Erro ao atualizar coluna: board inválido.', 'error');
      return;
    }
    
    console.log('Atualizando coluna:', column);
    
    // Antes de enviar para a API, atualizamos localmente para ter feedback imediato
    const columnIndex = board.columns.findIndex(col => col.id === column.id);
    if (columnIndex !== -1) {
      // Criar uma cópia profunda da coluna para evitar mutações não intencionais
      const updatedColumn = this.deepClone(column);
      
      // Ordenar cards pela propriedade de ordem antes de atualizar
      if (updatedColumn.cards && Array.isArray(updatedColumn.cards)) {
        // Certificar-se de que todos os cards têm ordem definida
        updatedColumn.cards.forEach((card, index) => {
          if (card.order === undefined || card.order === null) {
            card.order = index;
          }
        });
        
        // Ordenar os cards
        updatedColumn.cards.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 0;
          const orderB = typeof b.order === 'number' ? b.order : 0;
          return orderA - orderB;
        });
        
        // Recalcular ordens para garantir sequência consecutiva (0,1,2,...)
        updatedColumn.cards.forEach((card, index) => {
          card.order = index;
        });
      }
      
      // Atualizar a coluna no board local
      board.columns[columnIndex] = updatedColumn;
      this.updateBoardState(board);
    }
    
    // Criar uma lista de cards ordenados com suas ordens atualizadas
    const orderedCards = [...column.cards].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    });
    
    // Garantir ordens sequenciais
    orderedCards.forEach((card, index) => {
      card.order = index;
    });
    
    // Enviar atualização básica da coluna para a API
    this.boardGraphqlService.updateColumn(board.id, column.id, {
      title: column.title,
      color: column.color,
      cardLimit: column.cardLimit
    }).pipe(
      catchError(error => {
        console.error('Erro ao atualizar coluna:', error);
        this.toastService.show('Erro ao atualizar coluna.', 'error');
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        console.log('Coluna básica atualizada com sucesso:', updatedBoard);
      }
    });
    
    // Atualizar cada card individualmente para manter a ordem - usando os cards ordenados
    if (orderedCards && Array.isArray(orderedCards) && orderedCards.length > 0) {
      // Processar um card de cada vez com um pequeno atraso para evitar problemas de concorrência
      orderedCards.forEach((card, index) => {
        setTimeout(() => {
          // Verificar se o card ainda existe (segurança adicional)
          const currentBoard = this.getBoard();
          const currentColumn = currentBoard.columns.find(col => col.id === column.id);
          
          if (currentColumn && currentColumn.cards.some(c => c.id === card.id)) {
            console.log(`Atualizando card ${card.id} na coluna ${column.id} com ordem ${index}`);
            
            const cardInput = {
              title: card.title,
              description: card.description || '',
              order: index, // Usar o índice da lista ordenada
              tags: card.tags || [],
              dueDate: card.dueDate ? this.formatDateForGraphQL(card.dueDate) : undefined,
              attachments: card.attachments || []
            };
            
            this.boardGraphqlService.updateCard(
              currentBoard.id, 
              column.id,
              card.id,
              cardInput
            ).pipe(
              catchError(error => {
                console.error(`Erro ao atualizar ordem do card ${card.id}:`, error);
                return of(null);
              })
            ).subscribe(result => {
              if (result) {
                console.log(`Card ${card.id} atualizado para ordem ${index}`);
              }
            });
          }
        }, index * 200); // Adicionando atraso maior entre cada atualização para evitar condições de corrida
      });
      
      // Após todas as atualizações, recarregar o board
      setTimeout(() => {
        this.boardGraphqlService.getBoard(board.id).pipe(
          catchError(error => {
            console.error('Erro ao recarregar board após atualizações:', error);
            return of(null);
          })
        ).subscribe(updatedBoard => {
          if (updatedBoard) {
            console.log('Board recarregado após atualizações:', updatedBoard);
            this.updateBoardState(updatedBoard);
            this.toastService.show('Coluna atualizada com sucesso!', 'success');
          }
        });
      }, (orderedCards.length + 1) * 200); // Ajustando o tempo baseado no atraso de cada card
    } else {
      // Se não há cards, atualizar o board de qualquer maneira
      this.toastService.show('Coluna atualizada com sucesso!', 'success');
    }
  }
  
  // Método para atualizar apenas a ordem de um card sem exibir notificações
  private updateCardWithoutNotification(columnId: string, card: Card): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível atualizar card: board inválido');
      return;
    }
    
    // Verificar se o card e o ID são válidos
    if (!card || !card.id) {
      console.error('Card inválido para atualização');
      return;
    }
    
    // Para o input, criar um objeto com o que queremos atualizar
    // Importante: precisamos incluir o título que é obrigatório no backend
    const cardInput = {
      title: card.title, // O título é obrigatório para a API
      order: card.order,
      // Incluir outros campos obrigatórios se necessário
      description: card.description || ''
    };
    
    console.log(`Atualizando card ${card.id} na coluna ${columnId} com:`, cardInput);
    
    // Enviar atualização para o backend
    this.boardGraphqlService.updateCard(board.id, columnId, card.id, cardInput).pipe(
      catchError(error => {
        console.error('Erro ao atualizar ordem do card:', error);
        return of(null);
      })
    ).subscribe();
  }

  deleteColumn(columnId: string): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível excluir coluna: board inválido');
      this.toastService.show('Erro ao excluir coluna: board inválido.', 'error');
      return;
    }
    
    // Confirmação personalizada ao invés do confirm() nativo
    if (!confirm('Tem certeza que deseja arquivar esta coluna?')) {
      return;
    }
    
    // Aplicar otimisticamente a alteração no frontend antes da resposta do backend
    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) {
      this.toastService.show('Coluna não encontrada.', 'error');
      return;
    }
    
    // Criar cópia para otimização local
    const updatedColumns = [...board.columns];
    const removedColumn = updatedColumns.splice(columnIndex, 1)[0];
    
    // Atualizar o estado local imediatamente (otimisticamente)
    const optimisticBoard = {
      ...board,
      columns: updatedColumns
    };
    this.updateBoardState(optimisticBoard);
    
    // Exibir toast informativo
    this.toastService.show('Arquivando coluna...', 'info');
    
    // Enviar a requisição para o backend
    this.boardGraphqlService.deleteColumn(board.id, columnId).pipe(
      catchError(error => {
        // Em caso de erro, reverter a operação local
        console.error('Erro ao excluir coluna:', error);
        this.toastService.show('Erro ao excluir coluna.', 'error');
        
        // Restaurar o estado anterior
        optimisticBoard.columns.splice(columnIndex, 0, removedColumn);
        this.updateBoardState(optimisticBoard);
        
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        // Já atualizamos o estado local, apenas confirmar com uma mensagem de sucesso
        this.toastService.show('Coluna arquivada com sucesso!', 'success');
      }
    });
  }

  // Método para formatar data para GraphQL e Firestore
  private formatDateForGraphQL(date: string | Date): string {
    if (!date) {
      return '';
    }
    
    try {
      // Se já for uma string ISO, verificar e retornar
      if (typeof date === 'string') {
        // Verificar se é uma string ISO válida
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          return d.toISOString();
        }
        return '';
      }
      
      // Se for um objeto Date, converter para string ISO
      if (date instanceof Date) {
        return date.toISOString();
      }
      
      // Se for um objeto Firebase Timestamp
      if (typeof date === 'object') {
        if ('_seconds' in (date as any) && '_nanoseconds' in (date as any)) {
          const seconds = (date as any)._seconds;
          return new Date(seconds * 1000).toISOString();
        }
        
        if ('seconds' in (date as any)) {
          return new Date((date as any).seconds * 1000).toISOString();
        }
        
        if ('toDate' in (date as any) && typeof (date as any).toDate === 'function') {
          return (date as any).toDate().toISOString();
        }
      }
      
      // Se nenhum dos formatos acima, retornar string vazia
      console.error('Formato de data não reconhecido:', date);
      return '';
    } catch (error) {
      console.error('Erro ao formatar data para GraphQL:', error, date);
      return '';
    }
  }

  addCard(columnId: string, card: Omit<Card, 'id'>): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível adicionar card: board inválido');
      this.toastService.show('Erro ao adicionar card: board inválido.', 'error');
      return;
    }
    
    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      console.error(`Coluna com ID ${columnId} não encontrada`);
      this.toastService.show('Erro ao adicionar card: coluna não encontrada.', 'error');
      return;
    }
    
    // Definir a ordem para o novo card (final da lista)
    const newCard = { ...card };
    if (column.cards && column.cards.length > 0) {
      const maxOrder = Math.max(...column.cards.map(c => c.order || 0));
      newCard.order = maxOrder + 1;
    } else {
      newCard.order = 0;
    }
    
    // Formatar a data para string ISO antes de enviar
    if (newCard.dueDate) {
      newCard.dueDate = this.formatDateForGraphQL(newCard.dueDate);
    }
    
    this.boardGraphqlService.addCard(board.id, columnId, newCard).pipe(
      catchError(error => {
        console.error('Erro ao adicionar card:', error);
        this.toastService.show('Erro ao adicionar card.', 'error');
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        this.updateBoardState(updatedBoard);
        this.toastService.show('Card adicionado com sucesso!', 'success');
      }
    });
  }

  updateCard(columnId: string, card: Card): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível atualizar card: board inválido');
      this.toastService.show('Erro ao atualizar card: board inválido.', 'error');
      return;
    }
    
    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      console.error(`Coluna com ID ${columnId} não encontrada`);
      this.toastService.show('Erro ao atualizar card: coluna não encontrada.', 'error');
      return;
    }
    
    // Verificar se o card existe
    const existingCardIndex = column.cards.findIndex(c => c.id === card.id);
    if (existingCardIndex === -1) {
      console.error(`Card com ID ${card.id} não encontrado na coluna ${columnId}`);
      this.toastService.show('Erro ao atualizar card: card não encontrado.', 'error');
      return;
    }
    
    // Garantir que todos os campos necessários existam
    if (card.order === undefined || card.order === null) {
      card.order = existingCardIndex;
    }
    
    if (!card.tags) {
      card.tags = [];
    }
    
    if (!card.attachments) {
      card.attachments = [];
    }
    
    // Formatar a data para GraphQL se existir
    const formattedCard = {
      ...card,
      dueDate: card.dueDate ? this.formatDateForGraphQL(card.dueDate) : undefined
    };
    
    console.log('Atualizando card:', formattedCard);
    
    this.boardGraphqlService.updateCard(board.id, columnId, card.id, formattedCard)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar card:', error);
          this.toastService.show('Erro ao atualizar card.', 'error');
          return of(null);
        })
      )
      .subscribe(updatedBoard => {
        if (updatedBoard) {
          this.updateBoardState(updatedBoard);
          this.toastService.show('Card atualizado com sucesso!', 'success');
        }
      });
  }

  deleteCard(columnId: string, cardId: string): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível excluir card: board inválido');
      this.toastService.show('Erro ao excluir card: board inválido.', 'error');
      return;
    }
    
    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      console.error(`Coluna com ID ${columnId} não encontrada`);
      this.toastService.show('Erro ao excluir card: coluna não encontrada.', 'error');
      return;
    }
    
    // Verificar se o card existe
    const existingCardIndex = column.cards.findIndex(c => c.id === cardId);
    if (existingCardIndex === -1) {
      console.error(`Card com ID ${cardId} não encontrado na coluna ${columnId}`);
      this.toastService.show('Erro ao excluir card: card não encontrado.', 'error');
      return;
    }
    
    // Fazer backup do board atual para casos de erro
    const originalBoard = this.deepClone(board);
    
    // Criar uma cópia do board para manipulação
    const updatedBoard = this.deepClone(board);
    const updatedColumn = updatedBoard.columns.find(col => col.id === columnId);
    
    if (!updatedColumn) {
      console.error('Coluna não encontrada na cópia do board');
      this.toastService.show('Erro ao excluir card: erro interno.', 'error');
      return;
    }
    
    console.log(`Excluindo card ${cardId} da coluna ${columnId}. Estado antes da exclusão:`, 
      updatedColumn.cards.map(c => ({ id: c.id, title: c.title, order: c.order })));
    
    // Primeiro, filtrar o card a ser removido
    const newCards = updatedColumn.cards.filter(card => card.id !== cardId);
    
    // Depois, reordenar os cards restantes
    newCards.forEach((card, index) => {
      card.order = index;
    });
    
    console.log(`Cards após exclusão e reordenação:`, 
      newCards.map(c => ({ id: c.id, title: c.title, order: c.order })));
    
    // Substituir o array de cards por completo
    updatedColumn.cards = newCards;
    
    // Atualizar o estado local imediatamente para feedback visual
    this.updateBoardState(updatedBoard);
    
    // Enviar a solicitação para o servidor
    this.boardGraphqlService.deleteCard(board.id, columnId, cardId).pipe(
      catchError(error => {
        console.error('Erro ao excluir card:', error);
        this.toastService.show('Erro ao excluir card. Revertendo alterações.', 'error');
        
        // Em caso de erro, reverter para o estado original
        this.updateBoardState(originalBoard);
        return of(null);
      })
    ).subscribe(serverUpdatedBoard => {
      if (serverUpdatedBoard) {
        // Processar os dados antes de atualizar o estado para garantir que os títulos sejam preservados
        const processedBoard = this.deepClone(serverUpdatedBoard);
        
        // Garantir que todos os cards tenham títulos
        processedBoard.columns.forEach(col => {
          if (col.cards && Array.isArray(col.cards)) {
            col.cards.forEach(card => {
              if (!card.title || card.title.trim() === '') {
                console.warn(`Card ${card.id} sem título retornado do servidor, preservando título local`);
                
                // Tentar encontrar o card no board local para manter o título
                const localColumn = updatedBoard.columns.find(c => c.id === col.id);
                const localCard = localColumn?.cards.find(c => c.id === card.id);
                
                if (localCard && localCard.title) {
                  card.title = localCard.title;
                } else {
                  card.title = 'Sem título';
                }
              }
            });
          }
        });
        
        // Atualizar o estado com o board processado
        this.updateBoardState(processedBoard);
        this.toastService.show('Card excluído com sucesso!', 'success');
      } else {
        // Se o servidor não retornar dados, buscar o board atualizado
        this.boardGraphqlService.getBoard(board.id).subscribe(freshBoard => {
          if (freshBoard) {
            // Processar o board recebido antes de atualizar o estado
            const processedBoard = this.deepClone(freshBoard);
            
            // Garantir que todos os cards tenham títulos
            processedBoard.columns.forEach(col => {
              if (col.cards && Array.isArray(col.cards)) {
                col.cards.forEach(card => {
                  if (!card.title || card.title.trim() === '') {
                    // Tentar encontrar o card no board local para manter o título
                    const localColumn = updatedBoard.columns.find(c => c.id === col.id);
                    const localCard = localColumn?.cards.find(c => c.id === card.id);
                    
                    if (localCard && localCard.title) {
                      card.title = localCard.title;
                    } else {
                      card.title = 'Sem título';
                    }
                  }
                });
              }
            });
            
            this.updateBoardState(processedBoard);
          }
        });
      }
    });
  }

  moveCard(sourceColumnId: string, targetColumnId: string, cardId: string, newOrder: number): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível mover card: board inválido');
      this.toastService.show('Erro ao mover card: board inválido.', 'error');
      return;
    }
    
    // Versão anterior do board para reversão se necessário
    const originalBoard = this.deepClone(board);
    
    try {
      // Buscar as colunas de origem e destino
      const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
      if (!sourceColumn) {
        throw new Error(`Coluna de origem com ID ${sourceColumnId} não encontrada`);
      }
      
      const targetColumn = board.columns.find(col => col.id === targetColumnId);
      if (!targetColumn) {
        throw new Error(`Coluna de destino com ID ${targetColumnId} não encontrada`);
      }
      
      // Verificar se o card está na coluna de origem
      let cardToMove;
      let cardIndex = sourceColumn.cards.findIndex(c => c.id === cardId);
      
      // Verificar se estamos movendo dentro da mesma coluna
      if (sourceColumnId === targetColumnId) {
        console.log(`Movendo card ${cardId} dentro da mesma coluna ${sourceColumnId} para posição ${newOrder}`);
        
        // Garantir que encontramos o card
        if (cardIndex === -1) {
          throw new Error(`Card com ID ${cardId} não encontrado na coluna ${sourceColumnId}`);
        }
        
        // Fazer uma cópia do card para modificar
        cardToMove = this.deepClone(sourceColumn.cards[cardIndex]);
        
        // Remover o card da posição atual
        sourceColumn.cards.splice(cardIndex, 1);
        
        // Inserir o card na nova posição
        const safeNewOrder = Math.min(newOrder, sourceColumn.cards.length);
        sourceColumn.cards.splice(safeNewOrder, 0, cardToMove);
        
        // Atualizar a ordem de todos os cards
        sourceColumn.cards.forEach((card, idx) => {
          card.order = idx;
        });
        
        // Atualizar localmente primeiro para feedback imediato
        this.updateBoardState(board);
        
        // Agora enviar a coluna atualizada para a API
        // Isso garantirá que todas as ordens sejam atualizadas
        this.updateColumn(sourceColumn);
        
        return;
      }
      
      // Se o card não está na coluna de origem e as colunas são diferentes,
      // verificar se já está na coluna de destino
      if (cardIndex === -1 && sourceColumnId !== targetColumnId) {
        cardIndex = targetColumn.cards.findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
          console.log(`Card ${cardId} já está na coluna de destino ${targetColumnId}, apenas reordenando`);
          // O card já está na coluna de destino, então é só uma questão de reordenar
          cardToMove = this.deepClone(targetColumn.cards[cardIndex]);
          
          // Processar as datas do card antes de manipular
          if (cardToMove.dueDate) {
            cardToMove.dueDate = this.formatDateForGraphQL(cardToMove.dueDate);
          }
          
          // Remover o card da posição atual
          targetColumn.cards.splice(cardIndex, 1);
          
          // Inserir na nova posição
          const safeIndex = Math.min(newOrder, targetColumn.cards.length);
          targetColumn.cards.splice(safeIndex, 0, cardToMove);
          
          // Atualizar ordens
          targetColumn.cards.forEach((card, idx) => {
            card.order = idx;
          });
          
          // Atualizar a coluna no backend com as novas ordens
          this.updateColumn(targetColumn);
          return;
        }
      }
      
      // Se ainda não encontramos o card, é um erro
      if (cardIndex === -1) {
        console.error(`Card com ID ${cardId} não encontrado na coluna ${sourceColumnId} nem na coluna ${targetColumnId}`);
        
        // Tentar localizar o card em qualquer coluna para um diagnóstico melhor
        const cardLocation = board.columns.find(col => 
          col.cards.some(c => c.id === cardId)
        );
        
        if (cardLocation) {
          console.log(`O card ${cardId} foi encontrado na coluna ${cardLocation.id}. Parece que houve uma inconsistência.`);
          throw new Error(`Card encontrado na coluna ${cardLocation.id}, mas esperado na coluna ${sourceColumnId}`);
        } else {
          throw new Error(`Card com ID ${cardId} não encontrado em nenhuma coluna do board`);
        }
      }
      
      // Fazer clone profundo do card para evitar manipulações indesejadas
      cardToMove = this.deepClone(sourceColumn.cards[cardIndex]);
      
      // Processar as datas do card antes de enviar para o GraphQL
      if (cardToMove.dueDate) {
        cardToMove.dueDate = this.formatDateForGraphQL(cardToMove.dueDate);
      }
      
      console.log(`Movendo card ${cardId} da coluna ${sourceColumnId} para ${targetColumnId} na posição ${newOrder}`);
      
      // Fazer a chamada para a API com tratamento detalhado de erros
      this.boardGraphqlService.moveCard(
        board.id,
        sourceColumnId,
        targetColumnId,
        cardId,
        newOrder
      ).pipe(
        catchError(error => {
          console.error('Erro ao mover card:', error);
          
          // Mensagem de erro específica baseada no tipo de erro
          let errorMessage = 'Erro ao mover card.';
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMsg = String(error.message);
            if (errorMsg.includes('não encontrado')) {
              errorMessage = 'Erro: Card ou coluna não encontrados no servidor.';
            } else if (errorMsg.includes('acesso')) {
              errorMessage = 'Erro: Sem permissão para mover este card.';
            } else if (errorMsg.includes('network')) {
              errorMessage = 'Erro de conexão. Verifique sua internet.';
            } else if (errorMsg.includes('serialize') || errorMsg.includes('date')) {
              errorMessage = 'Erro com formato de data. Tente novamente.';
            }
          }
          
          this.toastService.show(`${errorMessage} Revertendo alterações.`, 'error');
          
          // Reverter para o estado anterior em caso de erro
          this.updateBoardState(originalBoard);
          return of(null);
        })
      ).subscribe(serverUpdatedBoard => {
        if (serverUpdatedBoard) {
          console.log('Card movido com sucesso no servidor.');
          
          // Atualizar com os dados completos do servidor
          this.updateBoardState(serverUpdatedBoard);
          this.toastService.show('Card movido com sucesso!', 'success');
        }
      });
    } catch (error: unknown) {
      console.error('Erro ao processar movimento de card:', error);
      let errorMessage = 'Falha ao mover card';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.toastService.show(`Erro: ${errorMessage}`, 'error');
      
      // Reverter alterações locais
      this.updateBoardState(originalBoard);
    }
  }

  createBoard(title: string): void {
    this.boardGraphqlService.createBoard(title).pipe(
      catchError(error => {
        console.error('Erro ao criar board via API:', error);
        
        // Fallback: criar localmente
        const newBoard = this.createMockBoard();
        newBoard.title = title;
        this.updateBoardState(newBoard);
        this.toastService.show('Quadro criado localmente', 'warning');
        
        return of(newBoard);
      })
    ).subscribe(newBoard => {
      this.updateBoardState(newBoard);
      this.toastService.show('Quadro criado com sucesso', 'success');
    });
  }

  // Método para limpar os dados do board no localStorage
  public clearBoardData(): void {
    console.log('CLEARDBOARDDATA: Iniciando limpeza do quadro');
    
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('CLEARDBOARDDATA: Não é possível limpar o board: board inválido');
      this.toastService.show('Erro ao limpar quadro: board inválido.', 'error');
      return;
    }
    
    console.log('CLEARDBOARDDATA: Board encontrado, ID:', board.id, 'Título:', board.title);
    
    // Guardar informações essenciais do board
    const boardId = board.id;
    const boardTitle = board.title;
    
    // Criar cópia do board atual para caso de erro
    const originalBoard = this.deepClone(board);
    
    // Criar um board vazio com o mesmo ID e título para atualização local imediata
    const emptyBoard: Board = {
      id: boardId,
      title: boardTitle,
      columns: [],
      userId: board.userId, // Preservar o userId para manter a propriedade no board
      createdAt: board.createdAt // Preservar a data de criação original
    };
    
    console.log('CLEARDBOARDDATA: Atualizando estado local com board vazio');
    
    // Atualizar o estado local primeiro para feedback imediato
    this.updateBoardState(emptyBoard);
    
    console.log('CLEARDBOARDDATA: Chamando resetBoard do GraphQL service');
    
    // Enviar requisição para o backend usando a nova mutation resetBoard
    this.boardGraphqlService.resetBoard(boardId, boardTitle).pipe(
      tap(response => {
        console.log('CLEARDBOARDDATA: Resposta recebida do resetBoard:', response);
      }),
      catchError(error => {
        console.error('CLEARDBOARDDATA: Erro ao limpar quadro no servidor:', error);
        this.toastService.show('Erro ao limpar quadro no servidor. Restaurando estado anterior.', 'error');
        
        // Restaurar o estado original em caso de erro
        this.updateBoardState(originalBoard);
        
        // Tentar uma abordagem alternativa se a API falhar
        setTimeout(() => {
          console.log('CLEARDBOARDDATA: Tentando abordagem alternativa...');
          // Tentar a versão antiga que usava updateBoard
          this.boardGraphqlService.updateBoard(boardId, { title: boardTitle }).subscribe({
            next: (updatedBoard) => {
              console.log('CLEARDBOARDDATA: Atualização alternativa bem-sucedida:', updatedBoard);
              
              // Garantir que a resposta tenha colunas vazias
              if (updatedBoard && updatedBoard.columns && updatedBoard.columns.length > 0) {
                updatedBoard.columns = [];
              }
              
              this.updateBoardState(updatedBoard || emptyBoard);
              this.toastService.show('Quadro limpo com sucesso!', 'success');
            },
            error: (updateError) => {
              console.error('CLEARDBOARDDATA: Erro na atualização alternativa:', updateError);
              this.toastService.show('Não foi possível limpar o quadro. Tente novamente mais tarde.', 'error');
            }
          });
        }, 1000);
        
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        console.log('CLEARDBOARDDATA: Board resetado com sucesso, atualizando estado local');
        
        // Garantir que as colunas estão realmente vazias (dupla verificação)
        if (updatedBoard.columns && updatedBoard.columns.length > 0) {
          console.warn('CLEARDBOARDDATA: Board ainda contém colunas após reset, forçando remoção local');
          updatedBoard.columns = [];
        }
        
        // Atualizar o board com os dados do servidor
        this.updateBoardState(updatedBoard);
        this.toastService.show('Quadro limpo com sucesso!', 'success');
      } else {
        console.log('CLEARDBOARDDATA: Nenhum board retornado do servidor');
        // Manter o estado vazio que já atualizamos localmente
      }
    });
  }

  // Método público para forçar o carregamento do board
  public loadBoardData(): void {
    console.log('Forçando o carregamento do board...');
    this.loadBoardsFromApi();
  }

  updateCardOrder(columnId: string, cardId: string, newOrder: number): void {
    const board = this.getBoard();
    
    if (!board || !board.id) {
      console.error('Não é possível atualizar ordem do card: board inválido');
      this.toastService.show('Erro ao atualizar ordem do card: board inválido.', 'error');
      return;
    }
    
    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      console.error(`Coluna com ID ${columnId} não encontrada`);
      this.toastService.show('Erro ao atualizar ordem do card: coluna não encontrada.', 'error');
      return;
    }
    
    // Verificar se o card existe na coluna
    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      console.error(`Card com ID ${cardId} não encontrado na coluna ${columnId}`);
      this.toastService.show('Erro ao atualizar ordem do card: card não encontrado.', 'error');
      return;
    }
    
    // Copiar o array de cards para não modificar o original diretamente
    const updatedCards = [...column.cards];
    
    // Remover o card da posição atual
    const cardToMove = this.deepClone(updatedCards[cardIndex]);
    updatedCards.splice(cardIndex, 1);
    
    // Garantir que a nova ordem esteja dentro dos limites
    const safeNewOrder = Math.min(Math.max(0, newOrder), updatedCards.length);
    
    // Inserir o card na nova posição
    updatedCards.splice(safeNewOrder, 0, cardToMove);
    
    // Atualizar a ordem de todos os cards
    updatedCards.forEach((card, idx) => {
      card.order = idx;
    });
    
    // Atualizar a coluna no board
    column.cards = updatedCards;
    
    // Atualizar localmente primeiro para feedback imediato
    this.updateBoardState(board);
    
    // Usar o serviço GraphQL para mover o card para a nova posição
    this.boardGraphqlService.moveCard(
      board.id,
      columnId,  // sourceColumnId
      columnId,  // targetColumnId (mesmo ID pois estamos na mesma coluna)
      cardId,
      safeNewOrder
    ).pipe(
      catchError(error => {
        console.error(`Erro ao atualizar ordem do card ${cardId}:`, error);
        this.toastService.show('Erro ao atualizar ordem do card. Tentando novamente...', 'error');
        
        // Em caso de falha, tentar usar o método updateColumn como alternativa
        setTimeout(() => {
          this.updateColumn(column);
        }, 500);
        
        return of(null);
      })
    ).subscribe(updatedBoard => {
      if (updatedBoard) {
        console.log('Ordem do card atualizada com sucesso no backend:', updatedBoard);
        this.updateBoardState(updatedBoard);
        this.toastService.show('Ordem do card atualizada com sucesso!', 'success');
      } else {
        // Log para depuração
        console.log('Não foi recebido um board atualizado do backend após moveCard');
      }
    });
  }

  // Cleanup das subscriptions quando o serviço é destruído
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

