import type { Product } from '../domain/product';

const photo = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000`;

export const DEMO_PRODUCTS: Product[] = [
  { id: 'p-01', name: 'Buzo con capucha Norte', category: 'Buzos y camperas', price: 68900, isNew: true, stock: 14, color: 'Gris', rating: 4.6, imageUrl: photo(7869555), hoverImageUrl: photo(7869666), description: 'Frisa técnica liviana que abriga sin dar calor de más. Capucha ajustable, puños con orificio para el pulgar y bolsillo canguro.' },
  { id: 'p-02', name: 'Calza técnica Ruta', category: 'Calzas', price: 39900, compareAtPrice: 49900, stock: 22, color: 'Grafito', rating: 4.7, imageUrl: photo(8567597), hoverImageUrl: photo(6049164), description: 'Lycra de compresión media, tiro alto y bolsillo lateral para el celu. Secado rápido para correr o entrenar.' },
  { id: 'p-03', name: 'Rompeviento Faro', category: 'Buzos y camperas', price: 94500, isNew: true, stock: 2, color: 'Negro', rating: 4.8, imageUrl: photo(8497715), hoverImageUrl: photo(5039659), description: 'Nylon ripstop repelente al agua con vivos reflectivos 360°. Ideal para correr de noche. Se guarda en su propio bolsillo.' },
  { id: 'p-04', name: 'Remera técnica Plaza', category: 'Remeras y tops', price: 28900, stock: 0, color: 'Gris', rating: 4.3, imageUrl: photo(4719931), hoverImageUrl: photo(4719921), description: 'Tejido dry-fit respirable con costuras planas que no rozan. Para correr, caminar o ir al gimnasio.' },
  { id: 'p-05', name: 'Jogger técnico Bajo', category: 'Joggers y pantalones', price: 61500, compareAtPrice: 72000, stock: 9, color: 'Verde agua', rating: 4.5, imageUrl: photo(9775733), description: 'Tela técnica elastizada, puño con cierre y cintura con cordón. Para caminar, entrenar o el día a día.' },
  { id: 'p-06', name: 'Top deportivo Pulso', category: 'Remeras y tops', price: 32900, isNew: true, stock: 11, color: 'Negro', rating: 4.4, imageUrl: photo(3764154), hoverImageUrl: photo(10078261), description: 'Sostén medio, espalda cruzada y tela de secado rápido. Para running, funcional o yoga.' },
  { id: 'p-07', name: 'Short running Costa', category: 'Shorts', price: 34900, stock: 3, color: 'Negro', rating: 4.5, imageUrl: photo(5037354), hoverImageUrl: photo(8520627), description: 'Short 5" con calza interna y bolsillo trasero con cierre para llaves.' },
  { id: 'p-08', name: 'Musculosa running Oeste', category: 'Remeras y tops', price: 26900, stock: 8, color: 'Rojo', rating: 4.6, imageUrl: photo(7523366), hoverImageUrl: photo(3760259), description: 'Musculosa ultraliviana con malla en la espalda para ventilar en entrenamientos y carreras.' },
  { id: 'p-09', name: 'Calza ciclista Sur', category: 'Shorts', price: 36400, isNew: true, stock: 6, color: 'Negro', rating: 4.4, imageUrl: photo(3771834), hoverImageUrl: photo(3771836), description: 'Calza corta de compresión con cintura alta y bandas antideslizantes. Para andar en bici o entrenar.' },
  { id: 'p-10', name: 'Gorra running Obelisco', category: 'Accesorios', price: 22900, stock: 0, color: 'Blanco', rating: 4.2, imageUrl: photo(14742784), hoverImageUrl: photo(13424627), description: 'Gorra liviana de tela técnica con visera curva y banda que absorbe la transpiración.' },
];

export const CATEGORY_IMAGES: Record<string, string> = {
  'Buzos y camperas': photo(7869555),
  Calzas: photo(8567597),
  'Remeras y tops': photo(4719931),
  'Joggers y pantalones': photo(9775733),
  Shorts: photo(5037354),
  Accesorios: photo(14742784),
};

const HERO_PHOTO = 'https://images.pexels.com/photos/29840338/pexels-photo-29840338.jpeg?auto=compress&cs=tinysrgb';
const HERO_WIDTHS = [1280, 1920, 2560, 3200];

export const HERO_IMAGE = {
  src: `${HERO_PHOTO}&w=1920`,
  srcSet: HERO_WIDTHS.map((width) => `${HERO_PHOTO}&w=${width} ${width}w`).join(', '),
  sizes: '(max-width: 1023px) 250vw, 100vw',
};
