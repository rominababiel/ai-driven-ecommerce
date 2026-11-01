export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface AssistantSession {
  send(text: string, onDelta: (chunk: string) => void): Promise<void>;
  dispose(): void;
}

export interface AssistantGateway {
  readonly requiresAuth: boolean;
  createSession(): Promise<AssistantSession>;
}
