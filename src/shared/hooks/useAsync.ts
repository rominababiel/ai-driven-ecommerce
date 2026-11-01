import { useCallback, useEffect, useReducer, useState } from 'react';
import { toErrorMessage } from '@/shared/lib/errors';

export interface AsyncState<T> {
  status: 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
}

type AsyncAction<T> =
  | { type: 'start' }
  | { type: 'success'; data: T }
  | { type: 'failure'; error: string };

function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'start':
      return { ...state, status: 'loading', error: null };
    case 'success':
      return { status: 'success', data: action.data, error: null };
    case 'failure':
      return { ...state, status: 'error', error: action.error };
  }
}

export function useAsync<T>(loader: () => Promise<T>) {
  const [state, dispatch] = useReducer(asyncReducer<T>, { status: 'loading', data: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    dispatch({ type: 'start' });
    loader().then(
      (data) => {
        if (active) dispatch({ type: 'success', data });
      },
      (error: unknown) => {
        if (active) dispatch({ type: 'failure', error: toErrorMessage(error) });
      },
    );
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { ...state, reload };
}
