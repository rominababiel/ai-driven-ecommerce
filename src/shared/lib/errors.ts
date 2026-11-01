export function toErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
