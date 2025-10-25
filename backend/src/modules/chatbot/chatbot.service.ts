import { Injectable } from '@nestjs/common';
import { ToolExecutionOptions } from 'ai';
import { MessageContextService } from '../openai/services/messageContext.service';
import { OpenAIService } from '../openai/services/openai.service';
import { ToolsService } from '../openai/services/tools.service';
import { CreateMessageDto } from './dto/create-message.dto';


@Injectable()
export class ChatbotService {
  constructor(
    private openAI: OpenAIService,
    private toolsService: ToolsService,
    private messageContext: MessageContextService
  ) { }

  /**
   * Recebe uma mensagem do usuário e processa usando o modelo.
   * Executa as ferramentas necessárias e atualiza o contexto de mensagens.
   * @param createMessageDto Objeto contendo a mensagem do usuário.
   * @returns Resultado da mensagem processada, incluindo toolCalls e resposta do modelo.
   */


  async handleMessage(sessionId: string, createMessageDto: CreateMessageDto) {
    try {
      const { message } = createMessageDto;
      this.messageContext.addUserMessage(message);

      const response = await this.openAI.generateText(
        this.messageContext.getMessages(),
        this.toolsService.getTools(sessionId)
      );

      // Executa cada tool sequencialmente
      for (const toolCall of response.toolCalls) {
        const tool = this.toolsService.getTools(sessionId)[toolCall.toolName];
        if (!tool || !tool.execute) continue;


        let result;

        try {
          result = await tool.execute(toolCall.args, {} as ToolExecutionOptions);
        } catch (err) {
          console.error(`Erro na tool ${toolCall.toolName}:`, err);
          result = '[Erro ao executar a ferramenta]';
          // opcional: limpar contexto em caso de falha total
          this.messageContext.reset();
        }

        this.messageContext.addToolMessage([{
          type: "tool-result",
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          result: result ?? '[Sem retorno da ferramenta]',
        }]);
      }

      // Se não houve tools, adiciona mensagem do assistente
      if (!response.toolCalls.length) {
        this.messageContext.addAssistantMessage(response.text);
      }

      return { message: response.text, toolCalls: !!response.toolCalls };
    } catch (error) {

      console.error('Erro ao processar mensagem:', error);
      return { message: 'Ocorreu um erro inesperado.' };
    }
  }

}
