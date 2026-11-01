import type { Product } from '../domain/product';

const image = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const DEMO_PRODUCTS: Product[] = [
  { id: 'p-01', name: 'Remera Básica Algodón Orgánico', description: 'Remera de corte regular en algodón orgánico peinado, suave y respirable.', price: 18.9, category: 'Remeras', imageUrl: image('remera-basica'), stock: 40, rating: 4.5 },
  { id: 'p-02', name: 'Remera Oversize Estampada', description: 'Remera oversize con estampa frontal y hombros caídos, estilo urbano.', price: 24.5, category: 'Remeras', imageUrl: image('remera-oversize'), stock: 25, rating: 4.3 },
  { id: 'p-03', name: 'Jean Recto Clásico', description: 'Jean de tiro medio y pierna recta en denim rígido con lavado vintage.', price: 49.9, category: 'Pantalones', imageUrl: image('jean-recto'), stock: 18, rating: 4.6 },
  { id: 'p-04', name: 'Pantalón Cargo Urbano', description: 'Pantalón cargo de gabardina con bolsillos laterales y puño ajustable.', price: 44, category: 'Pantalones', imageUrl: image('cargo-urbano'), stock: 0, rating: 4.1 },
  { id: 'p-05', name: 'Jogger de Algodón', description: 'Jogger de frisa liviana con cintura elastizada y cordón.', price: 32.5, category: 'Pantalones', imageUrl: image('jogger-algodon'), stock: 22, rating: 4.4 },
  { id: 'p-06', name: 'Zapatillas Urbanas Blancas', description: 'Zapatillas de cuero sintético blancas con suela de goma, combinan con todo.', price: 79.9, category: 'Calzado', imageUrl: image('zapatillas-blancas'), stock: 15, rating: 4.7 },
  { id: 'p-07', name: 'Botas Chelsea de Cuero', description: 'Botas Chelsea de cuero genuino con elásticos laterales y suela track.', price: 129, category: 'Calzado', imageUrl: image('botas-chelsea'), stock: 6, rating: 4.8 },
  { id: 'p-08', name: 'Campera de Jean', description: 'Campera de denim clásica con botones metálicos y bolsillos en el pecho.', price: 69.9, category: 'Abrigos', imageUrl: image('campera-jean'), stock: 10, rating: 4.5 },
  { id: 'p-09', name: 'Buzo Hoodie Essential', description: 'Buzo con capucha de frisa invisible, bolsillo canguro y puños acanalados.', price: 39.9, category: 'Abrigos', imageUrl: image('hoodie-essential'), stock: 30, rating: 4.6 },
  { id: 'p-10', name: 'Tapado de Paño', description: 'Tapado largo de paño con solapa clásica, ideal para el invierno.', price: 149, category: 'Abrigos', imageUrl: image('tapado-pano'), stock: 3, rating: 4.4 },
  { id: 'p-11', name: 'Gorra Dad Hat', description: 'Gorra de gabardina lavada con visera curva y cierre regulable.', price: 15.9, category: 'Accesorios', imageUrl: image('gorra-dad'), stock: 50, rating: 4.2 },
  { id: 'p-12', name: 'Mochila Canvas Urban', description: 'Mochila de lona encerada con compartimento para notebook y detalles de cuero.', price: 54, category: 'Accesorios', imageUrl: image('mochila-canvas'), stock: 12, rating: 4.6 },
];
