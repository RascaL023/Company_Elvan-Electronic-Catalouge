import {
  ProductRepository,
  ProductPayload,
  ProductListOptions,
  ProductListResult,
} from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';
import { SortOption } from '../../core/types/common';

const mockProducts: Product[] = [
  {
    id: 'kulkas-1',
    name: 'Samsung RS64R5331B4 Side by Side Refrigerator 642L',
    slug: 'samsung-rs64r5331b4-side-by-side-refrigerator-642l',
    price: 15999000,
    description:
      'Refrigerator Side by Side Samsung RS64R5331B4 dengan kapasitas 642L. Dilengkapi Digital Inverter Technology, Twin Cooling Plus, dan All-around Cooling. Memiliki fitur Ice Maker otomatis, display digital touch, dan pengaturan suhu presisi. Cocok untuk keluarga besar yang membutuhkan ruang penyimpanan maksimal dengan efisiensi energi tinggi.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigerator/pra-15crx.webp'],
    rating: { rate: 4.7, count: 234 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'kulkas-2',
    name: 'LG GN-B215SQMT 2 Door Refrigerator 215L',
    slug: 'lg-gn-b215sqmt-2-door-refrigerator-215l',
    price: 5499000,
    description:
      'Kulkas 2 Pintu LG GN-B215SQMT dengan kapasitas 215L. Teknologi Smart Inverter Compressor menjamin efisiensi energi dan ketahanan hingga 10 tahun garansi kompresor. Fitur Multi Air Flow memastikan suhu merata ke seluruh bagian kulkas. Desain elegan dengan interior LED yang hemat energi.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigerator/pra-18mow.webp'],
    rating: { rate: 4.5, count: 189 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'kulkas-3',
    name: 'Sharp SJ-317MG 1 Door Refrigerator 170L',
    slug: 'sharp-sj-317mg-1-door-refrigerator-170l',
    price: 2799000,
    description:
      'Kulkas 1 Pintu Sharp SJ-317MG kapasitas 170L dengan teknologi Pendingin Cepat yang mampu mendinginkan minuman dalam waktu singkat. Rak kaca tempered berkualitas tinggi, konsumsi daya rendah, dan kompresor hemat energi. Cocok untuk kebutuhan keluarga kecil, kos-kosan, atau sebagai kulkas tambahan.',
    category: 'refrigerator',
    images: ['assets/images/products/refrigerator/sj-x187mg-db.webp'],
    rating: { rate: 4.3, count: 156 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'tv-1',
    name: 'Samsung UA43TU8000 43" 4K Crystal UHD Smart TV',
    slug: 'samsung-ua43tu8000-43-4k-crystal-uhd-smart-tv',
    price: 6999000,
    description:
      'Samsung 43-inch 4K UHD Smart TV dengan Crystal Display dan HDR. PurColor technology menghasilkan gambar yang lebih hidup dan natural. Smart Hub terintegrasi untuk akses Netflix, YouTube, Disney+ dan berbagai aplikasi streaming lainnya. Desain AirSlim yang tipis dan elegan.',
    category: 'television',
    images: ['assets/images/products/television/pld-24tv1853.jpeg'],
    rating: { rate: 4.6, count: 312 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'tv-2',
    name: 'LG 55NANO756QA 55" 4K NanoCell Smart TV',
    slug: 'lg-55nano756qa-55-4k-nanocell-smart-tv',
    price: 10999000,
    description:
      'LG 55-inch 4K NanoCell Smart TV dengan teknologi NanoCell untuk warna yang lebih akurat dan jernih dari sudut pandang mana pun. Dilengkapi dengan α5 Gen5 AI Processor 4K, HDR10 Pro, dan webOS 6.0. Dolby Digital Plus memberikan pengalaman audio yang immersive.',
    category: 'television',
    images: ['assets/images/products/television/pld-32tv1755.webp'],
    rating: { rate: 4.5, count: 278 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'tv-3',
    name: 'Xiaomi Mi TV 4A 32" HD Ready Smart TV',
    slug: 'xiaomi-mi-tv-4a-32-hd-ready-smart-tv',
    price: 2899000,
    description:
      'Xiaomi Mi TV 4A 32-inch HD Ready Smart TV dengan PatchWall UI yang intuitif. Dukungan untuk berbagai platform streaming, koneksi WiFi built-in, dan desain frameless yang modern. Cocok untuk kamar tidur atau ruang keluarga kecil dengan budget terbatas.',
    category: 'television',
    images: ['assets/images/products/television/pld-32v1853.webp'],
    rating: { rate: 4.2, count: 445 },
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

const DEFAULT_LIMIT = 24;

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating.rate - a.rating.rate);
      break;
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  return sorted;
}

export class MockProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const data = [...mockProducts];
    return data;
  }

  async list(options: ProductListOptions = {}): Promise<ProductListResult> {
    const { category, sort, search, cursor } = options;
    const pageSize = options.limit ?? DEFAULT_LIMIT;

    let result = mockProducts.filter((p) => p.isActive);

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    result = sortProducts(result, sort ?? 'default');

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = result.findIndex((p) => p.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paged = result.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < result.length;

    return {
      products: paged,
      hasMore,
      cursor: paged.length > 0 ? paged[paged.length - 1].id : null,
    };
  }

  async getById(id: string): Promise<Product | null> {
    const product = mockProducts.find((p) => p.id === id);
    return product || null;
  }

  async create(payload: ProductPayload): Promise<Product> {
    const now = new Date().toISOString();
    const id = payload.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const product: Product = {
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
    };
    mockProducts.push(product);
    return product;
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id "${id}" not found`);
    }
    const updated: Product = {
      ...mockProducts[index],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    mockProducts[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id "${id}" not found`);
    }
    mockProducts.splice(index, 1);
  }
}
