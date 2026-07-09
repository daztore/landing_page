begin;

insert into public.site_settings (key, value, is_public, is_active)
values (
  'contact',
  $json$
  {
    "brandName": "daztore",
    "brandSuffix": ".id",
    "footerDescription": "Premium wedding atelier untuk mahar, seserahan, dan flower bouquet. Dirancang dengan ketelitian. Dihadirkan dengan kehangatan.",
    "whatsappNumber": "6287756877555",
    "email": "hello@daztore.id",
    "instagramUrl": "https://instagram.com/daztore.id",
    "instagramHandle": "@daztore.id",
    "location": "Jakarta",
    "deliveryArea": "Melayani pengiriman nasional",
    "privacyUrl": "#",
    "termsUrl": "#"
  }
  $json$::jsonb,
  true,
  true
)
on conflict (key) do update set
  value = excluded.value,
  is_public = excluded.is_public,
  is_active = excluded.is_active;

insert into public.landing_sections (
  slug,
  eyebrow,
  title,
  highlighted_title,
  description,
  image_url,
  image_alt,
  content,
  sort_order,
  is_active
)
values
  (
    'hero',
    null,
    'Setiap cinta layak',
    'dirayakan dengan indah.',
    'daztore.id menghadirkan mahar, seserahan, dan flower bouquet yang dirancang dengan ketelitian, keanggunan, dan sentuhan personal — untuk hari paling berharga dalam hidup Anda.',
    'hero-mahar.webp',
    'Mahar pernikahan premium dengan bunga mawar putih dan aksen emas',
    $json$
    {
      "badge": "Premium Wedding Atelier",
      "primaryCtaLabel": "Mulai Konsultasi",
      "primaryCtaMessage": "Halo daztore.id, saya tertarik dengan layanan Anda.",
      "secondaryCtaLabel": "Lihat Katalog",
      "secondaryCtaHref": "/katalog",
      "mobileBackgroundUrl": "bouquet-bg.jpg",
      "collectionTitle": "Signature Collection",
      "collectionSubtitle": "Handcrafted with love",
      "accentLabel": "Limited",
      "accentValue": "Hanya 8 slot / bulan"
    }
    $json$::jsonb,
    10,
    true
  ),
  (
    'story',
    'Our Story',
    'Mahar & seserahan,',
    'lebih dari sekadar tradisi.',
    'Di balik setiap mahar, ada janji. Di balik setiap seserahan, ada harapan. daztore.id percaya bahwa tradisi yang indah layak dirayakan dengan presentasi yang sepadan — penuh ketelitian, keanggunan, dan kehangatan.',
    'story-hands.jpg',
    'Tangan sedang merangkai seserahan pernikahan mewah',
    $json$
    {
      "secondaryDescription": "Kami mendampingi Anda dari konsep awal hingga hari H — memastikan setiap elemen mencerminkan kisah cinta Anda berdua.",
      "establishedLabel": "Est. 2018",
      "locationLabel": "Jakarta · Indonesia"
    }
    $json$::jsonb,
    20,
    true
  ),
  (
    'process',
    null,
    'Proses Kami',
    null,
    'Dari visi menjadi kenyataan dalam empat langkah sempurna yang dirancang untuk kesuksesan hari istimewa Anda.',
    null,
    null,
    '{}'::jsonb,
    30,
    true
  ),
  (
    'features',
    null,
    'Mengapa Memilih daztore.id',
    null,
    'Kami adalah mitra terpercaya untuk mewujudkan setiap detail impian pernikahan Anda dengan sempurna.',
    null,
    null,
    '{}'::jsonb,
    40,
    true
  ),
  (
    'gallery',
    'Portfolio',
    'Galeri momen',
    'yang kami rayakan.',
    'Kumpulan karya terpilih dari perjalanan cinta pasangan yang telah mempercayakan momen mereka kepada daztore.id.',
    null,
    null,
    '{}'::jsonb,
    50,
    true
  ),
  (
    'testimonials',
    null,
    'Cerita Pasangan Bahagia',
    null,
    'Ratusan pasangan telah mempercayai daztore.id untuk mewujudkan hari istimewa mereka.',
    null,
    null,
    '{}'::jsonb,
    60,
    true
  ),
  (
    'faq',
    null,
    'Pertanyaan Umum',
    null,
    'Temukan jawaban untuk pertanyaan paling sering diajukan tentang layanan kami.',
    null,
    null,
    $json$
    {
      "ctaText": "Masih ada pertanyaan? Hubungi kami langsung!",
      "ctaLabel": "Hubungi via WhatsApp →",
      "ctaMessage": ""
    }
    $json$::jsonb,
    70,
    true
  ),
  (
    'urgency',
    null,
    'Slot Terbatas Setiap Bulan',
    null,
    'Kami hanya menerima 8 pasang baru per bulan untuk menjamin kualitas dan perhatian penuh kepada setiap detail.',
    null,
    null,
    $json$
    {
      "ctaLabel": "Cek Ketersediaan Slot",
      "ctaMessage": "Halo daztore.id, saya tertarik dengan layanan Anda. Apakah masih ada slot?"
    }
    $json$::jsonb,
    80,
    true
  ),
  (
    'final-cta',
    null,
    'Mari rangkai',
    'kisah Anda bersama.',
    'Kami hanya menerima jumlah pesanan terbatas setiap bulannya untuk menjaga kualitas dan sentuhan personal. Jadwalkan konsultasi Anda hari ini.',
    null,
    null,
    $json$
    {
      "badge": "Hanya 8 slot tersedia bulan ini",
      "primaryCtaLabel": "Chat via WhatsApp",
      "primaryCtaMessage": "Halo daztore.id, saya ingin memesan slot konsultasi.",
      "secondaryCtaLabel": "hello@daztore.id"
    }
    $json$::jsonb,
    90,
    true
  ),
  (
    'catalog',
    null,
    'Katalog Premium',
    null,
    'Jelajahi koleksi eksklusif mahar, seserahan, bouquet, hampers, dan wedding gift boxes yang dirancang khusus untuk hari istimewa Anda.',
    null,
    null,
    $json$
    {
      "searchPlaceholder": "Cari produk... (mahar, seserahan, bouquet, dll)"
    }
    $json$::jsonb,
    100,
    true
  ),
  (
    'packages',
    'Signature',
    'Paket yang dirancang',
    'dengan rasa.',
    'Tiga pilihan kurasi untuk mengakomodasi setiap visi — dengan fleksibilitas untuk personalisasi sesuai cerita Anda.',
    null,
    null,
    $json$
    {
      "footerText": "Butuh konsep kustom?",
      "footerLinkLabel": "Bicarakan dengan tim kami"
    }
    $json$::jsonb,
    110,
    true
  )
