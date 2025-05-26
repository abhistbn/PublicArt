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

$router->get('/', function () use ($router) {
    return $router->app->version();
});

// homepage
$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->group(['prefix' => 'api'], function () use ($router) {
    // Articles routes
    $router->get('articles', 'ArticleController@index');
    $router->get('articles/{id}', 'ArticleController@show');
    $router->post('articles', 'ArticleController@store');
    $router->put('articles/{id}', 'ArticleController@update');
    $router->delete('articles/{id}', 'ArticleController@destroy');
    
    // Categories routes
    $router->get('categories', 'CategoryController@index');
    $router->post('categories', 'CategoryController@store');
});
