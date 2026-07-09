import { categories, products } from "@/lib/katalog-data"
import type {
  CatalogData,
  FaqSectionData,
  FeaturesSection,
  FinalCtaSection,
  GallerySection,
  HeroSection,
  LandingPageData,
  NavigationItem,
  PackageTier,
  PackagesSection,
  ProcessSection,
  SiteContact,
  StorySection,
  TestimonialItem,
  TestimonialsSection,
  UrgencySectionData,
} from "@/lib/data/types"

// These values remain the safe local fallback until Supabase migration is verified.
export const fallbackContact: SiteContact = {
  brandName: "daztore",
  brandSuffix: ".id",
  footerDescription:
    "Premium wedding atelier untuk mahar, seserahan, dan flower bouquet. Dirancang dengan ketelitian. Dihadirkan dengan kehangatan.",
  whatsappNumber: "6287756877555",
  email: "hello@daztore.id",
  instagramUrl: "https://instagram.com/daztore.id",
  instagramHandle: "@daztore.id",
  location: "Jakarta",
  deliveryArea: "Melayani pengiriman nasional",
  privacyUrl: "#",
  termsUrl: "#",
}

export const fallbackNavigation: NavigationItem[] = [
  { slug: "story", label: "Cerita", href: "#story", placement: "header", disabled: false, sortOrder: 10 },
  {
    slug: "packages",
    label: "Katalog",
    href: "/katalog",
    placement: "header",
    disabled: false,
    sortOrder: 20,
  },
  { slug: "gallery", label: "Galeri", href: "#gallery", placement: "header", disabled: false, sortOrder: 30 },
  {
    slug: "testimonials",
    label: "Testimoni",
    href: "#testimonials",
    placement: "header",
    disabled: false,
    sortOrder: 40,
  },
  { slug: "contact", label: "Kontak", href: "#contact", placement: "header", disabled: false, sortOrder: 50 },
  {
    slug: "catalog-cta",
    label: "Katalog",
    href: "/katalog",
    placement: "header_cta",
    disabled: false,
    sortOrder: 10,
  },
  { slug: "home-mobile", label: "Beranda", href: "#top", placement: "mobile", icon: "🏠", disabled: false, sortOrder: 10 },
  {
    slug: "catalog-mobile",
    label: "Katalog",
    href: "/katalog",
    placement: "mobile",
    icon: "📦",
    disabled: false,
    sortOrder: 20,
  },
  {
    slug: "packages-mobile",
    label: "Katalog",
    href: "/katalog",
    placement: "mobile",
    icon: "💎",
    disabled: false,
    sortOrder: 30,
  },
  {
    slug: "chat-mobile",
    label: "Chat",
    href: "whatsapp",
    placement: "mobile",
    icon: "💬",
    disabled: false,
    sortOrder: 40,
  },
  { slug: "story-footer", label: "Cerita", href: "#story", placement: "footer", disabled: false, sortOrder: 10 },
  {
    slug: "packages-footer",
    label: "Katalog",
    href: "/katalog",
    placement: "footer",
    disabled: false,
    sortOrder: 20,
  },
  { slug: "gallery-footer", label: "Galeri", href: "#gallery", placement: "footer", disabled: false, sortOrder: 30 },
  {
    slug: "testimonials-footer",
    label: "Testimoni",
    href: "#testimonials",
    placement: "footer",
    disabled: false,
    sortOrder: 40,
  },
]

export const fallbackHero: HeroSection = {
  slug: "hero",
  badge: "Premium Wedding Atelier",
  title: "Setiap cinta layak",
  highlightedTitle: "dirayakan dengan indah.",
  description:
    "daztore.id menghadirkan mahar, seserahan, dan flower bouquet yang dirancang dengan ketelitian, keanggunan, dan sentuhan personal — untuk hari paling berharga dalam hidup Anda.",
  primaryCtaLabel: "Mulai Konsultasi",
  primaryCtaMessage: "Halo daztore.id, saya tertarik dengan layanan Anda.",
  secondaryCtaLabel: "Lihat Katalog",
  secondaryCtaHref: "/katalog",
  imageUrl: "/hero-mahar.webp",
  imageAlt: "Mahar pernikahan premium dengan bunga mawar putih dan aksen emas",
  mobileBackgroundUrl: "/bouquet-bg.jpg",
  collectionTitle: "Signature Collection",
  collectionSubtitle: "Handcrafted with love",
  accentLabel: "Limited",
  accentValue: "Hanya 8 slot / bulan",
  metrics: [
    { slug: "couples", label: "Couples", value: "500+" },
    { slug: "rating", label: "Rating", value: "4.9 / 5" },
    { slug: "years", label: "Tahun", value: "7+" },
  ],
}

