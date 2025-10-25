import { OpenAIProvider, createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { CoreMessage, LanguageModelV1, ToolSet, generateText } from 'ai';

@Injectable()
export class OpenAIService {
  private openai: OpenAIProvider;
  private model: LanguageModelV1;

  constructor() {
    this.initializeOpenAI();
  }

  /**
 * Inicializa a conexão com a API OpenAI.
 * Configura modelo e endpoint.
 */
  private initializeOpenAI() {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.github.ai/inference';
    this.openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    this.model = this.openai('gpt-4o-mini');
  }

  /**
   * Processa a mensagem com o modelo, executando ferramentas configuradas.
   * @param message Mensagem do usuário.
   * @returns Resposta do modelo, incluindo texto final e resultados de ferramentas.
   */
  async generateText(messages: CoreMessage[], tools: ToolSet) {
    return generateText({
      model: this.model,
      messages,
      tools,
      maxSteps: 5,
      toolChoice: 'auto',
      onStepFinish({ stepType, toolCalls, toolResults, text }) {
        if (toolCalls.length > 0) {
          console.log('stepType:', stepType);
          console.log('toolCalls:', toolCalls);
          console.log('toolResults:', toolResults);
          console.log('response:', text);
          console.log('------------------------------');
        }
      },
    });
  }
}
