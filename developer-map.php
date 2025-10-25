<?php
/**
 * Plugin Name: Developer Map
 * Description: Administrátorský dashboard načítaný výhradne cez shortcode [devmap] na stránke /devtest-9kq7wza3.
 * Version: 0.2.2
 * Author: Mario
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DM_PLUGIN_VERSION', '0.2.3');
define('DM_DEV_PAGE_SLUG', 'devtest-9kq7wza3');
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

    // Get latest modification time from ALL relevant files for proper cache-busting
    $files_to_check = [
        $base_path . 'dm.css',
        $base_path . 'dm.js',
        $base_path . 'core/app.js',
        $base_path . 'core/constants.js',
        $base_path . 'core/data.js',
        $base_path . 'core/layout/header.js',
        $base_path . 'core/views/maps-view.js',
        $base_path . 'styles/base.css',
        $base_path . 'styles/board.css',
        $base_path . 'styles/layout-shell.css',
    ];

    $version = DM_PLUGIN_VERSION; // Start with plugin version
    foreach ($files_to_check as $file) {
        if (file_exists($file)) {
            $version = max($version, filemtime($file));
        }
    }

    wp_register_style(
        DM_PLUGIN_STYLE_HANDLE,
        $base_url . 'dm.css',
        [],
        $version
    );

    wp_register_script(
        DM_PLUGIN_SCRIPT_HANDLE,
        $base_url . 'dm.js',
        [],
        $version,
        true
    );

    wp_script_add_data(DM_PLUGIN_SCRIPT_HANDLE, 'type', 'module');

    $GLOBALS['dm_assets_ver'] = $version;
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
    
    // Add critical inline CSS to ensure hover effects and colors work properly
    // This prevents WordPress theme/plugin conflicts
    $critical_css = '
        /* Force hover effects even if theme overrides */
        #dm-root.dm-root .dm-board__row {
            overflow: visible !important;
        }
        #dm-root.dm-root .dm-board__cell--main {
            overflow: visible !important;
        }
        #dm-root.dm-root .dm-board__thumb {
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease, z-index 0s 0s !important;
            z-index: 1 !important;
        }
        #dm-root.dm-root .dm-board__thumb--clickable {
            cursor: pointer !important;
        }
        #dm-root.dm-root .dm-board__thumb--clickable:hover {
            transform: scale(1.8) !important;
            box-shadow: 0 16px 48px rgba(22, 22, 29, 0.3) !important;
            z-index: 100 !important;
        }
        #dm-root.dm-root .dm-board__thumb--floor.dm-board__thumb--clickable:hover {
            transform: scale(1.8) !important;
            box-shadow: 0 16px 48px rgba(22, 22, 29, 0.3) !important;
        }
        /* Ensure color variables are used */
        #dm-root.dm-root .dm-topbar__title,
        #dm-root.dm-root .dm-main-surface__title h1,
        #dm-root.dm-root .dm-settings__header h1 {
            color: var(--dm-heading-color, #111827) !important;
        }
        #dm-root.dm-root .dm-topbar__by,
        #dm-root.dm-root .dm-main-surface__title p,
        #dm-root.dm-root .dm-board__cell--head,
        #dm-root.dm-root .dm-board__cell--type {
            color: var(--dm-content-text-color, #6b7280) !important;
        }
        #dm-root.dm-root .dm-button--dark,
        #dm-root.dm-root .dm-board__cta {
            background: var(--dm-button-color, #7c3aed) !important;
        }
    ';
    wp_add_inline_style(DM_PLUGIN_STYLE_HANDLE, $critical_css);
    
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
    if (is_page(DM_DEV_PAGE_SLUG)) {
        if (!current_user_can('manage_options')) {
            status_header(404);
            nocache_headers();
            include get_404_template();
            exit;
        }
        
        // Disable ALL caching for this dev page only (doesn't affect rest of site)
        nocache_headers();
        
        // Prevent common cache plugins from caching this page
        if (!defined('DONOTCACHEPAGE')) {
            define('DONOTCACHEPAGE', true);
        }
        if (!defined('DONOTCACHEDB')) {
            define('DONOTCACHEDB', true);
        }
        if (!defined('DONOTMINIFY')) {
            define('DONOTMINIFY', true);
        }
        if (!defined('DONOTCDN')) {
            define('DONOTCDN', true);
        }
        if (!defined('DONOTCACHEOBJECT')) {
            define('DONOTCACHEOBJECT', true);
        }
    }
});

add_action('wp_head', function (): void {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        echo '<meta name="robots" content="noindex,nofollow" />' . "\n";
        // Extra cache-busting headers for dev page only
        echo '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />' . "\n";
        echo '<meta http-equiv="Pragma" content="no-cache" />' . "\n";
        echo '<meta http-equiv="Expires" content="0" />' . "\n";
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

// Exclude dev page from W3 Total Cache
add_filter('w3tc_can_cache', function ($can_cache) {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        return false;
    }
    return $can_cache;
}, 10, 1);

// Exclude dev page from WP Super Cache
add_filter('wp_super_cache_skip_cache', function ($skip) {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        return true;
    }
    return $skip;
}, 10, 1);

// Exclude dev page from WP Fastest Cache
add_action('wp', function () {
    if (is_page(DM_DEV_PAGE_SLUG) && class_exists('WpFastestCache')) {
        global $wp_fastest_cache;
        if (is_object($wp_fastest_cache)) {
            remove_action('wp_footer', [$wp_fastest_cache, 'wpfc_footer_for_html']);
        }
    }
}, 0);

// Exclude dev page from Autoptimize
add_filter('autoptimize_filter_noptimize', function ($noptimize) {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        return true;
    }
    return $noptimize;
}, 10, 1);

// Exclude dev page from WP Rocket (if present)
add_filter('rocket_override_donotcachepage', function ($override) {
    if (is_page(DM_DEV_PAGE_SLUG)) {
        return true;
    }
    return $override;
}, 10, 1);