on conflict (slug) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  highlighted_title = excluded.highlighted_title,
  description = excluded.description,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  content = excluded.content,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.landing_items (
  section_slug,
  slug,
  title,
  description,
  icon,
  label,
  value,
  sort_order,
  is_active
)
values
  ('hero', 'couples', null, null, null, 'Couples', '500+', 10, true),
  ('hero', 'rating', null, null, null, 'Rating', '4.9 / 5', 20, true),
  ('hero', 'years', null, null, null, 'Tahun', '7+', 30, true),
  ('story', 'made-with-heart', 'Dibuat dengan Hati', 'Setiap detail dirangkai dengan perhatian dan makna — mewakili cinta yang tulus.', 'heart', null, null, 10, true),
  ('story', 'natural-aesthetic', 'Estetika Natural', 'Perpaduan bunga segar, tekstur premium, dan palet warna yang tenang dan anggun.', 'flower', null, null, 20, true),
  ('story', 'premium-material', 'Material Premium', 'Kami memilih bahan terbaik — dari kotak akrilik hingga sutra — tanpa kompromi.', 'gem', null, null, 30, true),
  ('process', 'consultation', 'Konsultasi Mendalam', 'Kami mendengarkan visi, preferensi, dan setiap detail impian pernikahan Anda dengan penuh perhatian.', null, null, '01', 10, true),
  ('process', 'design-proposal', 'Desain & Proposal', 'Tim kreatif kami merancang konsep yang sempurna, dari warna hingga setiap elemen dekorasi.', null, null, '02', 20, true),
  ('process', 'premium-production', 'Produksi Premium', 'Setiap produk dikerjakan dengan keahlian tinggi, material berkualitas, dan sentuhan personal.', null, null, '03', 30, true),
  ('process', 'finalization-delivery', 'Finalisasi & Pengiriman', 'Inspeksi kualitas akhir dan pengiriman tepat waktu memastikan kesempurnaan hari Anda.', null, null, '04', 40, true),
  ('features', 'premium-quality', 'Kualitas Premium', 'Setiap produk dipilih dan dirancang dengan standar kualitas tertinggi untuk kesempurnaan maksimal.', 'award', null, null, 10, true),
  ('features', 'personal-touch', 'Sentuhan Personal', 'Kami memahami setiap cerita cinta Anda dan mengubahnya menjadi sesuatu yang unik dan berkesan.', 'heart', null, null, 20, true),
  ('features', 'fast-production', 'Pengerjaan Cepat', 'Proses produksi yang efisien tanpa mengorbankan kualitas, cocok untuk timeline yang ketat.', 'zap', null, null, 30, true),
  ('features', 'experienced-team', 'Tim Berpengalaman', 'Lebih dari 7 tahun melayani ratusan pasangan dengan dedikasi dan profesionalisme tinggi.', 'users', null, null, 40, true),
  ('urgency', 'happy-couples', null, null, null, 'Pasangan Puas', '500+', 10, true),
  ('urgency', 'premium-rating', null, null, null, 'Rating Premium', '4.9/5', 20, true),
  ('urgency', 'support', null, null, null, 'Support', '24/7', 30, true),
  ('final-cta', 'response-time', null, null, null, 'Respon < 1 jam', null, 10, true),
  ('final-cta', 'free-consultation', null, null, null, 'Konsultasi gratis', null, 20, true),
  ('final-cta', 'national-delivery', null, null, null, 'Pengiriman nasional', null, 30, true)
