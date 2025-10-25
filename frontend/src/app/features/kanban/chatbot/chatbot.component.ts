import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UiButtonComponent } from '@shared/components/ui/ui-button/ui-button.component';
import { UiInputComponent } from '@shared/components/ui/ui-input/ui-input.component';
import { IconAutomate } from '@shared/icons/automate.component';
import { IconClose } from '@shared/icons/close';
import { IconSend } from '@shared/icons/send.component';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { TimeFormatPipe } from '../../../utils/timeFormat/time-format.pipe';
import { ChatbotService } from './chatbot.service';


@Component({
  selector: 'app-chatbot',
  imports: [
    UiButtonComponent,
    UiInputComponent,
    IconSend,
    IconAutomate,
    TimeFormatPipe,
    IconClose,
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})

export class ChatbotComponent {
  isActiveChatbot = false;
  isBotWriting = signal(false);
  chatUserInput = new FormControl('');
  messages = signal<
    { role: string; content: string; timestamp: Date | number }[]
  >([
    {
      role: 'bot',
      content: 'Hello, how can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  typingMessage = 'Processing...';

  @Output() actionTaken = new EventEmitter();

  constructor(private chatbotService: ChatbotService,) { }

  openChatbot() {
    this.isActiveChatbot = true;
  }

  closeChatbot() {
    this.isActiveChatbot = false;
  }

  async sendMessage() {
    if (!this.chatUserInput.value) return;

    this.isBotWriting.set(true);

    this.messages.update((prev) => [
      ...prev,
      {
        role: 'user',
        content: this.chatUserInput.value ?? '',
        timestamp: Date.now(),
      },
    ]);

    this.chatbotService.sendMessage(this.chatUserInput.value)
      .subscribe((data) => {
        const { message,toolCalls } = data;
        const converMessage = marked(message) as string;
        const safeResponse = DOMPurify.sanitize(converMessage);
        this.messages.update((prev) => [
          ...prev,
          { role: 'bot', content: safeResponse, timestamp: Date.now() },
        ]);

        if (toolCalls) {
          this.actionTaken.emit();
        }

        this.isBotWriting.set(false);


      });


    this.chatUserInput.setValue('');
  }
}
