import type { ChatMessage } from '../domain/assistant';

export interface AssistantState {
  messages: ChatMessage[];
  status: 'idle' | 'responding';
  error: string | null;
}

export type AssistantAction =
  | { type: 'turnStarted'; userMessage: ChatMessage; assistantId: string }
  | { type: 'delta'; assistantId: string; chunk: string }
  | { type: 'turnCompleted' }
  | { type: 'turnFailed'; assistantId: string; error: string }
  | { type: 'reset' };

export const initialAssistantState: AssistantState = { messages: [], status: 'idle', error: null };

export function assistantReducer(state: AssistantState, action: AssistantAction): AssistantState {
  switch (action.type) {
    case 'turnStarted':
      return {
        status: 'responding',
        error: null,
        messages: [...state.messages, action.userMessage, { id: action.assistantId, role: 'assistant', content: '' }],
      };
    case 'delta':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.assistantId ? { ...message, content: message.content + action.chunk } : message,
        ),
      };
    case 'turnCompleted':
      return { ...state, status: 'idle' };
    case 'turnFailed':
      return {
        status: 'idle',
        error: action.error,
        messages: state.messages.filter((message) => message.id !== action.assistantId || message.content !== ''),
      };
    case 'reset':
      return initialAssistantState;
  }
}