on conflict (section_slug, slug) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  label = excluded.label,
  value = excluded.value,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.navigation_items (
  slug,
  label,
  href,
  placement,
  badge,
  icon,
  is_disabled,
  sort_order,
  is_active
)
values
  ('story', 'Cerita', '#story', 'header', null, null, false, 10, true),
  ('packages', 'Katalog', '/katalog', 'header', null, null, false, 20, true),
  ('gallery', 'Galeri', '#gallery', 'header', null, null, false, 30, true),
  ('testimonials', 'Testimoni', '#testimonials', 'header', null, null, false, 40, true),
  ('contact', 'Kontak', '#contact', 'header', null, null, false, 50, true),
  ('catalog-cta', 'Katalog', '/katalog', 'header_cta', null, null, false, 10, true),
  ('home-mobile', 'Beranda', '#top', 'mobile', null, '🏠', false, 10, true),
  ('catalog-mobile', 'Katalog', '/katalog', 'mobile', null, '📦', false, 20, true),
  ('packages-mobile', 'Katalog', '/katalog', 'mobile', null, '💎', false, 30, true),
  ('chat-mobile', 'Chat', 'whatsapp', 'mobile', null, '💬', false, 40, true),
  ('story-footer', 'Cerita', '#story', 'footer', null, null, false, 10, true),
  ('packages-footer', 'Katalog', '/katalog', 'footer', null, null, false, 20, true),
  ('gallery-footer', 'Galeri', '#gallery', 'footer', null, null, false, 30, true),
  ('testimonials-footer', 'Testimoni', '#testimonials', 'footer', null, null, false, 40, true)
