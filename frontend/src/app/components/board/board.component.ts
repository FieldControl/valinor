import { Component, type OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { type CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop"
import { ColumnComponent } from "../column/column.component"
import { CardModalComponent } from "../card-modal/card-modal.component"
import { ToastComponent } from "../toast/toast.component"
import type { Board, Card, Column } from "../../models/board.model"
import { BoardService } from "../../services/board.service"
import { ToastService } from "../../services/toast.service"
import { AuthService } from "../../services/auth.service"
import { Subscription, combineLatest } from "rxjs"
import { User } from "@angular/fire/auth"

@Component({
  selector: "app-board",
  standalone: true,
  imports: [CommonModule, DragDropModule, ColumnComponent, CardModalComponent, ToastComponent],
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board = { id: "", title: "", columns: [] }
  activeColumn: Column | null = null
  activeCard: Card | null = null
  showCardModal = false
  isEditMode = false
  isLoading = true
  connectedDropLists: string[] = []
  
  // Variáveis para controle do modal de confirmação
  showResetConfirmation = false;
  
  private boardSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  public currentUser: User | null = null;

  constructor(
    private boardService: BoardService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Monitorar mudanças de usuário
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      // Se o usuário mudou, recarregar o board
      if (this.currentUser?.uid !== user?.uid) {
        console.log('Usuário mudou, recarregando quadro...');
        this.currentUser = user;
        this.loadBoard();
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadBoard(): void {
    this.isLoading = true;
    console.log('BoardComponent: Iniciando carregamento do quadro');
    
    // Limpar completamente o board atual
    this.board = { id: "", title: "Carregando...", columns: [] };
    
    // Limpar a inscrição anterior, se existir
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
      this.boardSubscription = null;
    }
    
    // Verificar se estamos autenticados
    const token = this.authService.getToken();
    const userEmail = this.authService.userEmail;
    console.log(`BoardComponent: Estado da autenticação: Token=${token ? 'Presente' : 'Ausente'}, Email=${userEmail || 'N/A'}`);
    
    // Forçar o carregamento do board do backend
    console.log('BoardComponent: Forçando recarga de dados do servidor');
    this.boardService.loadBoardData();
    
    // Inscrever-se no observable do board
    this.boardSubscription = this.boardService.getBoardObservable().subscribe({
      next: (board) => {
        console.log('BoardComponent: Dados recebidos do BoardService');
        console.log(`BoardComponent: ID=${board.id}, Título=${board.title}, Colunas=${board.columns?.length || 0}`);
        
        // Se o board ainda não tem ID, provavelmente ainda está carregando
        if (!board.id || board.id === "") {
          console.log('BoardComponent: Board sem ID, aguardando dados completos...');
          return;
        }
        
        // Guardar a referência do board atualizado
        this.board = board;
        
        // Atualizar as listas conectadas
        this.updateConnectedLists();
        
        // Adicionar verificação para caso especial de board vazio
        if (board.columns.length === 0 && !this.isLoading) {
          console.log('BoardComponent: Board está vazio, sugerindo adicionar colunas');
          this.toastService.show('Seu quadro está vazio. Adicione colunas usando o botão "Adicionar Coluna".', 'info');
        }
        
        // Marcar como carregado
        this.isLoading = false;
        
        // Forçar detecção de mudanças
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('BoardComponent: Erro ao carregar o quadro:', error);
        this.toastService.show('Erro ao carregar o quadro. Tente recarregar a página.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateConnectedLists(): void {
    this.connectedDropLists = this.board.columns.map(col => `list-${col.id}`)
    console.log('Listas conectadas:', this.connectedDropLists);
  }

  getConnectedLists(currentId: string): string[] {
    // Return all lists except the current one
    return this.connectedDropLists.filter(id => id !== `list-${currentId}`)
  }

  onAddColumn(): void {
    console.log('Adicionando coluna');
    
    const newColumn: Omit<Column, 'id' | 'cards'> = {
      title: "Nova Coluna",
      color: "#5BC2E7", // Cor padrão azul
      cardLimit: 0 // Sem limite
    };

    this.boardService.addColumn(newColumn);
  }

  onColumnUpdated(column: Column): void {
    console.log('Atualizando coluna:', column);
    this.boardService.updateColumn(column)
  }

  onColumnDeleted(columnId: string): void {
    console.log('Excluindo coluna:', columnId);
    this.boardService.deleteColumn(columnId)
    this.updateConnectedLists()
  }

  onCardDeleted(data: { cardId: string; columnId: string }): void {
    console.log('Excluindo card:', data);
    
    // Fazer uma cópia do estado atual do board antes da exclusão
    const originalBoard = JSON.parse(JSON.stringify(this.board));
    
    // Chamar o serviço para excluir o card
    this.boardService.deleteCard(data.columnId, data.cardId);
    
    // Verificar se após um curto período os cards ainda existem
    setTimeout(() => {
      // Obter o board atualizado
      const currentBoard = this.boardService.getBoard();
      
      // Verificar se há cards sem título
      let problemFound = false;
      currentBoard.columns.forEach(column => {
        column.cards.forEach(card => {
          if (!card.title || card.title.trim() === '') {
            console.warn(`Card ${card.id} na coluna ${column.id} ficou sem título após exclusão`);
            problemFound = true;
            
            // Tentar recuperar o título do board original
            const originalColumn = originalBoard.columns.find((col: any) => col.id === column.id);
            if (originalColumn) {
              const originalCard = originalColumn.cards.find((c: any) => c.id === card.id);
              if (originalCard && originalCard.title) {
                console.log(`Recuperando título do card ${card.id} do estado anterior`);
                card.title = originalCard.title;
              } else {
                card.title = 'Sem título';
              }
            } else {
              card.title = 'Sem título';
            }
          }
        });
      });
      
      // Se encontrou problemas, forçar atualização do board
      if (problemFound) {
        console.log('Problemas com títulos encontrados, atualizando estado do board');
        this.boardService.updateBoard(currentBoard);
      }
    }, 500);
  }

  onAddCard(column: Column): void {
    console.log('Adicionando card à coluna:', column);
    this.activeColumn = column
    this.activeCard = null
    this.isEditMode = false
    this.showCardModal = true
  }

  onEditCard(data: { card: Card; column: Column }): void {
    console.log('Editando card:', data);
    this.activeCard = data.card
    this.activeColumn = data.column
    this.isEditMode = true
    this.showCardModal = true
  }

  onCardSaved(card: Card): void {
    console.log('Salvando card:', card);
    
    if (!this.activeColumn) {
      console.error('Nenhuma coluna ativa ao tentar salvar o card');
      return;
    }

    // Garantir que a ordem seja sempre um número
    const cardWithNumberOrder = {
      ...card,
      order: typeof card.order === 'number' ? card.order : 0
    };

    if (this.isEditMode && this.activeCard) {
      // Update existing card
      console.log('Atualizando card existente');
      this.boardService.updateCard(this.activeColumn.id, cardWithNumberOrder);
    } else {
      // Add new card
      console.log('Adicionando novo card');
      if (!cardWithNumberOrder.order) {
        cardWithNumberOrder.order = this.activeColumn.cards.length;
      }
      this.boardService.addCard(this.activeColumn.id, cardWithNumberOrder);
    }

    this.closeCardModal();
  }

  closeCardModal(): void {
    this.showCardModal = false
    this.activeCard = null
    this.activeColumn = null
  }

  onDrop(event: CdkDragDrop<Card[]>): void {
    console.log('Evento de drag-and-drop:', event);
    
    try {
      const sourceColumnId = event.previousContainer.id.replace('list-', '');
      const targetColumnId = event.container.id.replace('list-', '');
      
      // Buscar as colunas de origem e destino
      const sourceColumn = this.board.columns.find(col => col.id === sourceColumnId);
      const targetColumn = this.board.columns.find(col => col.id === targetColumnId);
      
      // Verificar se ambas as colunas foram encontradas
      if (!sourceColumn || !targetColumn) {
        console.error('Colunas não encontradas:', sourceColumnId, targetColumnId);
        this.toastService.show('Erro ao mover card: coluna não encontrada.', 'error');
        return;
      }
      
      // Garantir que arrays de cards existem
      if (!Array.isArray(sourceColumn.cards)) {
        sourceColumn.cards = [];
      }
      
      if (!Array.isArray(targetColumn.cards)) {
        targetColumn.cards = [];
      }
      
      // Se a coluna de origem estiver vazia, não há nada para mover
      if (sourceColumn.cards.length === 0) {
        console.warn('Coluna de origem está vazia, nada para mover');
        return;
      }
      
      // Verificar se temos os dados do card que está sendo arrastado
      if (!event.item.data || !event.item.data.id) {
        console.error('Dados do card não encontrados no evento de drag', event.item);
        // Tentar usar o card no índice anterior
        if (event.previousIndex >= 0 && event.previousIndex < sourceColumn.cards.length) {
          event.item.data = sourceColumn.cards[event.previousIndex];
        } else {
          this.toastService.show('Erro ao mover card: dados do card não encontrados.', 'error');
          return;
        }
      }
      
      // Obter o ID do card diretamente dos dados do item arrastado
      const cardId = event.item.data.id;
      console.log('Card ID obtido dos dados do item:', cardId);
      
      // Verificar se o card existe em qualquer coluna (verificação de segurança)
      let cardFound = false;
      let cardLocation = '';
      
      // Buscar o card em todas as colunas
      for (const col of this.board.columns) {
        if (col.cards.some(c => c.id === cardId)) {
          cardFound = true;
          cardLocation = col.id;
          break;
        }
      }
      
      if (!cardFound) {
        console.error(`Card com ID ${cardId} não encontrado em nenhuma coluna do board`);
        this.toastService.show('Erro ao mover card: card não encontrado. Tente recarregar a página.', 'error');
        return;
      }
      
      console.log(`Card encontrado na coluna: ${cardLocation}`);
      
      // Recriar o board e as colunas para garantir consistência
      const freshBoard = this.deepClone(this.board);
      const freshSourceColumn = freshBoard.columns.find(col => col.id === sourceColumnId);
      const freshTargetColumn = freshBoard.columns.find(col => col.id === targetColumnId);
      
      if (!freshSourceColumn || !freshTargetColumn) {
        console.error('Erro ao criar cópias das colunas para operação segura');
        return;
      }
      
      // Ordenar cards antes de processar
      const sortedSourceCards = [...freshSourceColumn.cards].sort((a, b) => 
        (typeof a.order === 'number' ? a.order : 0) - (typeof b.order === 'number' ? b.order : 0)
      );
      
      const sortedTargetCards = [...freshTargetColumn.cards].sort((a, b) => 
        (typeof a.order === 'number' ? a.order : 0) - (typeof b.order === 'number' ? b.order : 0)
      );
      
      // Se estamos na mesma coluna (reordenando)
      if (sourceColumnId === targetColumnId) {
        console.log('Reordenando cards na mesma coluna');
        
        // Encontrar o card nos cards ordenados
        const cardIndex = sortedSourceCards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
          console.error(`Card ${cardId} não encontrado na coluna ${sourceColumnId}`);
          this.toastService.show('Erro ao reordenar card. Tente recarregar a página.', 'error');
          return;
        }
        
        // Verificar se os índices são válidos
        if (event.currentIndex < 0 || event.currentIndex > sortedSourceCards.length) {
          event.currentIndex = 0;
        }
        
        // Aplicar mudança na UI imediatamente usando o moveItemInArray
        moveItemInArray(sortedSourceCards, cardIndex, event.currentIndex);
        
        // Atualizar ordens
        sortedSourceCards.forEach((card, index) => {
          card.order = index;
        });
        
        // Atualizar a coluna com as novas ordens
        freshSourceColumn.cards = sortedSourceCards;
        
        // Atualizar o board local primeiro
        this.board = freshBoard;
        
        // Enviar os dados para o backend para persistência
        // Usar updateCardOrder que foi otimizado para reordenação dentro da mesma coluna
        setTimeout(() => {
          this.boardService.updateCardOrder(sourceColumnId, cardId, event.currentIndex);
        }, 0);
      }
      // Movendo entre colunas diferentes
      else {
        console.log('Movendo card entre colunas');
        
        // Encontrar o card na coluna de origem ou destino
        let cardToMove;
        let sourceCardIndex = sortedSourceCards.findIndex(card => card.id === cardId);
        
        // Se não encontrou na origem, procurar na coluna de destino
        if (sourceCardIndex === -1) {
          const targetCardIndex = sortedTargetCards.findIndex(card => card.id === cardId);
          if (targetCardIndex !== -1) {
            cardToMove = sortedTargetCards[targetCardIndex];
            sortedTargetCards.splice(targetCardIndex, 1);
          } else {
            console.error(`Card ${cardId} não encontrado em nenhuma das colunas`);
            this.toastService.show('Erro ao mover card. Tente recarregar a página.', 'error');
            return;
          }
        } else {
          cardToMove = sortedSourceCards[sourceCardIndex];
          // Remover da coluna de origem
          sortedSourceCards.splice(sourceCardIndex, 1);
        }
        
        // Fazer clone do card
        cardToMove = this.deepClone(cardToMove);
        
        // Verificar se o índice de destino está dentro dos limites
        let safeCurrentIndex = event.currentIndex;
        if (event.currentIndex < 0 || event.currentIndex > sortedTargetCards.length) {
          safeCurrentIndex = sortedTargetCards.length;
        }
        
        // Adicionar card na posição correta na coluna de destino
        sortedTargetCards.splice(safeCurrentIndex, 0, cardToMove);
        
        // Atualizar ordens em ambas as colunas
        sortedSourceCards.forEach((card, index) => {
          card.order = index;
        });
        
        sortedTargetCards.forEach((card, index) => {
          card.order = index;
        });
        
        // Atualizar as colunas
        freshSourceColumn.cards = sortedSourceCards;
        freshTargetColumn.cards = sortedTargetCards;
        
        // Atualizar o board local primeiro
        this.board = freshBoard;
        
        // Atualizar listas conectadas
        this.updateConnectedLists();
        
        // Enviar mudanças para o backend
        setTimeout(() => {
          // Enviar alteração para o servidor
          this.boardService.moveCard(sourceColumnId, targetColumnId, cardId, safeCurrentIndex);
        }, 0);
      }
      
      // Forçar atualização da UI
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Erro ao processar o movimento do card:', error);
      this.toastService.show('Erro ao mover card. Tente recarregar a página.', 'error');
    }
  }
  
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  onResetBoard(): void {
    // Mostrar modal de confirmação
    this.showResetConfirmation = true;
    console.log('Modal de confirmação de reset exibido');
  }
  
  cancelReset(): void {
    // Fechar modal sem fazer nada
    this.showResetConfirmation = false;
    console.log('Operação de reset cancelada pelo usuário');
    this.toastService.show('Operação cancelada', 'info');
  }
  
  confirmReset(): void {
    console.log('CONFIRMRESET: Iniciando processo de limpeza do quadro');
    
    // Mostrar indicação de carregamento
    this.isLoading = true;
    
    // Fechar o modal de confirmação
    this.showResetConfirmation = false;
    
    console.log('CONFIRMRESET: Modal fechado, isLoading =', this.isLoading);
    
    // Mostrar mensagem informativa
    this.toastService.show('Limpando o quadro...', 'info');
    
    console.log('CONFIRMRESET: Chamando clearBoardData()');
    
    // Armazenar o título do quadro atual para preservá-lo
    const boardTitle = this.board.title;
    
    // Limpar os dados do board (isso agora comunicará com o backend)
    this.boardService.clearBoardData();
    
    console.log('CONFIRMRESET: Após chamada a clearBoardData(), atualizando listas conectadas');
    
    // Atualizar listas conectadas
    this.updateConnectedLists();
    
    console.log('CONFIRMRESET: Processo de limpeza iniciado, aguardando atualização do subscriber');
    
    // Verificar após um curto período se o board foi realmente limpo
    setTimeout(() => {
      const currentBoard = this.boardService.getBoard();
      if (currentBoard.columns.length > 0) {
        console.warn('CONFIRMRESET: Board ainda tem colunas após timeout. Tentando forçar atualização');
        // Força uma atualização do board se ainda houver colunas
        this.loadBoard();
      } else {
        console.log('CONFIRMRESET: Limpeza concluída com sucesso');
        this.isLoading = false;
        this.toastService.show('Quadro limpo com sucesso!', 'success');
      }
    }, 2000);
  }
}

