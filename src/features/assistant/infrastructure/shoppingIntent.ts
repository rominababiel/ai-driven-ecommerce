import type { Product } from '@/features/catalog/domain/product';
import { formatPrice } from '@/shared/lib/money';
import { normalizeText } from '@/shared/lib/text';

export interface ShoppingIntent {
  keywords: string[];
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  wantsCheapest: boolean;
  wantsBestRated: boolean;
}

const STOPWORDS = new Set([
  'busco', 'buscar', 'quiero', 'necesito', 'tienes', 'tienen', 'hay', 'para', 'algo', 'algun', 'alguna', 'unos', 'unas',
  'menos', 'mas', 'desde', 'hasta', 'entre', 'bajo', 'precio', 'dolares', 'barato', 'barata', 'baratos', 'economico',
  'mejor', 'mejores', 'valorado', 'recomienda', 'recomiendas', 'producto', 'productos', 'como', 'cual', 'cuales', 'que',
  'muestrame', 'mostrar', 'dame', 'tienda', 'favor', 'gracias', 'hola',
]);

const MAX_PRICE_PATTERN = /(?:menos de|bajo|hasta|maximo|por debajo de|no mas de)\s*\$?\s*(\d+(?:[.,]\d+)?)/;
const MIN_PRICE_PATTERN = /(?:mas de|desde|minimo|por encima de|sobre)\s*\$?\s*(\d+(?:[.,]\d+)?)/;

const toNumber = (match: RegExpExecArray | null) => (match ? Number(match[1].replace(',', '.')) : null);

const isSameWord = (word: string, target: string) => word === target || word === `${target}s` || word === `${target}es`;

const singular = (word: string) => word.replace(/s$/, '');

export function parseShoppingIntent(text: string, categories: readonly string[]): ShoppingIntent {
  const normalized = normalizeText(text);
  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const category =
    categories.find((candidate) => {
      const target = normalizeText(candidate);
      return words.some((word) => isSameWord(word, target) || isSameWord(target, word));
    }) ?? null;

  return {
    keywords: words.filter((word) => word.length >= 4 && !STOPWORDS.has(word) && !/^\d+$/.test(word)),
    category,
    minPrice: toNumber(MIN_PRICE_PATTERN.exec(normalized)),
    maxPrice: toNumber(MAX_PRICE_PATTERN.exec(normalized)),
    wantsCheapest: /\b(barat|economic)/.test(normalized),
    wantsBestRated: /\b(mejor|valorad|recomiend)/.test(normalized),
  };
}

function matchesKeywords(product: Product, keywords: readonly string[]): boolean {
  if (keywords.length === 0) return true;
  const haystack = normalizeText(`${product.name} ${product.description} ${product.category}`);
  return keywords.some((keyword) => haystack.includes(singular(keyword)));
}

export function findMatchingProducts(products: readonly Product[], intent: ShoppingIntent, limit = 4): Product[] {
  const hasStructuredFilter = intent.category !== null || intent.minPrice !== null || intent.maxPrice !== null;
  const keywords = hasStructuredFilter ? [] : intent.keywords;

  const matches = products.filter(
    (product) =>
      product.stock > 0 &&
      (intent.category === null || product.category === intent.category) &&
      (intent.minPrice === null || product.price >= intent.minPrice) &&
      (intent.maxPrice === null || product.price <= intent.maxPrice) &&
      matchesKeywords(product, keywords),
  );

  if (intent.wantsCheapest) matches.sort((a, b) => a.price - b.price);
  else matches.sort((a, b) => b.rating - a.rating);

  return matches.slice(0, limit);
}

export function composeReply(text: string, products: readonly Product[], categories: readonly string[]): string {
  const intent = parseShoppingIntent(text, categories);
  const isSearch =
    intent.keywords.length > 0 || intent.category !== null || intent.minPrice !== null || intent.maxPrice !== null || intent.wantsBestRated || intent.wantsCheapest;

  if (!isSearch) {
    return `¡Hola! Puedo ayudarte a encontrar prendas. Prueba con algo como "zapatillas de menos de 100" o "lo mejor en ${categories[0] ?? 'Remeras'}".\n\nCategorías disponibles: ${categories.join(', ')}.`;
  }

  const matches = findMatchingProducts(products, intent);
  if (matches.length === 0) {
    return 'No encontré productos disponibles con esos criterios. Prueba ampliando el rango de precio o cambiando de categoría.';
  }

  const lines = matches.map((product) => `• ${product.name} — ${formatPrice(product.price)} (★ ${product.rating.toFixed(1)})`);
  return `Te recomiendo estas opciones:\n${lines.join('\n')}\n\nPuedes agregarlas al carrito desde el catálogo.`;
}
