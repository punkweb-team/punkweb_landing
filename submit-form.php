<?php
// submit-form.php
file_put_contents("debug.txt", file_get_contents('php://input'));

header('Content-Type: application/json');

$token = "8231231806:AAHVMJp-t_UpFL4evnXqabwmbfWsB6Kzvpw";
$chat_id = "-5084912564";

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

// Проверка JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Bad JSON"]);
    exit;
}

// Проверка обязательных полей
if (!$input || empty($input['name']) || empty($input['email']) || empty($input['phone'])) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'error'=>'Missing fields']);
    exit;
}

// Устанавливаем временную зону Москва (MSK)
date_default_timezone_set('Europe/Moscow');

// Экранируем текст для HTML
function h($s) {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE);
}

// Формируем красивое сообщение с HTML
$text = "🚀 <b>Новая заявка с сайта</b>\n";
$text .= "────────────────────────\n";
$text .= "👤 <b>Имя:</b> " . h($input['name']) . "\n";
$text .= "📧 <a href='mailto:" . h($input['email']) . "'>" . h($input['email']) . "</a>\n";
$text .= "📱 <a href='tel:" . preg_replace('/\D/', '', $input['phone']) . "'>" . h($input['phone']) . "</a>\n";
$text .= "────────────────────────\n";
$text .= "🕒 " . date("d.m.Y H:i:s"); // Вывод по МСК

// URL Telegram API
$url = "https://api.telegram.org/bot$token/sendMessage";
$data = [
    "chat_id" => $chat_id,
    "text" => $text,
    "parse_mode" => "HTML"
];

// Отправка через cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$result = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

// Ответ для JS
if ($result === false || $err) {
    echo json_encode(['success' => false, 'error' => 'Telegram API error: ' . $err]);
} else {
    $decoded = json_decode($result, true);
    echo json_encode(['success' => $decoded['ok'] ?? false, 'telegram' => $decoded]);
}