export const fallbackStory: StorySection = {
  slug: "story",
  eyebrow: "Our Story",
  title: "Mahar & seserahan,",
  highlightedTitle: "lebih dari sekadar tradisi.",
  description:
    "Di balik setiap mahar, ada janji. Di balik setiap seserahan, ada harapan. daztore.id percaya bahwa tradisi yang indah layak dirayakan dengan presentasi yang sepadan — penuh ketelitian, keanggunan, dan kehangatan.",
  secondaryDescription:
    "Kami mendampingi Anda dari konsep awal hingga hari H — memastikan setiap elemen mencerminkan kisah cinta Anda berdua.",
  imageUrl: "/story-hands.jpg",
  imageAlt: "Tangan sedang merangkai seserahan pernikahan mewah",
  establishedLabel: "Est. 2018",
  locationLabel: "Jakarta · Indonesia",
  values: [
    {
      slug: "made-with-heart",
      icon: "heart",
      title: "Dibuat dengan Hati",
      description: "Setiap detail dirangkai dengan perhatian dan makna — mewakili cinta yang tulus.",
    },
    {
      slug: "natural-aesthetic",
      icon: "flower",
      title: "Estetika Natural",
      description: "Perpaduan bunga segar, tekstur premium, dan palet warna yang tenang dan anggun.",
    },
    {
      slug: "premium-material",
      icon: "gem",
      title: "Material Premium",
      description: "Kami memilih bahan terbaik — dari kotak akrilik hingga sutra — tanpa kompromi.",
    },
  ],
}

export const fallbackProcess: ProcessSection = {
  slug: "process",
  title: "Proses Kami",
  description:
    "Dari visi menjadi kenyataan dalam empat langkah sempurna yang dirancang untuk kesuksesan hari istimewa Anda.",
  items: [
    {
      slug: "consultation",
      number: "01",
      title: "Konsultasi Mendalam",
      description: "Kami mendengarkan visi, preferensi, dan setiap detail impian pernikahan Anda dengan penuh perhatian.",
    },
    {
      slug: "design-proposal",
      number: "02",
      title: "Desain & Proposal",
      description: "Tim kreatif kami merancang konsep yang sempurna, dari warna hingga setiap elemen dekorasi.",
    },
    {
      slug: "premium-production",
      number: "03",
      title: "Produksi Premium",
      description: "Setiap produk dikerjakan dengan keahlian tinggi, material berkualitas, dan sentuhan personal.",
    },
    {
      slug: "finalization-delivery",
      number: "04",
      title: "Finalisasi & Pengiriman",
      description: "Inspeksi kualitas akhir dan pengiriman tepat waktu memastikan kesempurnaan hari Anda.",
    },
  ],
}

export const fallbackFeatures: FeaturesSection = {
  slug: "features",
  title: "Mengapa Memilih daztore.id",
  description: "Kami adalah mitra terpercaya untuk mewujudkan setiap detail impian pernikahan Anda dengan sempurna.",
  items: [
    {
      slug: "premium-quality",
      icon: "award",
      title: "Kualitas Premium",
      description: "Setiap produk dipilih dan dirancang dengan standar kualitas tertinggi untuk kesempurnaan maksimal.",
    },
    {
      slug: "personal-touch",
      icon: "heart",
      title: "Sentuhan Personal",
      description: "Kami memahami setiap cerita cinta Anda dan mengubahnya menjadi sesuatu yang unik dan berkesan.",
    },
    {
      slug: "fast-production",
      icon: "zap",
      title: "Pengerjaan Cepat",
      description: "Proses produksi yang efisien tanpa mengorbankan kualitas, cocok untuk timeline yang ketat.",
    },
    {
      slug: "experienced-team",
      icon: "users",
      title: "Tim Berpengalaman",
      description: "Lebih dari 7 tahun melayani ratusan pasangan dengan dedikasi dan profesionalisme tinggi.",
    },
  ],
}

