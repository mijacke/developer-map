import { createStorageClient } from './core/storage-client.js';
import { migrateLocalStorage } from './core/storage-migration.js';

/**
 * Developer Map — ES module entry (len pre [devmap] na dev stránke).
 * Dynamicky načíta core/app.js s cache-busting verziou a má bezpečný fallback.
 * Updated: 2025-10-24 04:45 - Added clickable thumbnails and keyboard support
 */

const ROOT_SELECTOR = '#dm-root[data-dm-app="developer-map"]';
const ASSET_VERSION = '5.0.15';
const runtimeConfig = (typeof window !== 'undefined') ? window.dmRuntimeConfig : null;
let booted = false;

function fallback(root, msg) {
  root.innerHTML = `
    <div class="dm-shell">
      <header class="dm-shell__header">
        <div>
          <h1 class="dm-shell__title">Developer Map — Dashboard</h1>
          <p class="dm-shell__subtitle">${msg || 'Fallback UI'}</p>
        </div>
      </header>
      <main class="dm-shell__main">
        <section class="dm-map"><div class="dm-map__surface">
          <div class="dm-canvas"><div class="dm-map-placeholder__inner">🗺️</div></div>
        </div></section>
      </main>
    </div>`;
}

async function boot() {
  if (booted) return; booted = true;

  const root = document.querySelector(ROOT_SELECTOR);
  if (!(root instanceof HTMLElement)) { 
    console.warn('[DM] root not found'); 
    return; 
  }

  if (!runtimeConfig) { 
    console.warn('[DM] missing runtime config'); 
    fallback(root, 'Chýba runtime config'); 
    return; 
  }

  try {
    let storageClient = null;
    try {
      storageClient = createStorageClient(runtimeConfig);
    } catch (storageError) {
      console.warn('[DM] storage client init failed', storageError);
    }

    if (storageClient) {
      try {
        const migrationResult = await migrateLocalStorage(storageClient);
        if (migrationResult?.queued) {
          console.info('[DM] storage migration queued for retry');
        }
      } catch (migrationError) {
        console.warn('[DM] storage migration failed', migrationError);
      }
    }

    const base = new URL('./', import.meta.url);
    const ver  = runtimeConfig.ver || ASSET_VERSION;
    
    // Use import map workaround: append version to all module URLs
    const appUrl = new URL(`./core/app.js?ver=${ver}`, base).href;
    
    const mod  = await import(/* @vite-ignore */ appUrl);

    const init = mod.initDeveloperMap || mod.default;
    if (typeof init !== 'function') throw new Error('initDeveloperMap missing');

    await init({ root, runtimeConfig, storageClient });
  } catch (err) {
    console.error('[DM] app import/init failed:', err);
    fallback(root, 'app.js sa nenačítal – pozri konzolu');
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  queueMicrotask(boot);
} else {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
}
