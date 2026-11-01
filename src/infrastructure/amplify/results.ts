interface GraphQLError {
  message: string;
}

interface GraphQLResult<T> {
  data: T;
  errors?: GraphQLError[];
}

interface PagedResult<T> extends GraphQLResult<T[]> {
  nextToken?: string | null;
}

export function assertNoErrors(errors: GraphQLError[] | undefined): void {
  if (errors?.length) throw new Error(errors.map((error) => error.message).join('; '));
}

export function unwrap<T>({ data, errors }: GraphQLResult<T>): NonNullable<T> {
  assertNoErrors(errors);
  if (data === null || data === undefined) throw new Error('El servidor devolvió una respuesta vacía');
  return data;
}

export async function collectPages<T>(fetchPage: (nextToken: string | null) => Promise<PagedResult<T>>): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null = null;
  do {
    const page: PagedResult<T> = await fetchPage(nextToken);
    assertNoErrors(page.errors);
    items.push(...page.data);
    nextToken = page.nextToken ?? null;
  } while (nextToken);
  return items;
}
