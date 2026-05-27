export type Category = "mahar" | "seserahan" | "bouquet" | "hampers" | "gift-box" | "custom"

export interface Product {
  id: string
  title: string
  category: Category
  description: string
  startPrice: number
  endPrice?: number
  image: string
  badge?: "bestseller" | "limited" | "loved"
  processingTime: string
  customizable: boolean
  availability: boolean
}

export const categories = [
  { id: "mahar", name: "Mahar", emoji: "💍" },
  { id: "seserahan", name: "Seserahan", emoji: "🎁" },
  { id: "bouquet", name: "Bouquet", emoji: "🌹" },
  { id: "hampers", name: "Hampers", emoji: "🎀" },
  { id: "gift-box", name: "Wedding Gift Box", emoji: "💝" },
  { id: "custom", name: "Paket Custom", emoji: "✨" },
] as const

export const products: Product[] = [
  {
    id: "mahar-1",
    title: "Mahar Signature Gold",
    category: "mahar",
    description: "Mahar premium dengan rangkaian koin emas dan aksesoris kristal dalam presentasi luxury frame.",
    startPrice: 3500000,
    endPrice: 5000000,
    image: "/gallery-1.jpg",
    badge: "bestseller",
    processingTime: "7-10 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "mahar-2",
    title: "Mahar Elegan Minimalis",
    category: "mahar",
    description: "Desain minimalis modern dengan perhiasan emas putih dan bunga segar yang elegan.",
    startPrice: 2500000,
    endPrice: 3800000,
    image: "/gallery-4.jpg",
    badge: "loved",
    processingTime: "5-7 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "seserahan-1",
    title: "Seserahan Deluxe Premium",
    category: "seserahan",
    description: "Paket seserahan lengkap dengan sarung, perhiasan, kain premium, dan aksesoris mewah dalam box eksklusif.",
    startPrice: 8000000,
    endPrice: 15000000,
    image: "/gallery-3.jpg",
    badge: "bestseller",
    processingTime: "14-21 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "seserahan-2",
    title: "Seserahan Elegant Box",
    category: "seserahan",
    description: "Seserahan medium dengan 5 item pilihan: kain batik premium, selendang sutra, dan perhiasan elegan.",
    startPrice: 5000000,
    endPrice: 8000000,
    image: "/gallery-2.jpg",
    processingTime: "10-14 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "bouquet-1",
    title: "Bridal Bouquet Romantis",
    category: "bouquet",
    description: "Rangkaian bunga fresh dengan mawar putih, hydrangea, dan eucalyptus dalam sentuhan emas.",
    startPrice: 2000000,
    endPrice: 3500000,
    image: "/gallery-2.jpg",
    badge: "loved",
    processingTime: "2-3 hari sebelum acara",
    customizable: true,
    availability: true,
  },
  {
    id: "bouquet-2",
    title: "Bouquet Minimalis Chic",
    category: "bouquet",
    description: "Desain minimalis dengan bunga pilihan berkualitas tinggi, cocok untuk pelengkap dekorasi modern.",
    startPrice: 1500000,
    endPrice: 2500000,
    image: "/gallery-5.jpg",
    processingTime: "2-3 hari sebelum acara",
    customizable: true,
    availability: true,
  },
  {
    id: "hampers-1",
    title: "Hampers Luxury Wedding",
    category: "hampers",
    description: "Hampers premium berisi produk kecantikan dan perawatan premium, coklat artisan, dan aksesoris eksklusif.",
    startPrice: 4000000,
    endPrice: 7000000,
    image: "/gallery-1.jpg",
    badge: "limited",
    processingTime: "7-10 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "hampers-2",
    title: "Hampers Gift Elegant",
    category: "hampers",
    description: "Pilihan hampers dengan isi kosmestik premium, parfum branded, dan perlengkapan pernikahan.",
    startPrice: 3000000,
    endPrice: 5000000,
    image: "/gallery-6.jpg",
    processingTime: "7-10 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "gift-1",
    title: "Wedding Gift Box Premium",
    category: "gift-box",
    description: "Box hadiah pernikahan eksklusif dengan packaging premium dan pilihan item luxury di dalamnya.",
    startPrice: 3500000,
    endPrice: 6000000,
    image: "/hero-mahar.jpg",
    processingTime: "7-10 hari",
    customizable: true,
    availability: true,
  },
  {
    id: "custom-1",
    title: "Paket Custom Unlimited",
    category: "custom",
    description: "Desain sesuai visi Anda: kombinasi mahar, seserahan, bouquet, dan dekorasi dengan kustomisasi penuh.",
    startPrice: 15000000,
    image: "/story-hands.jpg",
    badge: "loved",
    processingTime: "Konsultasi mendalam",
    customizable: true,
    availability: true,
  },
]

export const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Paling Populer" },
  { value: "price-asc", label: "Harga: Terendah" },
  { value: "price-desc", label: "Harga: Tertinggi" },
  { value: "premium", label: "Koleksi Premium" },
]
