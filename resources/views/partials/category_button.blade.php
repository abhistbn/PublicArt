@php
    $isActive = ($currentCategorySlug === $category['slug']) || ($currentCategorySlug === null && $category['slug'] === 'all');
    $queryParams = [];
    if (!empty($searchQuery)) {
        $queryParams['search'] = $searchQuery;
    }
    // Hanya tambahkan parameter kategori jika bukan 'semua'
    if ($category['slug'] !== 'all') {
        $queryParams['category'] = $category['slug'];
        $url = url('/kategori/' . $category['slug']); // Menggunakan path /kategori/slug
    } else {
        $url = url('/'); // Untuk kategori "Semua", kembali ke root dengan search query jika ada
    }
@endphp
<a href="{{ $url . (!empty($queryParams) ? '?' . http_build_query(Arr::except($queryParams, ['category'])) : '') }}"
   class="category-btn {{ $isActive ? 'active' : '' }}"
   data-category-slug="{{ $category['slug'] }}"
   style="{{ isset($category['color']) && !empty($category['color']) ? '--category-color-dynamic:' . e($category['color']) . ';' : '' }}">
    {{ e($category['name']) }}
</a>