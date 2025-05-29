@extends('layouts.app')

@section('title', 'Beranda PublicArt')

@section('hero-section')
<section class="hero">
    <div class="hero-content">
        <h1>Discover Stories<br />That Matter</h1>
        <p class="hero-subtitle">
            Temukan artikel berkualitas, insights mendalam, dan
            perspektif terbaru setiap hari
        </p>
        <div class="search-container">
            <form action="{{ url('/') }}" method="GET" id="searchForm">
                <div class="search-wrapper">
                    <input
                        type="text"
                        name="search" {{-- name attribute untuk query string --}}
                        class="search-input"
                        placeholder="Cari artikel, topik, atau penulis..."
                        id="searchInput"
                        value="{{ $searchQuery ?? '' }}"
                    />
                    <button type="submit" class="search-btn" id="searchBtn">
                        <span>Cari</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>
@endsection

@section('main-content')
<div class="section-header fade-in">
    <h2 class="section-title">Latest Articles</h2>
    <p class="section-subtitle">
        @if(!empty($searchQuery))
            Menampilkan hasil pencarian untuk: <strong>"{{ e($searchQuery) }}"</strong>
        @endif
        @if($currentCategorySlug !== 'all' && $currentCategoryName !== 'Semua' && !Str::contains($currentCategoryName, 'tidak ditemukan'))
            <br>Dalam Kategori: <strong>{{ e($currentCategoryName) }}</strong>
        @elseif (Str::contains($currentCategoryName, 'tidak ditemukan'))
             <br><span style="color: #c0392b;">{{ e($currentCategoryName) }}</span>
        @else
            Artikel terbaru dan terpopuler untuk Anda
        @endif
    </p>
</div>

{{-- Menampilkan pesan error dari API jika ada --}}
@if ($apiErrorMessage)
<div class="fade-in" style="text-align: center; padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 8px; margin-bottom: 2rem;">
    <p><strong>Oops! Terjadi kesalahan:</strong> {{ $apiErrorMessage }}</p>
    @if(config('app.debug'))
        @if(isset($debug_articles_response['debug_response'])) <pre style="font-size:0.8em; text-align:left;">Artikel API Debug: {{ json_encode($debug_articles_response['debug_response'], JSON_PRETTY_PRINT) }}</pre> @endif
        @if(isset($debug_categories_response['debug_response'])) <pre style="font-size:0.8em; text-align:left;">Kategori API Debug: {{ json_encode($debug_categories_response['debug_response'], JSON_PRETTY_PRINT) }}</pre> @endif
        @if(isset($debug_articles_response['debug_exception'])) <pre style="font-size:0.8em; text-align:left;">Artikel Exc Debug: {{ $debug_articles_response['debug_exception'] }}</pre> @endif
    @endif
</div>
@endif


<div class="categories fade-in" id="kategori-section"> {{-- ID untuk navigasi --}}
    @if(!empty($categories))
        {{-- Tombol "Semua" Kategori --}}
        @include('partials.category_button', [
            'category' => ['id' => 'all', 'name' => 'Semua', 'slug' => 'all'],
            'currentCategorySlug' => $currentCategorySlug,
            'searchQuery' => $searchQuery
        ])
        {{-- Daftar Kategori dari API --}}
        @foreach ($categories as $category)
            @include('partials.category_button', [
                'category' => $category,
                'currentCategorySlug' => $currentCategorySlug,
                'searchQuery' => $searchQuery
            ])
        @endforeach
    @else
        @if(!$apiErrorMessage) {{-- Hanya tampilkan jika tidak ada error API utama --}}
        <p class="fade-in" style="text-align: center; color: var(--secondary);">Kategori tidak tersedia saat ini.</p>
        @endif
    @endif
</div>

<div class="articles-preview">
    @if(!empty($articles))
        <div class="articles-grid fade-in" id="articlesGrid">
            @foreach ($articles as $index => $article)
                @include('partials.article_card', ['article' => $article, 'loopIndex' => $loop->index])
            @endforeach
        </div>
    @elseif(!$apiErrorMessage) {{-- Hanya tampilkan jika tidak ada error API utama --}}
        <div class="no-results fade-in">
            <h3>Tidak ada artikel ditemukan</h3>
            <p>
                @if(!empty($searchQuery) || ($currentCategorySlug !== 'all' && !empty($currentCategorySlug)))
                    Coba ubah filter atau kata kunci pencarian Anda.
                @else
                    Belum ada artikel yang dipublikasikan saat ini.
                @endif
            </p>
        </div>
    @endif
    {{-- Tombol "Show More" atau Paginasi bisa ditambahkan di sini jika diimplementasikan --}}
</div>
@endsection