<?php

/**
 * Lumen - A PHP Micro-Framework By Laravel
 *
 * @author    Taylor Otwell <taylor@laravel.com>
 * @copyright Copyright (c) Taylor Otwell
 * @link      http://lumen.laravel.com
 * @license   http://www.opensource.org/licenses/mit-license.php MIT License
 */

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| Here we will load the environment and create the application instance
| that serves as the central piece of this framework. We'll use this
| application to register and boot the framework's core components.
|
*/

$app = require __DIR__.'/../bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request
| through the kernel, and send the associated response back to
| the client's browser allowing them to enjoy the creative
| and wonderful application we have prepared for them.
|
*/

$app->run();