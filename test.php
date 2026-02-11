<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'allow_url_fopen' => ini_get('allow_url_fopen'),
    'openssl' => extension_loaded('openssl'),
]);