export const fallbackGallery: GallerySection = {
  slug: "gallery",
  eyebrow: "Portfolio",
  title: "Galeri momen",
  highlightedTitle: "yang kami rayakan.",
  description:
    "Kumpulan karya terpilih dari perjalanan cinta pasangan yang telah mempercayakan momen mereka kepada daztore.id.",
  items: [
    {
      slug: "mahar-classic",
      imageUrl: "/gallery-1.jpg",
      imageAlt: "Mahar premium dengan koin emas dan mawar putih",
      span: "md:row-span-2",
      label: "Mahar Classic",
      sortOrder: 10,
    },
    {
      slug: "bridal-bouquet",
      imageUrl: "/gallery-2.jpg",
      imageAlt: "Bouquet pengantin dengan mawar dan peony",
      span: "",
      label: "Bridal Bouquet",
      sortOrder: 20,
    },
    {
      slug: "seserahan-set",
      imageUrl: "/gallery-3.jpg",
      imageAlt: "Kotak seserahan mewah dengan bunga dan pita emas",
      span: "",
      label: "Seserahan Set",
      sortOrder: 30,
    },
    {
      slug: "ring-pillow",
      imageUrl: "/gallery-4.jpg",
      imageAlt: "Cincin pernikahan emas pada bantalan beludru krem",
      span: "md:row-span-2",
      label: "Ring Pillow",
      sortOrder: 40,
    },
    {
      slug: "flower-stand",
      imageUrl: "/gallery-5.jpg",
      imageAlt: "Rangkaian bunga segar dalam vas kaca bening",
      span: "",
      label: "Flower Stand",
      sortOrder: 50,
    },
    {
      slug: "money-bouquet",
      imageUrl: "/gallery-6.jpg",
      imageAlt: "Money bouquet mahar dalam bingkai emas berhias mutiara",
      span: "",
      label: "Money Bouquet",
      sortOrder: 60,
    },
  ],
}

export const fallbackGridTestimonials: TestimonialItem[] = [
  {
    slug: "sarah-reza",
    name: "Sarah & Reza",
    subtitle: "Jakarta",
    content:
      "daztore.id berhasil mewujudkan setiap detail visi kami. Dari mahar hingga seserahan, semuanya sempurna dan melampaui ekspektasi!",
    rating: 5,
    avatar: "👰",
    variant: "grid",
    sortOrder: 10,
  },
  {
    slug: "dewi-aldi",
    name: "Dewi & Aldi",
    subtitle: "Surabaya",
    content:
      "Tim daztore sangat profesional, responsif, dan mendengarkan setiap masukan kami. Hasil akhirnya benar-benar magical!",
    rating: 5,
    avatar: "💍",
    variant: "grid",
    sortOrder: 20,
  },
  {
    slug: "ayu-hari",
    name: "Ayu & Hari",
    subtitle: "Bandung",
    content:
      "Proses kustomisasi yang smooth, komunikasi yang jelas, dan hasil yang memukau. Terima kasih sudah membuat hari kami sempurna!",
    rating: 5,
    avatar: "🌹",
    variant: "grid",
    sortOrder: 30,
  },
]

