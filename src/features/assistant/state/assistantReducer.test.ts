import { describe, expect, it } from 'vitest';
import { assistantReducer, initialAssistantState } from './assistantReducer';

const started = assistantReducer(initialAssistantState, {
  type: 'turnStarted',
  userMessage: { id: 'u1', role: 'user', content: 'hola' },
  assistantId: 'a1',
});

describe('assistantReducer', () => {
  it('appends the user message and an empty assistant placeholder', () => {
    expect(started.status).toBe('responding');
    expect(started.messages.map((message) => message.role)).toEqual(['user', 'assistant']);
  });

  it('streams deltas into the assistant message', () => {
    const state = ['Ho', 'la'].reduce(
      (current, chunk) => assistantReducer(current, { type: 'delta', assistantId: 'a1', chunk }),
      started,
    );
    expect(state.messages[1].content).toBe('Hola');
  });

  it('drops the empty placeholder on failure', () => {
    const state = assistantReducer(started, { type: 'turnFailed', assistantId: 'a1', error: 'boom' });
    expect(state).toMatchObject({ status: 'idle', error: 'boom' });
    expect(state.messages).toHaveLength(1);
  });
});
