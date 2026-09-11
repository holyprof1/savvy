<?php
/**
 * Savvy Media Africa — brief submission handler
 *
 * Delivers the contact form to the Zoho inbox.
 *
 * Deliverability note: savvymediaafrica.com publishes
 * "v=spf1 include:zohomail.com ~all", so this server is NOT authorised to
 * send as @savvymediaafrica.com — doing so would fail SPF and land in spam.
 * holyprofweb.com's SPF does include this server's IP, so the envelope
 * sender is a holyprofweb.com address and the visitor goes in Reply-To.
 */

declare(strict_types=1);

const MAIL_TO        = 'hello@savvymediaafrica.com';
const MAIL_FROM      = 'noreply@holyprofweb.com';
const SITE_NAME      = 'Savvy Media Africa';
const RATE_LIMIT_SEC = 45;   // minimum seconds between sends from one IP
const MAX_PER_HOUR   = 6;    // per IP

header('Content-Type: application/json; charset=utf-8');

function fail(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function succeed(): never {
    echo json_encode(['ok' => true]);
    exit;
}

/* ------------------------------------------------------------------
   Method
------------------------------------------------------------------ */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Method not allowed.');
}

/* ------------------------------------------------------------------
   Spam gates
------------------------------------------------------------------ */

/* 1. Honeypot — a field hidden from humans. Bots fill it in.
      Return success so the bot believes it worked and moves on. */
if (trim((string)($_POST['company_website'] ?? '')) !== '') {
    succeed();
}

/* 2. Time trap — the form stamps its render time. A submission faster
      than 3 seconds is automated. */
$rendered = (int)($_POST['form_time'] ?? 0);
if ($rendered > 0 && (time() - $rendered) < 3) {
    succeed();
}

/* 3. Per-IP rate limiting, stored in the system temp directory. */
$ip      = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$bucket  = sys_get_temp_dir() . '/savvy_brief_' . hash('sha256', $ip) . '.json';
$now     = time();
$history = [];

if (is_readable($bucket)) {
    $decoded = json_decode((string)file_get_contents($bucket), true);
    if (is_array($decoded)) {
        $history = array_filter($decoded, static fn($t) => is_int($t) && ($now - $t) < 3600);
    }
}

if ($history !== []) {
    if (($now - max($history)) < RATE_LIMIT_SEC) {
        fail(429, 'Please wait a moment before sending another message.');
    }
    if (count($history) >= MAX_PER_HOUR) {
        fail(429, 'Too many messages from this connection. Please try again later.');
    }
}

/* ------------------------------------------------------------------
   Validate
------------------------------------------------------------------ */
$name    = trim((string)($_POST['name']    ?? ''));
$email   = trim((string)($_POST['email']   ?? ''));
$phone   = trim((string)($_POST['phone']   ?? ''));
$service = trim((string)($_POST['service'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    fail(422, 'Please fill in your name, email and message.');
}
if (mb_strlen($name) > 120 || mb_strlen($email) > 190 || mb_strlen($message) > 6000) {
    fail(422, 'One of the fields is too long.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'That email address does not look right.');
}

/* Header-injection guard: no newlines may reach a mail header. */
foreach ([$name, $email, $phone, $service] as $headerValue) {
    if (preg_match('/[\r\n]/', $headerValue)) {
        fail(422, 'Invalid characters in submission.');
    }
}

/* Crude link-spam check on the body. */
if (preg_match_all('#https?://#i', $message) > 6) {
    fail(422, 'Too many links in the message.');
}

/* ------------------------------------------------------------------
   Compose
------------------------------------------------------------------ */
$safeName = preg_replace('/["\\\\]/', '', $name);
$subject  = sprintf('New brief from %s', $safeName);

$body = "A new brief was submitted on " . SITE_NAME . ".\n\n"
      . "Name:    {$name}\n"
      . "Email:   {$email}\n"
      . "Phone:   " . ($phone   !== '' ? $phone   : '—') . "\n"
      . "Service: " . ($service !== '' ? $service : '—') . "\n\n"
      . "Message\n"
      . str_repeat('-', 52) . "\n"
      . $message . "\n"
      . str_repeat('-', 52) . "\n\n"
      . "Submitted: " . gmdate('D, d M Y H:i:s') . " UTC\n"
      . "IP:        {$ip}\n";

/*
 * mail() is disabled on this server (see disable_functions), so the message
 * is piped straight into Exim via the sendmail binary. Exim honours the
 * domain's MX, which points at Zoho — no SMTP credentials needed.
 */
$headers = [
    'To'                        => MAIL_TO,
    'Subject'                   => '=?UTF-8?B?' . base64_encode($subject) . '?=',
    'From'                      => sprintf('%s Website <%s>', SITE_NAME, MAIL_FROM),
    'Reply-To'                  => sprintf('%s <%s>', $safeName, $email),
    'Date'                      => date(DATE_RFC2822),
    'MIME-Version'              => '1.0',
    'Content-Type'              => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
    'X-Mailer'                  => 'savvymediaafrica.com',
    'Auto-Submitted'            => 'auto-generated',
];

$headerLines = [];
foreach ($headers as $key => $value) {
    $headerLines[] = $key . ': ' . $value;
}

$mime = implode("\n", $headerLines) . "\n\n" . $body;

$sendmail = '/usr/sbin/sendmail -t -i -f' . escapeshellarg(MAIL_FROM);
$pipe     = @popen($sendmail, 'w');

if ($pipe === false) {
    error_log('[savvy-brief] could not open sendmail pipe');
    fail(500, 'We could not send your message. Please email hello@savvymediaafrica.com directly.');
}

fwrite($pipe, $mime);
$status = pclose($pipe);

if ($status !== 0) {
    error_log('[savvy-brief] sendmail exited with status ' . $status . ' for ' . $email);
    fail(500, 'We could not send your message. Please email hello@savvymediaafrica.com directly.');
}

/* Record the successful send for rate limiting. */
$history[] = $now;
@file_put_contents($bucket, json_encode(array_values($history)), LOCK_EX);

succeed();