export const fallbackCarouselTestimonials: TestimonialItem[] = [
  {
    slug: "anindya-rizki",
    name: "Anindya & Rizki",
    subtitle: "Menikah, Mei 2024",
    rating: 5,
    content:
      "daztore.id memahami visi kami bahkan sebelum kami menjelaskan semuanya. Setiap detail mahar terasa seperti cerminan cinta kami. Tamu-tamu tidak berhenti memuji!",
    variant: "carousel",
    sortOrder: 10,
  },
  {
    slug: "kirana-aldo",
    name: "Kirana & Aldo",
    subtitle: "Menikah, Agustus 2024",
    rating: 5,
    content:
      "Seserahan yang dibuat benar-benar breathtaking. Tim mereka sangat sabar, detail, dan menghadirkan hasil yang melampaui ekspektasi. Worth every penny.",
    variant: "carousel",
    sortOrder: 20,
  },
  {
    slug: "nadira-fariz",
    name: "Nadira & Fariz",
    subtitle: "Menikah, November 2023",
    rating: 5,
    content:
      "Bouquet dari daztore.id masih saya simpan sampai sekarang — indahnya tidak lekang oleh waktu. Pelayanan personal yang sulit ditemukan di tempat lain.",
    variant: "carousel",
    sortOrder: 30,
  },
  {
    slug: "salma-bima",
    name: "Salma & Bima",
    subtitle: "Menikah, Februari 2025",
    rating: 5,
    content:
      "Proses dari konsultasi hingga hari H sangat mulus. Mereka benar-benar mengangkat cerita kami menjadi sesuatu yang visual dan emosional.",
    variant: "carousel",
    sortOrder: 40,
  },
]

export const fallbackTestimonials: TestimonialsSection = {
  slug: "testimonials",
  title: "Cerita Pasangan Bahagia",
  description: "Ratusan pasangan telah mempercayai daztore.id untuk mewujudkan hari istimewa mereka.",
  items: fallbackGridTestimonials,
}

export const fallbackFaq: FaqSectionData = {
  slug: "faq",
  title: "Pertanyaan Umum",
  description: "Temukan jawaban untuk pertanyaan paling sering diajukan tentang layanan kami.",
  ctaText: "Masih ada pertanyaan? Hubungi kami langsung!",
  ctaLabel: "Hubungi via WhatsApp →",
  ctaMessage: "",
  items: [
    {
      slug: "production-time",
      question: "Berapa lama waktu produksi mahar dan seserahan?",
      answer:
        "Waktu produksi tergantung kompleksitas desain. Untuk mahar standar 7-10 hari, seserahan premium 14-21 hari. Kami juga menerima rush order dengan tambahan biaya.",
      sortOrder: 10,
    },
    {
      slug: "customization",
      question: "Apakah produk dapat dikustomisasi sesuai keinginan?",
      answer:
        "Ya, semua produk dapat dikustomisasi. Dari pemilihan warna, material, hingga desain khusus. Tim kreatif kami siap mewujudkan visi Anda.",
      sortOrder: 20,
    },
    {
      slug: "quality-guarantee",
      question: "Bagaimana dengan jaminan kualitas produk?",
      answer:
        "Setiap produk melalui quality control ketat sebelum dikirim. Kami menggunakan material premium dan pengerjaan profesional. Kepuasan Anda adalah jaminan kami.",
      sortOrder: 30,
    },
    {
      slug: "payment-delivery",
      question: "Bagaimana proses pembayaran dan pengiriman?",
      answer:
        "Pembayaran dapat dilakukan via transfer bank dengan sistem DP+Pelunasan. Pengiriman tersedia untuk seluruh Indonesia dengan packaging premium dan asuransi pengiriman.",
      sortOrder: 40,
    },
    {
      slug: "free-consultation",
      question: "Apakah ada gratis konsultasi awal?",
      answer:
        "Ya, konsultasi awal sepenuhnya gratis! Hubungi kami via WhatsApp dan tim kami akan membantu merancang paket yang sempurna untuk hari istimewa Anda.",
      sortOrder: 50,
    },
    {
      slug: "revision",
      question: "Bagaimana jika saya tidak puas dengan hasil?",
      answer:
        "Kami berkomitmen 100% kepuasan pelanggan. Jika ada hal yang perlu diperbaiki, kami akan melakukan revisi sesuai kebutuhan Anda tanpa biaya tambahan.",
      sortOrder: 60,
    },
  ],
}

export const fallbackUrgency: UrgencySectionData = {
  slug: "urgency",
  title: "Slot Terbatas Setiap Bulan",
  description:
    "Kami hanya menerima 8 pasang baru per bulan untuk menjamin kualitas dan perhatian penuh kepada setiap detail.",
  ctaLabel: "Cek Ketersediaan Slot",
  ctaMessage: "Halo daztore.id, saya tertarik dengan layanan Anda. Apakah masih ada slot?",
  metrics: [
    { slug: "happy-couples", label: "Pasangan Puas", value: "500+" },
    { slug: "premium-rating", label: "Rating Premium", value: "4.9/5" },
    { slug: "support", label: "Support", value: "24/7" },
  ],
}