on conflict (slug, placement) do update set
  label = excluded.label,
  href = excluded.href,
  badge = excluded.badge,
  icon = excluded.icon,
  is_disabled = excluded.is_disabled,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.gallery_items (
  slug,
  label,
  image_url,
  image_alt,
  grid_span,
  sort_order,
  is_active
)
values
  ('mahar-classic', 'Mahar Classic', 'gallery/gallery-1.jpg', 'Mahar premium dengan koin emas dan mawar putih', 'md:row-span-2', 10, true),
  ('bridal-bouquet', 'Bridal Bouquet', 'gallery/gallery-2.jpg', 'Bouquet pengantin dengan mawar dan peony', '', 20, true),
  ('seserahan-set', 'Seserahan Set', 'gallery/gallery-3.jpg', 'Kotak seserahan mewah dengan bunga dan pita emas', '', 30, true),
  ('ring-pillow', 'Ring Pillow', 'gallery/gallery-4.jpg', 'Cincin pernikahan emas pada bantalan beludru krem', 'md:row-span-2', 40, true),
  ('flower-stand', 'Flower Stand', 'gallery/gallery-5.jpg', 'Rangkaian bunga segar dalam vas kaca bening', '', 50, true),
  ('money-bouquet', 'Money Bouquet', 'gallery/gallery-6.jpg', 'Money bouquet mahar dalam bingkai emas berhias mutiara', '', 60, true)
on conflict (slug) do update set
  label = excluded.label,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  grid_span = excluded.grid_span,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.testimonials (
  slug,
  display_variant,
  name,
  subtitle,
  content,
  rating,
  avatar,
  sort_order,
  is_active
)
values
  ('sarah-reza', 'grid', 'Sarah & Reza', 'Jakarta', 'daztore.id berhasil mewujudkan setiap detail visi kami. Dari mahar hingga seserahan, semuanya sempurna dan melampaui ekspektasi!', 5, '👰', 10, true),
  ('dewi-aldi', 'grid', 'Dewi & Aldi', 'Surabaya', 'Tim daztore sangat profesional, responsif, dan mendengarkan setiap masukan kami. Hasil akhirnya benar-benar magical!', 5, '💍', 20, true),
  ('ayu-hari', 'grid', 'Ayu & Hari', 'Bandung', 'Proses kustomisasi yang smooth, komunikasi yang jelas, dan hasil yang memukau. Terima kasih sudah membuat hari kami sempurna!', 5, '🌹', 30, true),
  ('anindya-rizki', 'carousel', 'Anindya & Rizki', 'Menikah, Mei 2024', 'daztore.id memahami visi kami bahkan sebelum kami menjelaskan semuanya. Setiap detail mahar terasa seperti cerminan cinta kami. Tamu-tamu tidak berhenti memuji!', 5, null, 10, true),
  ('kirana-aldo', 'carousel', 'Kirana & Aldo', 'Menikah, Agustus 2024', 'Seserahan yang dibuat benar-benar breathtaking. Tim mereka sangat sabar, detail, dan menghadirkan hasil yang melampaui ekspektasi. Worth every penny.', 5, null, 20, true),
  ('nadira-fariz', 'carousel', 'Nadira & Fariz', 'Menikah, November 2023', 'Bouquet dari daztore.id masih saya simpan sampai sekarang — indahnya tidak lekang oleh waktu. Pelayanan personal yang sulit ditemukan di tempat lain.', 5, null, 30, true),
  ('salma-bima', 'carousel', 'Salma & Bima', 'Menikah, Februari 2025', 'Proses dari konsultasi hingga hari H sangat mulus. Mereka benar-benar mengangkat cerita kami menjadi sesuatu yang visual dan emosional.', 5, null, 40, true)
on conflict (slug, display_variant) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  content = excluded.content,
  rating = excluded.rating,
  avatar = excluded.avatar,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.faqs (slug, question, answer, sort_order, is_active)
