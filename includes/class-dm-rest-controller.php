<?php
/**
 * REST controller for Developer Map storage.
 *
 * @package DeveloperMap
 */

if (!defined('ABSPATH')) {
    exit;
}

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

final class DM_Rest_Controller
{
    public const NAMESPACE = 'developer-map/v1';
    private const RATE_LIMIT_WINDOW = 60; // seconds
    private const RATE_LIMIT_LIMIT = 60; // requests per window
    private const TRANSIENT_PREFIX = 'dm_rate_';
    private const MAX_IMAGE_BYTES = 5242880; // 5 MB

    /**
     * Register REST API routes.
     */
    public static function register_routes(): void
    {
        register_rest_route(
            self::NAMESPACE,
            '/list',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'handle_list'],
                'permission_callback' => [self::class, 'permission_read'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/get',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'handle_get'],
                'permission_callback' => [self::class, 'permission_read'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/set',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [self::class, 'handle_set'],
                'permission_callback' => [self::class, 'permission_mutate'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/remove',
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [self::class, 'handle_remove'],
                'permission_callback' => [self::class, 'permission_mutate'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/migrate',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [self::class, 'handle_migrate'],
                'permission_callback' => [self::class, 'permission_migrate'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/image',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [self::class, 'handle_image'],
                'permission_callback' => [self::class, 'permission_image'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/ping',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'handle_ping'],
                'permission_callback' => [self::class, 'permission_read'],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/project',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [self::class, 'handle_project'],
                'permission_callback' => '__return_true',
                'args'                => [
                    'public_key' => [
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ]
        );
    }

    /**
     * Verify nonce and read capability.
     */
    public static function permission_read(WP_REST_Request $request)
    {
        $nonce_check = self::verify_request_nonce($request);
        if (is_wp_error($nonce_check)) {
            return $nonce_check;
        }

        if (!current_user_can('read')) {
            return new WP_Error(
                'dm_forbidden',
                esc_html__('You are not allowed to access these resources.', 'developer-map'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Verify nonce, capability for mutation and presence of key.
     */
    public static function permission_mutate(WP_REST_Request $request)
    {
        $nonce_check = self::verify_request_nonce($request);
        if (is_wp_error($nonce_check)) {
            return $nonce_check;
        }

        $key = self::extract_key($request, false);
        if (is_wp_error($key)) {
            return $key;
        }

        $config = DM_Storage_Manager::get_key_config($key);
        if (!$config) {
            return new WP_Error(
                'dm_invalid_key',
                esc_html__('Unsupported storage key provided.', 'developer-map'),
                ['status' => 400]
            );
        }

        if ('option' === $config['scope'] && !current_user_can('manage_options')) {
            return new WP_Error(
                'dm_forbidden_option',
                esc_html__('You are not allowed to modify global data.', 'developer-map'),
                ['status' => 403]
            );
        }

        if ('user' === $config['scope'] && !current_user_can('read')) {
            return new WP_Error(
                'dm_forbidden_user',
                esc_html__('You are not allowed to modify user data.', 'developer-map'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Permission callback for image uploads.
     */
    public static function permission_image(WP_REST_Request $request)
    {
        $permission = self::permission_mutate($request);
        if (is_wp_error($permission)) {
            return $permission;
        }

        if (!current_user_can('upload_files')) {
            return new WP_Error(
                'dm_insufficient_upload_capability',
                esc_html__('You are not allowed to upload files.', 'developer-map'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Permission callback for migration route.
     */
    public static function permission_migrate(WP_REST_Request $request)
    {
        $nonce_check = self::verify_request_nonce($request);
        if (is_wp_error($nonce_check)) {
            return $nonce_check;
        }

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'dm_forbidden_migrate',
                esc_html__('You are not allowed to migrate Developer Map data.', 'developer-map'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Handle ping route.
     */
    public static function handle_ping(WP_REST_Request $request): WP_REST_Response
    {
        return new WP_REST_Response(
            [
                'ok' => true,
                'ts' => time(),
            ]
        );
    }

    public static function handle_project(WP_REST_Request $request)
    {
        $public_key = sanitize_text_field($request->get_param('public_key'));

        if ('' === $public_key) {
            return new WP_Error(
                'dm_missing_public_key',
                esc_html__('Missing project identifier.', 'developer-map'),
                ['status' => 400]
            );
        }

        $projects = DM_Storage_Manager::get('dm-projects');
        $projects = is_array($projects) ? $projects : [];

        foreach ($projects as $project) {
            if (!is_array($project)) {
                continue;
            }
            $candidate = isset($project['publicKey']) ? (string) $project['publicKey'] : '';
            if ($candidate && strcasecmp($candidate, $public_key) === 0) {
                return new WP_REST_Response([
                    'project' => $project,
                ]);
            }
        }

        return new WP_Error(
            'dm_project_not_found',
            esc_html__('Requested map was not found.', 'developer-map'),
            ['status' => 404]
        );
    }

    /**
     * Handle list route.
     */
    public static function handle_list(WP_REST_Request $request): WP_REST_Response
    {
        $user_id = get_current_user_id();
        $include_global = current_user_can('manage_options');

        $data = DM_Storage_Manager::list_accessible($user_id, $include_global);

        return new WP_REST_Response(
            [
                'data'   => $data,
                'scopes' => [
                    'user'   => (bool) $user_id,
                    'global' => $include_global,
                ],
            ]
        );
    }

    /**
     * Handle get route.
     */
    public static function handle_get(WP_REST_Request $request)
    {
        $key = self::extract_key($request);
        if (is_wp_error($key)) {
            return $key;
        }

        $scope = DM_Storage_Manager::get_scope($key);
        if ('option' === $scope && !current_user_can('manage_options')) {
            return new WP_Error(
                'dm_forbidden_option',
                esc_html__('You are not allowed to access this data.', 'developer-map'),
                ['status' => 403]
            );
        }

        $value = DM_Storage_Manager::get($key, get_current_user_id());

        return new WP_REST_Response(
            [
                'key'   => $key,
                'value' => $value,
            ]
        );
    }

    /**
     * Handle set route.
     */
    public static function handle_set(WP_REST_Request $request)
    {
        $key = self::extract_key($request);
        if (is_wp_error($key)) {
            return $key;
        }

        $scope = DM_Storage_Manager::get_scope($key);
        $user_id = get_current_user_id();

        $rate_limit = self::enforce_rate_limit($user_id, sprintf('set_%s', $scope));
        if (is_wp_error($rate_limit)) {
            return $rate_limit;
        }

        $payload = $request->get_json_params();
        $value = $payload['value'] ?? null;

        $stored = DM_Storage_Manager::set($key, $value, $user_id);

        return new WP_REST_Response(
            [
                'key'    => $key,
                'stored' => $stored,
            ]
        );
    }

    /**
     * Handle remove route.
     */
    public static function handle_remove(WP_REST_Request $request)
    {
        $key = self::extract_key($request);
        if (is_wp_error($key)) {
            return $key;
        }

        $scope = DM_Storage_Manager::get_scope($key);
        $user_id = get_current_user_id();

        $rate_limit = self::enforce_rate_limit($user_id, sprintf('remove_%s', $scope));
        if (is_wp_error($rate_limit)) {
            return $rate_limit;
        }

        $deleted = DM_Storage_Manager::remove($key, $user_id);

        return new WP_REST_Response(
            [
                'key'     => $key,
                'deleted' => (bool) $deleted,
            ]
        );
    }

    /**
     * Handle migrate route.
     */
    public static function handle_migrate(WP_REST_Request $request)
    {
        $payload = $request->get_json_params();
        $entries = $payload['payload'] ?? [];

        if (!is_array($entries)) {
            return new WP_Error(
                'dm_invalid_payload',
                esc_html__('Migration payload must be an object.', 'developer-map'),
                ['status' => 400]
            );
        }

        $user_id = get_current_user_id();
        $result = [
            'migrated' => [],
            'skipped'  => [],
        ];

        foreach ($entries as $raw_key => $value) {
            $key = DM_Storage_Manager::normalize_key($raw_key);
            $config = DM_Storage_Manager::get_key_config($key);
            if (!$config) {
                $result['skipped'][$key] = 'unsupported';
                continue;
            }

            $existing = DM_Storage_Manager::get($key, $user_id);
            if (null !== $existing) {
                $result['skipped'][$key] = 'exists';
                continue;
            }

            try {
                DM_Storage_Manager::set($key, $value, $user_id);
                $result['migrated'][$key] = true;
            } catch (Throwable $exception) {
                $result['skipped'][$key] = $exception->getMessage();
            }
        }

        return new WP_REST_Response($result);
    }

    /**
     * Handle image route.
     */
    public static function handle_image(WP_REST_Request $request)
    {
        $payload = $request->get_json_params();
        $key = self::extract_key($request);
        if (is_wp_error($key)) {
            return $key;
        }

        $attachment_id = isset($payload['attachment_id']) ? absint($payload['attachment_id']) : 0;
        if ($attachment_id < 1) {
            return new WP_Error(
                'dm_invalid_attachment',
                esc_html__('Missing attachment identifier.', 'developer-map'),
                ['status' => 400]
            );
        }

        $post = get_post($attachment_id);
        if (!$post || 'attachment' !== $post->post_type) {
            return new WP_Error(
                'dm_missing_attachment',
                esc_html__('Attachment not found.', 'developer-map'),
                ['status' => 404]
            );
        }

        if (!wp_attachment_is_image($attachment_id)) {
            return new WP_Error(
                'dm_invalid_mime',
                esc_html__('Only image attachments are allowed.', 'developer-map'),
                ['status' => 400]
            );
        }

        $file_path = get_attached_file($attachment_id);
        if ($file_path && file_exists($file_path)) {
            $size = filesize($file_path);
            $limit = (int) apply_filters('dm_image_size_limit', self::MAX_IMAGE_BYTES);
            if ($size > $limit) {
                return new WP_Error(
                    'dm_image_too_large',
                    sprintf(
                        /* translators: %s: human readable size */
                        esc_html__('The selected image is too large. Maximum allowed size is %s.', 'developer-map'),
                        size_format($limit)
                    ),
                    ['status' => 400]
                );
            }
        }

        $entity_id = isset($payload['entity_id']) ? sanitize_text_field($payload['entity_id']) : '';
        if ($entity_id === '') {
            return new WP_Error(
                'dm_missing_entity',
                esc_html__('Missing entity identifier for image assignment.', 'developer-map'),
                ['status' => 400]
            );
        }

        $scope = DM_Storage_Manager::get_scope($key);
        $user_id = get_current_user_id();
        $rate_limit = self::enforce_rate_limit($user_id, 'image');
        if (is_wp_error($rate_limit)) {
            return $rate_limit;
        }

        $url = wp_get_attachment_url($attachment_id);
        $alt = (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true);

        $image_payload = [
            'id'         => $attachment_id,
            'url'        => $url ? esc_url_raw($url) : '',
            'alt'        => sanitize_text_field($alt),
            'updated_at' => current_time('mysql', true),
            'entity_id'  => $entity_id,
            'key'        => $key,
        ];

        $stored_images = DM_Storage_Manager::get('dm-images') ?? [];
        if (!is_array($stored_images)) {
            $stored_images = [];
        }
        $stored_images[$entity_id] = $image_payload;
        DM_Storage_Manager::set('dm-images', $stored_images);

        return new WP_REST_Response(
            [
                'image' => $image_payload,
                'key'   => $key,
                'scope' => $scope,
            ]
        );
    }

    /**
     * Extract and normalise key from request.
     *
     * @return string|WP_Error
     */
    private static function extract_key(WP_REST_Request $request, bool $required = true)
    {
        $key = $request->get_param('key');
        if ($key === null && $required) {
            $body = $request->get_json_params();
            $key = $body['key'] ?? null;
        }

        if ($key === null) {
            if ($required) {
                return new WP_Error(
                    'dm_missing_key',
                    esc_html__('Missing storage key.', 'developer-map'),
                    ['status' => 400]
                );
            }

            return '';
        }

        return DM_Storage_Manager::normalize_key($key);
    }

    /**
     * Verify REST nonce.
     */
    private static function verify_request_nonce(WP_REST_Request $request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error(
                'dm_invalid_nonce',
                esc_html__('Invalid or missing security token.', 'developer-map'),
                ['status' => 403]
            );
        }

        return true;
    }

    /**
     * Enforce simple rate limiting using transients.
     */
    private static function enforce_rate_limit(int $user_id, string $action)
    {
        $user_id = $user_id > 0 ? $user_id : 0;
        $fingerprint = sprintf('%d|%s', $user_id, $action);
        $transient_key = self::TRANSIENT_PREFIX . md5($fingerprint);
        $record = get_transient($transient_key);
        $timestamp = time();

        if (!is_array($record) || !isset($record['count'], $record['reset'])) {
            $record = [
                'count' => 0,
                'reset' => $timestamp + self::RATE_LIMIT_WINDOW,
            ];
        }

        if ($record['reset'] <= $timestamp) {
            $record = [
                'count' => 0,
                'reset' => $timestamp + self::RATE_LIMIT_WINDOW,
            ];
        }

        if ($record['count'] >= self::RATE_LIMIT_LIMIT) {
            $seconds = max(1, $record['reset'] - $timestamp);
            return new WP_Error(
                'dm_rate_limited',
                sprintf(
                    /* translators: %d: seconds */
                    esc_html__('Too many requests. Try again in %d seconds.', 'developer-map'),
                    $seconds
                ),
                ['status' => 429]
            );
        }

        $record['count']++;
        set_transient($transient_key, $record, self::RATE_LIMIT_WINDOW);

        return true;
    }
}
