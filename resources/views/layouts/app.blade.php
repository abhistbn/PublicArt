<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PublicArt - @yield('title', 'Discover Stories That Matter')</title>
    <link rel="stylesheet" href="{{ url('/css/homepage.css') }}" />
    <script>
        // Variabel global untuk JavaScript jika dibutuhkan
        const APP_URL = "{{ rtrim(url('/'), '/') }}";
        // Endpoint untuk mengambil detail artikel oleh JS
        const ARTICLE_DETAIL_ENDPOINT = "{{ url('/api/internal/article-detail') }}";
    </script>
</head>
<body>
    <nav class="nav-container">
        <div class="nav-content">
            <a href="{{ url('/') }}" class="logo">PublicArt</a>
            <ul class="nav-menu">
                <li><a href="{{ url('/') }}">Beranda</a></li>
                <li><a href="{{ url('/#artikel') }}">Artikel</a></li>
                <li><a href="{{ url('/#kategori-section') }}">Kategori</a></li> {{-- Pastikan ID ini ada --}}
                <li><a href="{{ url('/tentang') }}">Tentang</a></li>
            </ul>
        </div>
    </nav>

    @yield('hero-section')

    <main class="main-content" id="artikel">
        @yield('main-content')
    </main>

    @include('partials.article_modal') {{-- Modal selalu ada di layout --}}

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; {{ date('Y') }} PublicArt - Modern Content Portal. Crafted with passion.</p>
        </div>
    </footer>

    <script src="{{ url('/js/homepage.js') }}"></script>
    @stack('page-scripts') {{-- Untuk script tambahan per halaman --}}
</body>
</html>