values
  ('production-time', 'Berapa lama waktu produksi mahar dan seserahan?', 'Waktu produksi tergantung kompleksitas desain. Untuk mahar standar 7-10 hari, seserahan premium 14-21 hari. Kami juga menerima rush order dengan tambahan biaya.', 10, true),
  ('customization', 'Apakah produk dapat dikustomisasi sesuai keinginan?', 'Ya, semua produk dapat dikustomisasi. Dari pemilihan warna, material, hingga desain khusus. Tim kreatif kami siap mewujudkan visi Anda.', 20, true),
  ('quality-guarantee', 'Bagaimana dengan jaminan kualitas produk?', 'Setiap produk melalui quality control ketat sebelum dikirim. Kami menggunakan material premium dan pengerjaan profesional. Kepuasan Anda adalah jaminan kami.', 30, true),
  ('payment-delivery', 'Bagaimana proses pembayaran dan pengiriman?', 'Pembayaran dapat dilakukan via transfer bank dengan sistem DP+Pelunasan. Pengiriman tersedia untuk seluruh Indonesia dengan packaging premium dan asuransi pengiriman.', 40, true),
  ('free-consultation', 'Apakah ada gratis konsultasi awal?', 'Ya, konsultasi awal sepenuhnya gratis! Hubungi kami via WhatsApp dan tim kami akan membantu merancang paket yang sempurna untuk hari istimewa Anda.', 50, true),
  ('revision', 'Bagaimana jika saya tidak puas dengan hasil?', 'Kami berkomitmen 100% kepuasan pelanggan. Jika ada hal yang perlu diperbaiki, kami akan melakukan revisi sesuai kebutuhan Anda tanpa biaya tambahan.', 60, true)
on conflict (slug) do update set
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.product_categories (slug, name, emoji, sort_order, is_active)
values
  ('mahar', 'Mahar', '💍', 10, true),
  ('seserahan', 'Seserahan', '🎁', 20, true),
  ('bouquet', 'Bouquet', '🌹', 30, true),
  ('hampers', 'Hampers', '🎀', 40, true),
  ('gift-box', 'Wedding Gift Box', '💝', 50, true),
  ('custom', 'Paket Custom', '✨', 60, true)
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.products (
  slug,
  category_slug,
  title,
  description,
  start_price,
  end_price,
  image_url,
  badge,
  processing_time,
  is_customizable,
  is_available,
  sort_order,
  is_active
)
values
  ('mahar-1', 'mahar', 'Mahar Signature Gold', 'Mahar premium dengan rangkaian koin emas dan aksesoris kristal dalam presentasi luxury frame.', 3500000, 5000000, 'mahar/gallery-1.jpg', 'bestseller', '7-10 hari', true, true, 10, true),
  ('mahar-2', 'mahar', 'Mahar Elegan Minimalis', 'Desain minimalis modern dengan perhiasan emas putih dan bunga segar yang elegan.', 2500000, 3800000, 'mahar/gallery-4.jpg', 'loved', '5-7 hari', true, true, 20, true),
  ('seserahan-1', 'seserahan', 'Seserahan Deluxe Premium', 'Paket seserahan lengkap dengan sarung, perhiasan, kain premium, dan aksesoris mewah dalam box eksklusif.', 8000000, 15000000, 'seserahan/gallery-3.jpg', 'bestseller', '14-21 hari', true, true, 30, true),
  ('seserahan-2', 'seserahan', 'Seserahan Elegant Box', 'Seserahan medium dengan 5 item pilihan: kain batik premium, selendang sutra, dan perhiasan elegan.', 5000000, 8000000, 'seserahan/gallery-2.jpg', null, '10-14 hari', true, true, 40, true),
  ('bouquet-1', 'bouquet', 'Bridal Bouquet Romantis', 'Rangkaian bunga fresh dengan mawar putih, hydrangea, dan eucalyptus dalam sentuhan emas.', 2000000, 3500000, 'bouquet/gallery-2.jpg', 'loved', '2-3 hari sebelum acara', true, true, 50, true),
  ('bouquet-2', 'bouquet', 'Bouquet Minimalis Chic', 'Desain minimalis dengan bunga pilihan berkualitas tinggi, cocok untuk pelengkap dekorasi modern.', 1500000, 2500000, 'bouquet/gallery-5.jpg', null, '2-3 hari sebelum acara', true, true, 60, true),
  ('hampers-1', 'hampers', 'Hampers Luxury Wedding', 'Hampers premium berisi produk kecantikan dan perawatan premium, coklat artisan, dan aksesoris eksklusif.', 4000000, 7000000, 'hampers/gallery-1.jpg', 'limited', '7-10 hari', true, true, 70, true),
  ('hampers-2', 'hampers', 'Hampers Gift Elegant', 'Pilihan hampers dengan isi kosmestik premium, parfum branded, dan perlengkapan pernikahan.', 3000000, 5000000, 'hampers/gallery-6.jpg', null, '7-10 hari', true, true, 80, true),
  ('gift-1', 'gift-box', 'Wedding Gift Box Premium', 'Box hadiah pernikahan eksklusif dengan packaging premium dan pilihan item luxury di dalamnya.', 3500000, 6000000, 'gift-box/hero-mahar.jpg', null, '7-10 hari', true, true, 90, true),
  ('custom-1', 'custom', 'Paket Custom Unlimited', 'Desain sesuai visi Anda: kombinasi mahar, seserahan, bouquet, dan dekorasi dengan kustomisasi penuh.', 15000000, null, 'custom/story-hands.jpg', 'loved', 'Konsultasi mendalam', true, true, 100, true)
