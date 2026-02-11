<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

$token = "8231231806:AAHVMJp-t_UpFL4evnXqabwmbfWsB6Kzvpw";
$chat_id = "-5084912564";

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!$input || json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'error' => 'Invalid JSON'
    ));
    exit;
}

if (empty($input['name']) || empty($input['email']) || empty($input['phone'])) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'error' => 'Missing fields'
    ));
    exit;
}

date_default_timezone_set('Europe/Moscow');

function h($s) {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

$text  = "🚀 <b>Новая заявка с сайта</b>\n";
$text .= "👤 <b>Имя:</b> " . h($input['name']) . "\n";
$text .= "📧 <b>Email:</b> " . h($input['email']) . "\n";
$text .= "📱 <b>Телефон:</b> " . h($input['phone']) . "\n";
$text .= "🕒 " . date("d.m.Y H:i:s");

$url = "https://api.telegram.org/bot".$token."/sendMessage";

$data = array(
    'chat_id' => $chat_id,
    'text' => $text,
    'parse_mode' => 'HTML'
);

$options = array(
    'http' => array(
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => json_encode($data),
        'timeout' => 5
    )
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === false) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Telegram API request failed'
    ));
    exit;
}

$response = json_decode($result, true);

echo json_encode(array(
    'success' => isset($response['ok']) ? $response['ok'] : false
));
