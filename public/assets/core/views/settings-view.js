import { SETTINGS_SECTIONS } from '../constants.js';

export function renderSettingsView(state, data) {
    return `
        <section class="dm-settings">
            <header class="dm-settings__header">
                <h1>Nastavenia</h1>
                <nav class="dm-settings__tabs">
                    ${renderSettingsTab('Prehľad', SETTINGS_SECTIONS.OVERVIEW, state.settingsSection)}
                    ${renderSettingsTab('Typy', SETTINGS_SECTIONS.TYPES, state.settingsSection)}
                    ${renderSettingsTab('Stavy', SETTINGS_SECTIONS.STATUSES, state.settingsSection)}
                    ${renderSettingsTab('Farby', SETTINGS_SECTIONS.COLORS, state.settingsSection)}
                    ${renderSettingsTab('Fonty', SETTINGS_SECTIONS.FONTS, state.settingsSection)}
                </nav>
            </header>
            <div class="dm-settings__surface">
                ${state.settingsSection === SETTINGS_SECTIONS.OVERVIEW ? renderSettingsOverview() : ''}
                ${state.settingsSection === SETTINGS_SECTIONS.TYPES ? renderSettingsTypes(data) : ''}
                ${state.settingsSection === SETTINGS_SECTIONS.STATUSES ? renderSettingsStatuses(data) : ''}
                ${state.settingsSection === SETTINGS_SECTIONS.COLORS ? renderSettingsColors(data) : ''}
                ${state.settingsSection === SETTINGS_SECTIONS.FONTS ? renderSettingsFonts(data) : ''}
            </div>
        </section>
    `;
}

function renderSettingsTab(label, section, active) {
    const isActive = section === active;
    return `
        <button type="button" class="dm-settings__tab ${isActive ? 'is-active' : ''}" data-dm-settings="${section}">
            ${label}
        </button>
    `;
}

function renderSettingsOverview() {
    const rows = [
        { label: 'Typ', actions: ['Otvoriť', 'Upraviť'], target: SETTINGS_SECTIONS.TYPES },
        { label: 'Stav', actions: ['Otvoriť', 'Upraviť'], target: SETTINGS_SECTIONS.STATUSES },
        { label: 'Základné farby mapy', actions: ['Otvoriť', 'Upraviť'], target: SETTINGS_SECTIONS.COLORS },
    ];
    return `
        <div class="dm-card dm-card--settings">
            <h2>Nastavenia</h2>
            <div class="dm-settings__list">
                ${rows
                    .map(
                        (row) => `
                            <div class="dm-settings__item">
                                <span>${row.label}</span>
                                <div class="dm-settings__item-actions">
                                    ${row.actions
                                        .map(
                                            (action) => `
                                                <button class="dm-chip" data-dm-settings="${row.target}">
                                                    ${action}
                                                </button>
                                            `,
                                        )
                                        .join('')}
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
        </div>
    `;
}

function renderSettingsTypes(data) {
    return `
        <div class="dm-card dm-card--settings">
            <h2>Typy</h2>
            <div class="dm-settings__list">
                ${data.types
                    .map(
                        (item) => `
                            <div class="dm-settings__item">
                                <div class="dm-pill">
                                    <span class="dm-pill__dot" style="background:${item.color}"></span>
                                    ${item.label}
                                </div>
                                <div class="dm-settings__item-actions">
                                    <button class="dm-chip" data-dm-modal="delete-type">Zmazať</button>
                                    <button class="dm-chip" data-dm-modal="edit-type">Upraviť</button>
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
            <div class="dm-card__footer dm-card__footer--right">
                <button class="dm-button dm-button--dark" data-dm-modal="add-type">Pridať typ</button>
            </div>
        </div>
    `;
}

function renderSettingsStatuses(data) {
    return `
        <div class="dm-card dm-card--settings">
            <h2>Stavy</h2>
            <div class="dm-settings__list">
                ${data.statuses
                    .map(
                        (item) => `
                            <div class="dm-settings__item">
                                <div class="dm-pill">
                                    <span class="dm-pill__dot" style="background:${item.color}"></span>
                                    ${item.label}
                                </div>
                                <div class="dm-settings__item-actions">
                                    <button class="dm-chip" data-dm-modal="delete-status">Zmazať</button>
                                    <button class="dm-chip" data-dm-modal="edit-status">Upraviť</button>
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
            <div class="dm-card__footer dm-card__footer--right">
                <button class="dm-button dm-button--dark" data-dm-modal="add-status">Pridať stav</button>
            </div>
        </div>
    `;
}

function renderSettingsColors(data) {
    return `
        <div class="dm-card dm-card--settings">
            <h2>Základné farby mapy</h2>
            <div class="dm-settings__list">
                ${data.colors
                    .map(
                        (item) => `
                            <div class="dm-settings__item">
                                <div class="dm-pill">
                                    <span class="dm-pill__dot" style="background:${item.value}"></span>
                                    ${item.label}
                                </div>
                                <div class="dm-settings__item-actions">
                                    <button class="dm-chip" data-dm-modal="edit-color">Upraviť</button>
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
        </div>
    `;
}

function renderSettingsFonts(data) {
    return `
        <div class="dm-card dm-card--settings">
            <h2>Font písma</h2>
            <div class="dm-settings__list">
                ${data.fonts
                    .map(
                        (item) => `
                            <div class="dm-settings__item">
                                <span>${item.label}</span>
                                <div class="dm-settings__item-actions">
                                    <button class="dm-chip" data-dm-modal="edit-font">Upraviť</button>
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
        </div>
    `;
}

function renderFormPlaceholder(title) {
    return `
        <div class="dm-form">
            <h3>${title}</h3>
            <div class="dm-form__grid">
                <label class="dm-field">
                    <span>Nadradené</span>
                    <select>
                        <option>Bytovka</option>
                    </select>
                </label>
                <label class="dm-field">
                    <span>Typ *</span>
                    <select><option>Pozemok</option></select>
                </label>
                <label class="dm-field">
                    <span>Názov *</span>
                    <input type="text" value="1" />
                    <small>max 100 znakov</small>
                </label>
                <label class="dm-field">
                    <span>Označenie *</span>
                    <input type="text" value="l1" />
                    <small>max 5 znakov</small>
                </label>
                <label class="dm-field">
                    <span>URL *</span>
                    <input type="url" placeholder="https://" />
                    <small>max 100 znakov</small>
                </label>
            </div>
        </div>
    `;
}
