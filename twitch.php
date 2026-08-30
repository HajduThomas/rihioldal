<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$clientId = 'IDE_A_TWITCH_CLIENT_ID';
$clientSecret = 'IDE_A_TWITCH_CLIENT_SECRET';

$twitchUsername = 'rihigaming_official';

$youtubeApiKey = 'IDE_A_YOUTUBE_API_KEY';
$youtubeChannelId = 'UCVaVAmKO9hwhKjz2BIMvmDg';

function apiError($message, $details = null)
{
    $response = [
        'success' => false,
        'error' => $message,
        'twitch' => [
            'live' => false,
            'data' => null
        ],
        'youtube' => [
            'live' => false,
            'data' => null
        ]
    ];

    if ($details !== null) {
        $response['details'] = $details;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

function curlGet($url, $headers = [])
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT => 'RihiGamingLiveStatus/1.0'
    ]);

    $response = curl_exec($ch);

    $result = [
        'success' => $response !== false,
        'http_code' => curl_getinfo($ch, CURLINFO_HTTP_CODE),
        'body' => $response
    ];

    curl_close($ch);

    return $result;
}

function getTwitchAccessToken($clientId, $clientSecret)
{
    $tokenUrl = 'https://id.twitch.tv/oauth2/token';

    $postData = http_build_query([
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'grant_type' => 'client_credentials'
    ]);

    $ch = curl_init($tokenUrl);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT => 'RihiGamingLiveStatus/1.0'
    ]);

    $response = curl_exec($ch);

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    if (
        $httpCode >= 400 ||
        empty($data['access_token'])
    ) {
        return null;
    }

    return $data['access_token'];
}

if (
    $clientId === 'IDE_A_TWITCH_CLIENT_ID' ||
    $clientSecret === 'IDE_A_TWITCH_CLIENT_SECRET'
) {
    apiError('A Twitch Client ID vagy Twitch Client Secret nincs kitöltve.');
}

if ($youtubeApiKey === 'IDE_A_YOUTUBE_API_KEY') {
    apiError('A YouTube API Key nincs kitöltve.');
}

/*
|--------------------------------------------------------------------------
| TWITCH LIVE ÁLLAPOT
|--------------------------------------------------------------------------
*/

$twitch = [
    'live' => false,
    'data' => null
];

$accessToken = getTwitchAccessToken(
    $clientId,
    $clientSecret
);

if ($accessToken !== null) {
    $twitchUrl =
        'https://api.twitch.tv/helix/streams?user_login=' .
        urlencode($twitchUsername);

    $twitchResponse = curlGet(
        $twitchUrl,
        [
            'Client-ID: ' . $clientId,
            'Authorization: Bearer ' . $accessToken
        ]
    );

    if (
        $twitchResponse['success'] &&
        $twitchResponse['http_code'] < 400
    ) {
        $twitchJson = json_decode(
            $twitchResponse['body'],
            true
        );

        if (!empty($twitchJson['data'])) {
            $stream = $twitchJson['data'][0];

            $twitch = [
                'live' => true,
                'data' => [
                    'title' => $stream['title'] ?? 'Twitch élő adás',
                    'game' => $stream['game_name'] ?? '',
                    'viewers' => $stream['viewer_count'] ?? 0,
                    'started_at' => $stream['started_at'] ?? '',
                    'url' => 'https://www.twitch.tv/' . $twitchUsername
                ]
            ];
        }
    }
}

/*
|--------------------------------------------------------------------------
| YOUTUBE LIVE ÁLLAPOT
|--------------------------------------------------------------------------
|
| A YouTube Data API search.list hívása csak annak a csatornának
| az aktuális live videóját keresi, amelynek ID-ját megadtad.
|--------------------------------------------------------------------------
*/

$youtube = [
    'live' => false,
    'data' => null
];

$youtubeUrl =
    'https://www.googleapis.com/youtube/v3/search?' .
    http_build_query([
        'part' => 'snippet',
        'channelId' => $youtubeChannelId,
        'eventType' => 'live',
        'type' => 'video',
        'maxResults' => 1,
        'key' => $youtubeApiKey
    ]);

$youtubeResponse = curlGet($youtubeUrl);

if (
    $youtubeResponse['success'] &&
    $youtubeResponse['http_code'] < 400
) {
    $youtubeJson = json_decode(
        $youtubeResponse['body'],
        true
    );

    if (!empty($youtubeJson['items'])) {
        $video = $youtubeJson['items'][0];

        $videoId =
            $video['id']['videoId'] ?? '';

        if ($videoId !== '') {
            $youtube = [
                'live' => true,
                'data' => [
                    'title' =>
                        $video['snippet']['title'] ??
                        'YouTube élő adás',

                    'channel' =>
                        $video['snippet']['channelTitle'] ??
                        'Rihi Gaming',

                    'started_at' =>
                        $video['snippet']['publishedAt'] ??
                        '',

                    'url' =>
                        'https://www.youtube.com/watch?v=' .
                        $videoId,

                    'video_id' => $videoId
                ]
            ];
        }
    }
}

/*
|--------------------------------------------------------------------------
| JSON VÁLASZ A SCRIPT.JS-NEK
|--------------------------------------------------------------------------
*/

echo json_encode(
    [
        'success' => true,
        'live' => $twitch['live'] || $youtube['live'],
        'twitch' => $twitch,
        'youtube' => $youtube
    ],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);