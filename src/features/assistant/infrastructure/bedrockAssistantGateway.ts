import { getDataClient } from '@/infrastructure/amplify/dataClient';
import type { AssistantGateway, AssistantSession } from '../domain/assistant';

interface PendingTurn {
  onDelta: (chunk: string) => void;
  resolve: () => void;
  reject: (error: Error) => void;
}

const TOOL_USE_STOP_REASON = 'tool_use';

export function createBedrockAssistantGateway(): AssistantGateway {
  return {
    requiresAuth: true,
    async createSession(): Promise<AssistantSession> {
      const { data: conversation, errors } = await getDataClient().conversations.shopAssistant.create();
      if (!conversation) throw new Error(errors?.[0]?.message ?? 'No fue posible iniciar la conversación');

      let pending: PendingTurn | null = null;

      const settle = (outcome: (turn: PendingTurn) => void) => {
        if (!pending) return;
        const turn = pending;
        pending = null;
        outcome(turn);
      };

      const subscription = conversation.onStreamEvent({
        next: (event) => {
          if (event.text) pending?.onDelta(event.text);
          if (event.stopReason && event.stopReason !== TOOL_USE_STOP_REASON) settle((turn) => turn.resolve());
        },
        error: (event) => {
          const message = event.errors[0]?.message ?? 'El asistente no pudo responder';
          settle((turn) => turn.reject(new Error(message)));
        },
      });

      return {
        send(text, onDelta) {
          return new Promise<void>((resolve, reject) => {
            pending = { onDelta, resolve, reject };
            conversation.sendMessage({ content: [{ text }] }).then(
              ({ errors: sendErrors }) => {
                if (sendErrors?.length) settle((turn) => turn.reject(new Error(sendErrors[0].message)));
              },
              (error: unknown) => settle((turn) => turn.reject(error instanceof Error ? error : new Error(String(error)))),
            );
          });
        },
        dispose() {
          subscription.unsubscribe();
        },
      };
    },
  };
}
