<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // Menggunakan HTTP Facade Lumen/Laravel
use Illuminate\Support\Facades\Log;  // Untuk logging error

class PublicArtController extends Controller
{
    protected string $apiArtBaseUrl;

    public function __construct()
    {
        $this->apiArtBaseUrl = rtrim(env('APIART_BASE_URL', 'http://localhost:8000'), '/');
        if (empty($this->apiArtBaseUrl)) {
            Log::error('APIART_BASE_URL is not set in .env file.');
            // Anda bisa throw exception atau handle error di sini
        }
    }

    /**
     * Melakukan fetch data dari ApiArt.
     *
     * @param string $endpoint
     * @param array $queryParams
     * @return array Rrsult dari API ['success' => bool, 'data' => mixed, 'message' => string|null]
     */
    private function fetchFromApiArt(string $endpoint, array $queryParams = []): array
    {
        try {
            $response = Http::timeout(15) // Timeout 15 detik
                            ->get($this->apiArtBaseUrl . $endpoint, $queryParams);

            if ($response->failed()) {
                Log::error("ApiArt Request Failed: {$endpoint}", [
                    'status' => $response->status(),
                    'response_body' => $response->body(),
                    'params' => $queryParams
                ]);
                return [
                    'success' => false,
                    'message' => "Gagal mengambil data dari server (status: {$response->status()}). Coba beberapa saat lagi.",
                    'data' => [],
                    'debug_response' => config('app.debug') ? $response->json() : null
                ];
            }
            // Asumsikan API selalu mengembalikan JSON dengan struktur {success, data, message}
            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("ApiArt Connection Exception: {$endpoint}", ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Tidak dapat terhubung ke server data. Periksa koneksi Anda atau coba lagi nanti.',
                'data' => [],
                'debug_exception' => config('app.debug') ? $e->getMessage() : null
            ];
        } catch (\Exception $e) {
            Log::error("General Exception fetching from ApiArt: {$endpoint}", ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan internal saat mengambil data.',
                'data' => [],
                'debug_exception' => config('app.debug') ? $e->getMessage() : null
            ];
        }
    }

    /**
     * Menampilkan halaman utama PublicArt.
     */
    public function home(Request $request)
    {
        $searchQuery = $request->input('search', '');
        $categorySlugFilter = $request->input('category', 'all'); // Menerima slug kategori dari URL

        // 1. Ambil Kategori Aktif dari ApiArt
        $categoriesResponse = $this->fetchFromApiArt('/public/categories');
        $categories = ($categoriesResponse['success'] && isset($categoriesResponse['data'])) ? $categoriesResponse['data'] : [];

        // 2. Siapkan parameter untuk mengambil Artikel dari ApiArt
        $articleParams = ['per_page' => 999]; // Ambil semua untuk awal, atau implementasi paginasi nanti
        if (!empty($searchQuery)) {
            $articleParams['search'] = $searchQuery;
        }

        $currentCategoryName = 'Semua';
        $selectedCategoryIdForApi = null;

        if ($categorySlugFilter !== 'all' && !empty($categorySlugFilter)) {
            $foundCategory = null;
            foreach ($categories as $cat) {
                if (isset($cat['slug']) && $cat['slug'] === $categorySlugFilter) {
                    $foundCategory = $cat;
                    break;
                }
            }
            if ($foundCategory && isset($foundCategory['id'])) {
                $articleParams['category_id'] = $foundCategory['id']; // Kirim ID kategori ke API
                $currentCategoryName = $foundCategory['name'] ?? $categorySlugFilter;
            } else if ($categorySlugFilter !== 'all') {
                 // Jika slug dikirim tapi tidak ditemukan di list kategori aktif,
                 // API artikel mungkin akan mengembalikan kosong jika difilter dengan ID yang tidak valid.
                 // Atau bisa juga kirim slug jika API artikel mendukungnya.
                 // Untuk saat ini kita mengandalkan API yang memfilter berdasarkan category_id
                 Log::warning("Category slug '{$categorySlugFilter}' not found in active categories list.");
                 // Tetap tampilkan "kategori tidak ditemukan" di view jika perlu.
                 $currentCategoryName = "Kategori '{$categorySlugFilter}' tidak ditemukan";
            }
        }

        // 3. Ambil Artikel Terpublikasi dari ApiArt
        $articlesResponse = $this->fetchFromApiArt('/public/articles', $articleParams);
        $articles = ($articlesResponse['success'] && isset($articlesResponse['data'])) ? $articlesResponse['data'] : [];
        $apiErrorMessage = !$articlesResponse['success'] ? $articlesResponse['message'] : null;


        return view('home', [
            'categories' => $categories,
            'articles' => $articles,
            'currentCategorySlug' => $categorySlugFilter,
            'currentCategoryName' => $currentCategoryName,
            'searchQuery' => $searchQuery,
            'apiErrorMessage' => $apiErrorMessage,
            'debug_articles_response' => config('app.debug') ? $articlesResponse : null,
            'debug_categories_response' => config('app.debug') ? $categoriesResponse : null,
        ]);
    }

    /**
     * Mengambil detail artikel dari ApiArt untuk ditampilkan di modal (via AJAX).
     * Endpoint: GET /publicart/api/internal/article-detail/{id}
     */
    public function getArticleDetailForModal($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            return response()->json(['success' => false, 'message' => 'ID Artikel tidak valid.'], 400);
        }

        $articleResponse = $this->fetchFromApiArt("/public/articles/{$id}");

        if ($articleResponse['success'] && !empty($articleResponse['data'])) {
            return response()->json($articleResponse); // Kembalikan response JSON dari ApiArt
        }

        $message = $articleResponse['message'] ?? 'Artikel tidak ditemukan atau gagal diambil dari API.';
        $statusCode = ($articleResponse['success'] === false && isset($articleResponse['debug_response']['status']) && $articleResponse['debug_response']['status'] == 404) ? 404 : 500;

        return response()->json([
            'success' => false,
            'message' => $message,
            'debug' => config('app.debug') ? ($articleResponse['debug_response'] ?? $articleResponse['debug_exception'] ?? null) : null
        ], $statusCode);
    }
}