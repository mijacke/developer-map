import { APP_VIEWS } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function renderHeader(state) {
    const settingsActive = state.view === APP_VIEWS.SETTINGS ? ' is-active' : '';
    return `
        <header class="dm-topbar">
            <button type="button" class="dm-topbar__brand" data-dm-nav="maps">
                <span class="dm-topbar__title">Developer Map</span>
                <span class="dm-topbar__by">by FuuDobre</span>
            </button>
            <div class="dm-topbar__search">
                <input type="search" placeholder="Vyhľadať mapu..." aria-label="Vyhľadať mapu" data-dm-role="search" value="${escapeHtml(state.searchTerm)}" />
            </div>
            <nav class="dm-topbar__nav">
                <button type="button" class="dm-topbar__link${settingsActive}" data-dm-nav="settings">Nastavenia</button>
                <button type="button" class="dm-topbar__link" disabled>Dokumentácia</button>
            </nav>
        </header>
    `;
}
