import { Message } from "@/types/chat";

export class ChatHistoryManager {
  private static readonly MAX_HISTORY = 10;
  private messages: Message[] = [];

  addMessage(message: Message) {
    this.messages.push(message);
    if (this.messages.length > ChatHistoryManager.MAX_HISTORY) {
      this.messages = this.messages.slice(-ChatHistoryManager.MAX_HISTORY);
    }
  }

  getHistory(): Message[] {
    return this.messages;
  }

  getRecentContext(count: number = 3): string {
    return this.messages
      .slice(-count)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
  }

  clear() {
    this.messages = [];
  }
}
