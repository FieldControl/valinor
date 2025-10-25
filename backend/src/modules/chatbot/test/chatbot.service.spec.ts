import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from '../chatbot.service';
import { MessageContextService } from '../../openai/services/messageContext.service';
import { OpenAIService } from '../../openai/services/openai.service';
import { ToolsService } from '../../openai/services/tools.service';
import { CreateMessageDto } from '../dto/create-message.dto';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let openAI: OpenAIService;
  let toolsService: ToolsService;
  let messageContext: MessageContextService;

  const mockOpenAI = {
    generateText: jest.fn(),
  };

  const mockToolsService = {
    getTools: jest.fn(),
  };

  const mockMessageContext = {
    getMessages: jest.fn(),
    addUserMessage: jest.fn(),
    addToolMessage: jest.fn(),
    addAssistantMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: OpenAIService, useValue: mockOpenAI },
        { provide: ToolsService, useValue: mockToolsService },
        { provide: MessageContextService, useValue: mockMessageContext },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    openAI = module.get<OpenAIService>(OpenAIService);
    toolsService = module.get<ToolsService>(ToolsService);
    messageContext = module.get<MessageContextService>(MessageContextService);

    jest.clearAllMocks();
  });

  describe('handleMessage', () => {
    it('deve processar mensagem sem toolCalls', async () => {
      const dto: CreateMessageDto = { message: 'Olá' };

      mockMessageContext.getMessages.mockReturnValue([]);
      mockToolsService.getTools.mockReturnValue([]);
      mockOpenAI.generateText.mockResolvedValue({
        text: 'Resposta do modelo',
        toolCalls: [],
        toolResults: [],
      });

      const result = await service.handleMessage(dto);

      expect(mockMessageContext.getMessages).toHaveBeenCalled();
      expect(mockToolsService.getTools).toHaveBeenCalled();
      expect(mockOpenAI.generateText).toHaveBeenCalledWith([], []);
      expect(mockMessageContext.addUserMessage).toHaveBeenCalledWith('Olá');
      expect(mockMessageContext.addAssistantMessage).toHaveBeenCalledWith('Resposta do modelo');
      expect(result).toEqual({ toolCalls: [], message: 'Resposta do modelo' });
    });

    it('deve processar mensagem com toolCalls', async () => {
      const dto: CreateMessageDto = { message: 'Executar ferramenta' };

      mockMessageContext.getMessages.mockReturnValue([]);
      mockToolsService.getTools.mockReturnValue(['tool1']);
      mockOpenAI.generateText.mockResolvedValue({
        text: 'Resultado da ferramenta',
        toolCalls: ['tool1'],
        toolResults: ['resultado1'],
      });

      const result = await service.handleMessage(dto);

      expect(mockMessageContext.getMessages).toHaveBeenCalled();
      expect(mockToolsService.getTools).toHaveBeenCalled();
      expect(mockOpenAI.generateText).toHaveBeenCalledWith([], ['tool1']);
      expect(mockMessageContext.addUserMessage).toHaveBeenCalledWith('Executar ferramenta');
      expect(mockMessageContext.addToolMessage).toHaveBeenCalledWith(['resultado1']);
      expect(result).toEqual({ toolCalls: ['tool1'], message: 'Resultado da ferramenta' });
    });
  });
});
