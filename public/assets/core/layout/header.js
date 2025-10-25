import { APP_VIEWS } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

console.log('🎨 Header.js loaded with icons - v0.2.3');

const NAV_ICONS = {
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>',
    docs: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',
};

console.log('🔍 NAV_ICONS defined:', Object.keys(NAV_ICONS));

export function renderHeader(state) {
    const settingsActive = state.view === APP_VIEWS.SETTINGS ? ' is-active' : '';
    const html = `
        <header class="dm-topbar">
            <button type="button" class="dm-topbar__brand" data-dm-nav="maps">
                <span class="dm-topbar__title">Developer Map</span>
                <span class="dm-topbar__by">by FuuDobre</span>
            </button>
            <div class="dm-topbar__search">
                <span class="dm-topbar__search-icon" aria-hidden="true">${NAV_ICONS.search}</span>
                <input type="search" placeholder="Vyhľadať mapu..." aria-label="Vyhľadať mapu" data-dm-role="search" value="${escapeHtml(state.searchTerm)}" />
            </div>
            <nav class="dm-topbar__nav">
                <button type="button" class="dm-topbar__link${settingsActive}" data-dm-nav="settings">
                    <span class="dm-topbar__link-icon" aria-hidden="true">${NAV_ICONS.settings}</span>
                    <span>Nastavenia</span>
                </button>
                <button type="button" class="dm-topbar__link" disabled>
                    <span class="dm-topbar__link-icon" aria-hidden="true">${NAV_ICONS.docs}</span>
                    <span>Dokumentácia</span>
                </button>
            </nav>
        </header>
    `;
    console.log('📄 Header HTML contains search icon:', html.includes('dm-topbar__search-icon'));
    return html;
}
