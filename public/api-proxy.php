<?php
/**
 * API Proxy for cPanel — with caching for GET requests
 */

ini_set('max_execution_time', 120);
ini_set('memory_limit', '256M');
ini_set('post_max_size', '50M');
ini_set('upload_max_filesize', '50M');

$API_HOST = '/api';
$CACHE_DIR = __DIR__ . '/.api-cache';
$CACHE_TTL = 60; // 60 seconds for GET requests

// Ensure cache dir exists
if (!is_dir($CACHE_DIR)) {
    @mkdir($CACHE_DIR, 0755, true);
}

// Resolve path
if (isset($_GET['_path'])) {
    $path = $_GET['_path'];
    $query = $_GET;
    unset($query['_path']);
    $queryStr = http_build_query($query);
    if ($queryStr) $path .= '?' . $queryStr;
} else {
    $path = $_SERVER['REQUEST_URI'];
}
$target = $API_HOST . $path;

$method = $_SERVER['REQUEST_METHOD'];

// CORS preflight
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

// Try cache for public GET requests (no admin, no auth header)
$apiKey = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';
$isAdminPath = strpos($path, '/api/admin/') !== false;
$useCache = ($method === 'GET' && !$isAdminPath && !$apiKey);

if ($useCache) {
    $cacheKey = md5($path);
    $cacheFile = "$CACHE_DIR/$cacheKey.cache";
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $CACHE_TTL) {
        $cached = unserialize(file_get_contents($cacheFile));
        http_response_code($cached['status']);
        header('Content-Type: ' . $cached['content_type']);
        header('Access-Control-Allow-Origin: *');
        header('X-Proxy-Cache: HIT');
        echo $cached['body'];
        exit;
    }
}

// Detect multipart/form-data (file uploads)
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false;

if ($isMultipart) {
    // php://input is not available for multipart/form-data
    // Rebuild the post data from $_POST and $_FILES
    $postFields = $_POST;
    foreach ($_FILES as $key => $file) {
        if ($file['error'] === UPLOAD_ERR_OK) {
            $postFields[$key] = new CURLFile(
                $file['tmp_name'],
                $file['type'],
                $file['name']
            );
        }
    }
    $body = null;
} else {
    $postFields = null;
    $body = file_get_contents('php://input');
}

$headers = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if (in_array($lower, ['host', 'content-length', 'accept-encoding'])) continue;
    // Don't forward Content-Type for multipart — curl sets it with the correct boundary
    if ($isMultipart && $lower === 'content-type') continue;
    $headers[] = "$name: $value";
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $target,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TCP_NODELAY => true,
    CURLOPT_ENCODING => 'gzip, deflate',
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
]);

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    if ($isMultipart && $postFields) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } elseif ($body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
}

$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    curl_close($ch);
    http_response_code(502);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['error' => 'Proxy error', 'message' => $error]);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

http_response_code($httpCode);

$headerLines = explode("\r\n", $responseHeaders);
foreach ($headerLines as $line) {
    if (preg_match('/^(content-encoding|transfer-encoding|content-length|connection|access-control-allow-origin):/i', $line)) continue;
    if (preg_match('/^HTTP\/\d/i', $line)) continue;
    if (trim($line)) header($line, false);
}

header('Access-Control-Allow-Origin: *');
header('X-Proxy-Cache: MISS');

// Cache successful GET responses
if ($useCache && $httpCode === 200) {
    @file_put_contents($cacheFile, serialize([
        'status' => $httpCode,
        'content_type' => $contentType,
        'body' => $responseBody,
    ]));
}

echo $responseBody;
