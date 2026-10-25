<?php

// Prices are in kobo (NGN minor unit). Override per environment; defaults are placeholders to confirm.
return [
  'room_prices_kobo' => [
    72 => (int) env('PRICE_ROOM_72H_KOBO', 50000),
    168 => (int) env('PRICE_ROOM_168H_KOBO', 100000),
    720 => (int) env('PRICE_ROOM_720H_KOBO', 300000),
  ],
  'paystack_secret' => env('PAYSTACK_SECRET_KEY'),
  'vapid' => [
    'subject' => env('VAPID_SUBJECT', 'mailto:support@gwam.dumostech.com'),
    'public' => env('VAPID_PUBLIC_KEY'),
    'private' => env('VAPID_PRIVATE_KEY'),
  ],
  'app_url' => env('APP_FRONTEND_URL', 'https://app.gwam.dumostech.com'),
];
