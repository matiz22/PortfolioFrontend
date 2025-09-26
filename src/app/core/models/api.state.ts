export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export const ApiState = {
  loading: <T>(): ApiState<T> => ({status: 'loading'}),
  success: <T>(data: T): ApiState<T> => ({status: 'success', data}),
  error: <T>(error: string): ApiState<T> => ({status: 'error', error}),

  isLoading: <T>(state: ApiState<T>): state is { status: 'loading' } =>
    state.status === 'loading',
  isSuccess: <T>(state: ApiState<T>): state is { status: 'success'; data: T } =>
    state.status === 'success',
  isError: <T>(state: ApiState<T>): state is { status: 'error'; error: string } =>
    state.status === 'error',

  fold: <T, R>(
    state: ApiState<T>,
    onLoading: () => R,
    onSuccess: (data: T) => R,
    onError: (error: string) => R
  ): R => {
    switch (state.status) {
      case 'loading':
        return onLoading();
      case 'success':
        return onSuccess(state.data);
      case 'error':
        return onError(state.error);
    }
  }
};