export const fallbackFinalCta: FinalCtaSection = {
  slug: "final-cta",
  badge: "Hanya 8 slot tersedia bulan ini",
  title: "Mari rangkai",
  highlightedTitle: "kisah Anda bersama.",
  description:
    "Kami hanya menerima jumlah pesanan terbatas setiap bulannya untuk menjaga kualitas dan sentuhan personal. Jadwalkan konsultasi Anda hari ini.",
  primaryCtaLabel: "Chat via WhatsApp",
  primaryCtaMessage: "Halo daztore.id, saya ingin memesan slot konsultasi.",
  secondaryCtaLabel: "hello@daztore.id",
  trustPoints: ["Respon < 1 jam", "Konsultasi gratis", "Pengiriman nasional"],
}

export const fallbackPackageTiers: PackageTier[] = [
  {
    slug: "silver",
    name: "Silver",
    tagline: "Awal yang indah",
    priceLabel: "1.800k",
    icon: "sparkles",
    description: "Paket elegan untuk pasangan yang ingin tampil anggun dengan detail yang terkurasi.",
    features: [
      "1 mahar dengan frame akrilik",
      "3 kotak seserahan premium",
      "Bouquet pengantin klasik",
      "Konsultasi tema & warna",
      "Pengiriman area Jabodetabek",
    ],
    highlighted: false,
    sortOrder: 10,
  },
  {
    slug: "gold",
    name: "Gold",
    tagline: "Paling diminati",
    priceLabel: "3.500k",
    icon: "crown",
    description: "Kombinasi presentasi premium, material terbaik, dan layanan personal yang lengkap.",
    features: [
      "1 mahar custom dengan hiasan floral",
      "6 kotak seserahan premium",
      "Bouquet pengantin signature",
      "Moodboard & styling personal",
      "Dokumentasi foto produk",
      "Pengiriman nasional",
    ],
    highlighted: true,
    sortOrder: 20,
  },
  {
    slug: "exclusive",
    name: "Exclusive",
    tagline: "Karya tanpa batas",
    priceLabel: "6.900k",
    icon: "gem",
    description: "Pengalaman eksklusif dengan desainer kami — setiap detail dirancang hanya untuk Anda.",
    features: [
      "Mahar couture design",
      "10+ kotak seserahan mewah",
      "Bouquet haute couture",
      "Art director pribadi",
      "Video unboxing sinematik",
      "Prioritas jadwal & pengiriman",
    ],
    highlighted: false,
    sortOrder: 30,
  },
]

export const fallbackPackages: PackagesSection = {
  slug: "packages",
  eyebrow: "Signature",
  title: "Paket yang dirancang",
  highlightedTitle: "dengan rasa.",
  description:
    "Tiga pilihan kurasi untuk mengakomodasi setiap visi — dengan fleksibilitas untuk personalisasi sesuai cerita Anda.",
  footerText: "Butuh konsep kustom?",
  footerLinkLabel: "Bicarakan dengan tim kami",
  items: fallbackPackageTiers,
}

export const fallbackLandingPage: LandingPageData = {
  contact: fallbackContact,
  navigation: fallbackNavigation,
  hero: fallbackHero,
  story: fallbackStory,
  process: fallbackProcess,
  features: fallbackFeatures,
  gallery: fallbackGallery,
  testimonials: fallbackTestimonials,
  faq: fallbackFaq,
  urgency: fallbackUrgency,
  finalCta: fallbackFinalCta,
}

export const fallbackCatalog: CatalogData = {
  contact: fallbackContact,
  section: {
    slug: "catalog",
    title: "Katalog Premium",
    description:
      "Jelajahi koleksi eksklusif mahar, seserahan, bouquet, hampers, dan wedding gift boxes yang dirancang khusus untuk hari istimewa Anda.",
    searchPlaceholder: "Cari produk... (mahar, seserahan, bouquet, dll)",
  },
  categories: categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    sortOrder: (index + 1) * 10,
  })),
  products,
}
