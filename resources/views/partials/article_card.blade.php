@php
    // Helper untuk format tanggal
    if (!function_exists('formatPublikasiTanggal')) {
        function formatPublikasiTanggal($dateStringISO) {
            if (empty($dateStringISO)) return 'Segera';
            try {
                // Coba parse dengan Carbon, jika gagal, kembalikan string asli
                return \Carbon\Carbon::parse($dateStringISO)->locale('id_ID')->isoFormat('D MMMM YYYY');
            } catch (\Exception $e) {
                return $dateStringISO; // Fallback
            }
        }
    }
    $defaultImage = 'https://via.placeholder.com/400x250/e6d1d8/391e22?text=PublicArt'; // Gambar placeholder
    $featuredImage = $article['featured_image'] ?? $defaultImage;
    // Validasi URL sederhana
    if (!filter_var($featuredImage, FILTER_VALIDATE_URL)) {
        $featuredImage = $defaultImage;
    }

    // Menyiapkan summary jika tidak ada atau terlalu panjang
    $summary = $article['summary'] ?? '';
    if (empty($summary) && isset($article['content'])) {
        $summary = strip_tags($article['content']); // Hapus tag HTML
        $summary = \Illuminate\Support\Str::words($summary, 25, '...'); // Ambil 25 kata pertama
    } else {
        $summary = \Illuminate\Support\Str::words(strip_tags($summary), 25, '...');
    }
@endphp
<article class="article-card fade-in" style="animation-delay: {{ ($loopIndex ?? 0) * 0.1 }}s;" data-article-id="{{ $article['id'] }}">
    {{-- Tambahkan gambar fitur di sini jika desain mengizinkan --}}
    {{-- <img src="{{ e($featuredImage) }}" alt="{{ e($article['title'] ?? 'Gambar Artikel') }}" class="article-card-image" style="width:100%; height:180px; object-fit:cover; border-radius: 16px 16px 0 0; margin-bottom:1rem;"> --}}
    <div class="article-meta">
        <span class="article-category" style="{{ isset($article['category_color']) && !empty($article['category_color']) ? 'background-color:'.e($article['category_color']).'; color: white;' : '' }}">
            {{ e($article['category_name'] ?? 'Umum') }}
        </span>
        <span class="article-date">
            {{ e($article['formatted_published_at'] ?? formatPublikasiTanggal($article['published_at'] ?? $article['created_at'])) }}
        </span>
    </div>
    <h3 class="article-title">{{ e($article['title'] ?? 'Judul Tidak Tersedia') }}</h3>
    <p class="article-summary">{{ e($summary) }}</p>
    <a href="#" class="read-more" data-article-id="{{ $article['id'] }}">Baca Selengkapnya</a>
</article>