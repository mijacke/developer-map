<?php
/**
 * Plugin Name: Developer Map
 * Description: Administrátorský dashboard načítaný výhradne cez shortcode [devmap] na stránke /devtest-9kq7wza3.
 * Version: 0.1.0
 * Author: Mario
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DM_DEV_PAGE_SLUG', 'devtest-9kq7wza3');
define('DM_PLUGIN_VERSION', '0.1.0');
define('DM_PLUGIN_STYLE_HANDLE', 'developer-map-style');
define('DM_PLUGIN_SCRIPT_HANDLE', 'developer-map-script');

/**
 * Ensure styles and scripts are registered once per request.
 */
function dm_register_assets(): void
{
    static $registered = false;

    if ($registered) {
        return;
    }

    $base_url = plugin_dir_url(__FILE__) . 'public/assets/';
    $base_path = plugin_dir_path(__FILE__) . 'public/assets/';

    $css_ver = file_exists($base_path.'dm.css') ? filemtime($base_path.'dm.css') : time();
    $js_ver  = file_exists($base_path.'dm.js')  ? filemtime($base_path.'dm.js')  : time();

    wp_register_style(
        DM_PLUGIN_STYLE_HANDLE,
        $base_url . 'dm.css',
        [],
        DM_PLUGIN_VERSION
    );

    wp_register_script(
        DM_PLUGIN_SCRIPT_HANDLE,
        $base_url . 'dm.js',
        [],
        DM_PLUGIN_VERSION,
        true
    );

    wp_script_add_data(DM_PLUGIN_SCRIPT_HANDLE, 'type', 'module');

    $GLOBALS['dm_assets_ver'] = max($css_ver, $js_ver);
    $GLOBALS['dm_assets_base'] = $base_url;

    $registered = true;
}

add_action('init', function (): void {
    add_shortcode('devmap', 'dm_render_dashboard_shortcode');
});

/**
 * Render shortcode output and enqueue assets in isolation.
 */
function dm_render_dashboard_shortcode(): string
{
    if (!is_page(DM_DEV_PAGE_SLUG) || !current_user_can('manage_options')) {
        return '';
    }

    dm_register_assets();

    wp_enqueue_style(DM_PLUGIN_STYLE_HANDLE);
    $config = [
        'slug'      => DM_DEV_PAGE_SLUG,
        'restBase'  => esc_url_raw(rest_url('dm/v1/')),
        'restNonce' => wp_create_nonce('wp_rest'),
        'ver'       => isset($GLOBALS['dm_assets_ver']) ? $GLOBALS['dm_assets_ver'] : time(),
    ];

    wp_add_inline_script(
        DM_PLUGIN_SCRIPT_HANDLE,
        'window.dmRuntimeConfig = ' . wp_json_encode($config) . ';',
        'before'
    );
    wp_enqueue_script(DM_PLUGIN_SCRIPT_HANDLE);

    add_filter('script_loader_tag', function ($tag, $handle) {
        if ($handle === DM_PLUGIN_SCRIPT_HANDLE) {
            // zabezpečí type="module" aj keď to iný plugin/tema prepisuje
            if (strpos($tag, 'type=') === false) {
                $tag = str_replace(' src=', ' type="module" src=', $tag);
            } else {
                $tag = preg_replace('/type=("|\').*?\1/', 'type="module"', $tag, 1);
            }
        }
        return $tag;
    }, 10, 2);

    return '<div id="dm-root" data-dm-app="developer-map"></div>';
}

add_action('template_redirect', function (): void {
    if (is_page(DM_DEV_PAGE_SLUG) && !current_user_can('manage_options')) {
        status_header(404);
        nocache_headers();
        include get_404_template();
        exit;
    }
});

add_action('wp_head', function (): void {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        echo '<meta name="robots" content="noindex,nofollow" />' . "\n";
    }
});

add_action('pre_get_posts', function ($query): void {
    if ($query->is_main_query() && $query->is_search()) {
        $target_page = get_page_by_path(DM_DEV_PAGE_SLUG);

        if ($target_page instanceof WP_Post) {
            $excluded = (array) $query->get('post__not_in');
            $excluded[] = $target_page->ID;
            $query->set('post__not_in', array_unique($excluded));
        }
    }
});

add_action('rest_api_init', function (): void {
    register_rest_route('dm/v1', '/ping', [
        'methods'             => 'GET',
        'callback'            => fn () => ['ok' => true, 'ts' => time()],
        'permission_callback' => '__return_true',
    ]);
});
