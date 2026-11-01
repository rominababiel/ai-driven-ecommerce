import { useCallback, useEffect, useReducer, useRef } from 'react';
import { toErrorMessage } from '@/shared/lib/errors';
import type { AssistantGateway, AssistantSession } from '../domain/assistant';
import { assistantReducer, initialAssistantState } from './assistantReducer';

export function useAssistantChat(gateway: AssistantGateway) {
  const [state, dispatch] = useReducer(assistantReducer, initialAssistantState);
  const sessionRef = useRef<Promise<AssistantSession> | null>(null);

  useEffect(
    () => () => {
      sessionRef.current?.then((session) => session.dispose(), () => undefined);
      sessionRef.current = null;
    },
    [gateway],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content) return;

      const assistantId = crypto.randomUUID();
      dispatch({ type: 'turnStarted', userMessage: { id: crypto.randomUUID(), role: 'user', content }, assistantId });

      try {
        sessionRef.current ??= gateway.createSession();
        const session = await sessionRef.current;
        await session.send(content, (chunk) => dispatch({ type: 'delta', assistantId, chunk }));
        dispatch({ type: 'turnCompleted' });
      } catch (error) {
        sessionRef.current = null;
        dispatch({ type: 'turnFailed', assistantId, error: toErrorMessage(error, 'El asistente no está disponible') });
      }
    },
    [gateway],
  );

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { ...state, send, reset };
}
