<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', 'PublicArtController@home');

// Rute untuk filter kategori dan pencarian akan ditangani oleh controller home dengan query string
// Contoh: /?category=teknologi&search=AI
// Atau jika ingin path yang lebih cantik untuk kategori:
$router->get('/kategori/{category_slug}', 'PublicArtController@home');


// Endpoint internal untuk JavaScript mengambil detail artikel untuk modal
$router->get('/api/internal/article-detail/{id}', 'PublicArtController@getArticleDetailForModal');

// Rute untuk halaman statis jika ada (misal tentang)
$router->get('/tentang', function () {
    // return view('about'); // Jika ada view 'about.blade.php'
    return "Halaman Tentang PublicArt (Belum Dibuat)";
});