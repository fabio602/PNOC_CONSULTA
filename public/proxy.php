<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Accept, Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$service = $_GET['service'] ?? '';
$path    = $_GET['path'] ?? '';

if (empty($service) || empty($path)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Parâmetros inválidos.']);
    exit();
}

if ($service === 'pncp') {
    $url = 'https://pncp.gov.br/' . ltrim($path, '/');
} elseif ($service === 'empresa') {
    $url = 'https://www.empresaqui.com.br/' . ltrim($path, '/');
} else {
    http_response_code(400);
    echo json_encode(['erro' => 'Serviço inválido.']);
    exit();
}

if (!empty($_SERVER['QUERY_STRING'])) {
    $qs = $_SERVER['QUERY_STRING'];
    $qs = preg_replace('/service=[^&]*&?/', '', $qs);
    $qs = preg_replace('/path=[^&]*&?/', '', $qs);
    $qs = trim($qs, '&');
    if (!empty($qs)) {
        $url .= (strpos($url, '?') === false ? '?' : '&') . $qs;
    }
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; PNCP-Proxy/1.0)',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['erro' => 'Falha na conexão: ' . $error]);
    exit();
}

http_response_code($httpCode);
echo $response;