on conflict (slug) do update set
  category_slug = excluded.category_slug,
  title = excluded.title,
  description = excluded.description,
  start_price = excluded.start_price,
  end_price = excluded.end_price,
  image_url = excluded.image_url,
  badge = excluded.badge,
  processing_time = excluded.processing_time,
  is_customizable = excluded.is_customizable,
  is_available = excluded.is_available,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.package_tiers (
  slug,
  name,
  tagline,
  price_label,
  icon,
  description,
  features,
  is_highlighted,
  sort_order,
  is_active
)
values
  (
    'silver',
    'Silver',
    'Awal yang indah',
    '1.800k',
    'sparkles',
    'Paket elegan untuk pasangan yang ingin tampil anggun dengan detail yang terkurasi.',
    array[
      '1 mahar dengan frame akrilik',
      '3 kotak seserahan premium',
      'Bouquet pengantin klasik',
      'Konsultasi tema & warna',
      'Pengiriman area Jabodetabek'
    ],
    false,
    10,
    true
  ),
  (
    'gold',
    'Gold',
    'Paling diminati',
    '3.500k',
    'crown',
    'Kombinasi presentasi premium, material terbaik, dan layanan personal yang lengkap.',
    array[
      '1 mahar custom dengan hiasan floral',
      '6 kotak seserahan premium',
      'Bouquet pengantin signature',
      'Moodboard & styling personal',
      'Dokumentasi foto produk',
      'Pengiriman nasional'
    ],
    true,
    20,
    true
  ),
  (
    'exclusive',
    'Exclusive',
    'Karya tanpa batas',
    '6.900k',
    'gem',
    'Pengalaman eksklusif dengan desainer kami — setiap detail dirancang hanya untuk Anda.',
    array[
      'Mahar couture design',
      '10+ kotak seserahan mewah',
      'Bouquet haute couture',
      'Art director pribadi',
      'Video unboxing sinematik',
      'Prioritas jadwal & pengiriman'
    ],
    false,
    30,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  price_label = excluded.price_label,
  icon = excluded.icon,
  description = excluded.description,
  features = excluded.features,
  is_highlighted = excluded.is_highlighted,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

commit;

