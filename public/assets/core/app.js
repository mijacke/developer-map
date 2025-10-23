const APP_VIEWS = {
    MAPS: 'maps',
    DASHBOARD: 'dashboard',
    SETTINGS: 'settings',
};

const MAP_SECTIONS = {
    LIST: 'list',
    FLOORS: 'floors',
    BLUEPRINTS: 'blueprints',
};

const SETTINGS_SECTIONS = {
    OVERVIEW: 'overview',
    TYPES: 'types',
    STATUSES: 'statuses',
    COLORS: 'colors',
    FONTS: 'fonts',
};

/**
 * Initialise the Developer Map dashboard inside the provided root element.
 * @param {{ root: HTMLElement; runtimeConfig: Record<string, unknown>; projectConfig?: object }} options
 */
export function initDeveloperMap(options) {
    const { root, runtimeConfig } = options;

    if (!root || !(root instanceof HTMLElement)) {
        throw new Error('Developer Map: initDeveloperMap requires a valid root element.');
    }

    if (root.dataset.dmHydrated === '1') {
        return root.__dmInstance;
    }

    const data = createDemoData();

    const state = {
        view: APP_VIEWS.MAPS,
        mapSection: MAP_SECTIONS.LIST,
        settingsSection: SETTINGS_SECTIONS.OVERVIEW,
        activeProjectId: data.projects[0]?.id ?? null,
        searchTerm: '',
        modal: null,
        runtimeConfig,
    };

    root.dataset.dmHydrated = '1';
    root.classList.add('dm-root');

    function setState(patch) {
        const next = typeof patch === 'function' ? patch(state) : patch;
        Object.assign(state, next);
        render();
    }

    function render() {
        root.innerHTML = [renderAppShell(state, data), renderModal(state, data)].join('');
        attachEventHandlers();
    }

    function attachEventHandlers() {
        const headerButtons = root.querySelectorAll('[data-dm-nav]');
        headerButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const targetView = target.getAttribute('data-dm-nav');
                if (targetView === 'settings') {
                    setState({ view: APP_VIEWS.SETTINGS, settingsSection: SETTINGS_SECTIONS.OVERVIEW });
                } else if (targetView === 'maps') {
                    setState({ view: APP_VIEWS.MAPS, mapSection: MAP_SECTIONS.LIST });
                }
            });
        });

        const subnavButtons = root.querySelectorAll('[data-dm-section]');
        subnavButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const section = target.getAttribute('data-dm-section');
                if (!section) return;
                setState({ mapSection: section });
            });
        });

        const settingsNavButtons = root.querySelectorAll('[data-dm-settings]');
        settingsNavButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const section = target.getAttribute('data-dm-settings');
                if (!section) return;
                setState({ settingsSection: section });
            });
        });

        const projectLinks = root.querySelectorAll('[data-dm-project]');
        projectLinks.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const projectId = button.getAttribute('data-dm-project');
                if (!projectId) return;
                setState({
                    view: APP_VIEWS.DASHBOARD,
                    activeProjectId: projectId,
                    mapSection: MAP_SECTIONS.LIST,
                });
            });
        });

        const modalTriggers = root.querySelectorAll('[data-dm-modal]');
        modalTriggers.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const modal = button.getAttribute('data-dm-modal');
                const payload = button.getAttribute('data-dm-payload');
                setState({ modal: modal ? { type: modal, payload } : null });
            });
        });

        const searchInput = root.querySelector('[data-dm-role="search"]');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                setState({ searchTerm: String(event.target.value ?? '') });
            });
        }

        const backButtons = root.querySelectorAll('[data-dm-back]');
        backButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setState({ view: APP_VIEWS.MAPS, mapSection: MAP_SECTIONS.LIST });
            });
        });

        const modalCloseButtons = root.querySelectorAll('[data-dm-close-modal]');
        modalCloseButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setState({ modal: null });
            });
        });

        const modalOverlay = root.querySelector('.dm-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) {
                    setState({ modal: null });
                }
            });
        }
    }

    const instance = {
        root,
        runtimeConfig,
        data,
        state,
        destroy() {
            root.innerHTML = '';
            delete root.dataset.dmHydrated;
            delete root.__dmInstance;
        },
    };

    root.__dmInstance = instance;
    render();
    return instance;
}

function renderAppShell(state, data) {
    return `
        <div class="dm-app">
            ${renderHeader(state)}
            <div class="dm-page">
                ${state.view === APP_VIEWS.MAPS ? renderMapsView(state, data) : ''}
                ${state.view === APP_VIEWS.DASHBOARD ? renderDashboardView(state, data) : ''}
                ${state.view === APP_VIEWS.SETTINGS ? renderSettingsView(state, data) : ''}
            </div>
        </div>
    `;
}

function renderHeader(state) {
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

function renderMapsView(state, data) {
    return `
        <section class="dm-main-surface">
            ${state.mapSection === MAP_SECTIONS.LIST ? renderMapList(data, state) : ''}
            ${state.mapSection === MAP_SECTIONS.FLOORS ? renderFloorsContent(data, state) : ''}
            ${state.mapSection === MAP_SECTIONS.BLUEPRINTS ? renderBlueprintsContent(data, state) : ''}
        </section>
    `;
}

function renderSubnavButton(label, section, activeSection) {
    const isActive = section === activeSection;
    return `
        <button type="button" class="dm-subnav__button ${isActive ? 'is-active' : ''}" data-dm-section="${section}">
            ${label}
        </button>
    `;
}

function renderMapList(data, state) {
    const project = data.projects[0];
    const floors = project.floors ?? [];
    const shortcode = `[fuudobre_map map_id="${project.id}"]`;

    const filterTerm = state.searchTerm.trim().toLowerCase();
    const filteredFloors = filterTerm
        ? floors.filter((floor) => `${floor.name} ${floor.type}`.toLowerCase().includes(filterTerm))
        : floors;

    return `
        <div class="dm-board">
            <div class="dm-board__table" role="table" aria-label="Zoznam máp">
                <div class="dm-board__head" role="row">
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Zoznam</div>
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Typ</div>
                    <div class="dm-board__cell dm-board__cell--head dm-board__cell--head-actions" role="columnheader">Akcie</div>
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Vloženie na web</div>
                </div>
                ${renderProjectRow(project, shortcode)}
                ${filteredFloors.map((floor) => renderFloorRow(floor, shortcode)).join('')}
            </div>
            <div class="dm-board__footer">
                <button class="dm-board__cta" data-dm-modal="add-map">Pridať mapu</button>
            </div>
        </div>
    `;
}

function renderProjectRow(project, shortcode) {
    return `
        <div class="dm-board__row dm-board__row--project" role="row">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--project" aria-hidden="true">
                    <div class="dm-board__thumb-image dm-board__thumb-image--project"></div>
                </div>
                <button type="button" class="dm-board__primary" data-dm-project="${project.id}">${escapeHtml(project.name)}</button>
            </div>
            <div class="dm-board__cell dm-board__cell--type" role="cell">${escapeHtml(project.type)}</div>
            <div class="dm-board__cell dm-board__cell--actions" role="cell">
                <button class="dm-board__chip" data-dm-project="${project.id}">Otvoriť</button>
                <button class="dm-board__chip" data-dm-modal="edit-map" data-dm-payload="${project.id}">Upraviť</button>
                <button class="dm-board__chip" data-dm-modal="delete-map" data-dm-payload="${project.id}">Zmazať</button>
            </div>
            <div class="dm-board__cell dm-board__cell--shortcode" role="cell">
                <code>${escapeHtml(shortcode)}</code>
            </div>
        </div>
    `;
}

function renderFloorRow(floor, shortcode) {
    return `
        <div class="dm-board__row dm-board__row--floor" role="row">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--floor" aria-hidden="true">
                    <div class="dm-board__thumb-image dm-board__thumb-image--floor"></div>
                </div>
                <span class="dm-board__label">${escapeHtml(floor.name)}</span>
            </div>
            <div class="dm-board__cell dm-board__cell--type" role="cell">${escapeHtml(floor.type)}</div>
            <div class="dm-board__cell dm-board__cell--actions" role="cell">
                <button class="dm-board__chip" data-dm-modal="draw-coordinates">Otvoriť</button>
                <button class="dm-board__chip" data-dm-modal="edit-map" data-dm-payload="${floor.id}">Upraviť</button>
                <button class="dm-board__chip" data-dm-modal="delete-map" data-dm-payload="${floor.id}">Zmazať</button>
            </div>
            <div class="dm-board__cell dm-board__cell--shortcode" role="cell">
                <code>${escapeHtml(shortcode)}</code>
            </div>
        </div>
    `;
}

function renderFloorsContent(data) {
    const project = data.projects[0];
    return `
        <div class="dm-card dm-card--wide">
            <header class="dm-section-head">
                <h2>Pridať lokalitu</h2>
                <p>Spravujte poschodia a ich detailné zobrazenia.</p>
            </header>
            <div class="dm-placeholder-grid">
                <div class="dm-placeholder-grid__preview">
                    <div class="dm-hero dm-hero--building"></div>
                </div>
                <div class="dm-placeholder-grid__form">
                    ${renderFormPlaceholder('Pridať lokalitu')}
                </div>
            </div>
            <footer class="dm-card__footer">
                <button class="dm-button dm-button--outline" data-dm-modal="draw-coordinates">Nakresliť súradnice</button>
                <button class="dm-button dm-button--primary" data-dm-modal="add-location">Pridať mapu</button>
            </footer>
            <div class="dm-card__list">
                <h3>Zoznam poschodí</h3>
                <ul class="dm-simple-list">
                    ${project.floors.map((floor) => `<li>${floor.name}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function renderBlueprintsContent() {
    return `
        <div class="dm-card dm-card--wide">
            <header class="dm-section-head">
                <h2>Pôdorysy projektu</h2>
                <p>Spravujte podklady a masky pre jednotlivé typy nehnuteľností.</p>
            </header>
            <div class="dm-blueprint-placeholder">
                <div class="dm-blueprint-placeholder__sheet">
                    <span>Pôdorys A1</span>
                </div>
                <div class="dm-blueprint-placeholder__sheet">
                    <span>Pôdorys B2</span>
                </div>
                <div class="dm-blueprint-placeholder__sheet">
                    <span>Pôdorys C3</span>
                </div>
            </div>
            <footer class="dm-card__footer">
                <button class="dm-button dm-button--primary" data-dm-modal="add-blueprint">Pridať pôdorys</button>
            </footer>
        </div>
    `;
}

function renderDashboardView(state, data) {
    const project = data.projects.find((item) => item.id === state.activeProjectId) ?? data.projects[0];
    const floors = project.floors ?? [];
    return `
        <section class="dm-dashboard">
            <button class="dm-link-button dm-dashboard__back" data-dm-back>← Späť na zoznam</button>
            <header class="dm-dashboard__hero">
                <div class="dm-dashboard__title">
                    <h1>${project.name}</h1>
                    <p>Dashboard / ${project.name}</p>
                </div>
            </header>
            <div class="dm-dashboard__media">
                <div class="dm-hero dm-hero--building">
                    ${floors
                        .map(
                            (floor, index) => `
                                <span class="dm-hero__label" style="top:${18 + index * 12}%">${floor.label}</span>
                            `,
                        )
                        .join('')}
                </div>
            </div>
            <section class="dm-dashboard__list">
                <header class="dm-dashboard__list-head">
                    <h2>Zoznam lokalít</h2>
                    <div class="dm-dashboard__actions">
                        <input type="search" placeholder="Vyhľadať lokalitu..." />
                        <select>
                            <option>Stav</option>
                        </select>
                        <button class="dm-button dm-button--dark" data-dm-modal="add-location">+ Pridať lokalitu</button>
                    </div>
                </header>
                <table class="dm-dashboard__table">
                    <thead>
                        <tr>
                            <th>Typ</th>
                            <th>Názov</th>
                            <th>Rozloha</th>
                            <th>Akcie</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${floors
                            .map(
                                (floor) => `
                                    <tr>
                                        <td>${floor.type}</td>
                                        <td>${floor.name.replace('Poschodie ', '')}</td>
                                        <td>${floor.area}</td>
                                        <td>
                                            <button class="dm-table-link" data-dm-modal="edit-map">Upraviť</button>
                                            <span>|</span>
                                            <button class="dm-table-link" data-dm-modal="delete-map">Odstrániť</button>
                                        </td>
                                    </tr>
                                `,
                            )
                            .join('')}
                    </tbody>
                </table>
            </section>
        </section>
    `;
}

function renderSettingsView(state, data) {
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

function renderModal(state, data) {
    if (!state.modal) return '';
    const { type } = state.modal;
    switch (type) {
        case 'add-map':
            return renderFormModal('Pridať mapu', 'Pridať mapu');
        case 'edit-map':
            return renderFormModal('Upraviť mapu', 'Uložiť zmeny', true);
        case 'delete-map':
            return renderConfirmModal();
        case 'draw-coordinates':
            return renderDrawModal();
        case 'add-location':
            return renderFormModal('Pridať lokalitu', 'Pridať lokalitu');
        case 'add-type':
            return renderSimpleModal('Pridať typ', renderSimpleForm('Nový typ'));
        case 'add-status':
            return renderSimpleModal('Pridať stav', renderSimpleForm('Nový stav'));
        case 'add-blueprint':
            return renderSimpleModal('Pridať pôdorys', renderSimpleForm('Názov pôdorysu'));
        default:
            return renderSimpleModal('Info', `<p>Funkcia <strong>${escapeHtml(type)}</strong> je pripravená na implementáciu.</p>`);
    }
}

function renderFormModal(title, cta, includeImage = false) {
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal">
                <header class="dm-modal__header">
                    <h2>${title}</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body ${includeImage ? 'dm-modal__body--with-media' : ''}">
                    ${includeImage ? '<div class="dm-modal__media dm-hero dm-hero--building"></div>' : ''}
                    <form class="dm-modal__form">
                        <div class="dm-form__grid">
                            <label class="dm-field">
                                <span>Nadradené</span>
                                <select><option>Bytovka</option></select>
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
                        <div class="dm-modal__actions">
                            <button type="button" class="dm-button dm-button--dark">${cta}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderConfirmModal() {
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>Ste si istý?</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">
                    <p>Naozaj chcete vymazať túto položku?</p>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Zrušiť</button>
                    <button class="dm-button dm-button--dark">Vymazať</button>
                </footer>
            </div>
        </div>
    `;
}

function renderDrawModal() {
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--wide">
                <header class="dm-modal__header">
                    <h2>Nakresliť súradnice</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">
                    <div class="dm-draw">
                        <div class="dm-hero dm-hero--building dm-hero--draw">
                            <svg viewBox="0 0 640 380" class="dm-draw__overlay" aria-hidden="true">
                                <polyline points="80,140 480,120 520,210 110,240" fill="rgba(0,200,0,0.16)" stroke="#2dd4bf" stroke-width="6" stroke-linejoin="round"></polyline>
                                <circle cx="80" cy="140" r="8"></circle>
                                <circle cx="480" cy="120" r="8"></circle>
                                <circle cx="520" cy="210" r="8"></circle>
                                <circle cx="110" cy="240" r="8"></circle>
                            </svg>
                        </div>
                    </div>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Vrátiť zmeny</button>
                    <button class="dm-button dm-button--dark">Uložiť a zatvoriť</button>
                </footer>
            </div>
        </div>
    `;
}

function renderSimpleModal(title, body) {
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>${title}</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">${body}</div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Zrušiť</button>
                    <button class="dm-button dm-button--dark">Uložiť</button>
                </footer>
            </div>
        </div>
    `;
}

function renderSimpleForm(placeholder) {
    return `
        <form class="dm-form">
            <label class="dm-field">
                <span>${placeholder}</span>
                <input type="text" />
            </label>
        </form>
    `;
}

function createDemoData() {
    return {
        projects: [
            {
                id: '1',
                name: 'Bytovka',
                type: 'Bytovka',
                floors: [
                    { id: 'floor-1', name: 'Poschodie 1', type: 'Bytovka', label: '1. NP', area: '629.00 m²' },
                    { id: 'floor-2', name: 'Poschodie 2', type: 'Bytovka', label: '2. NP', area: '578.00 m²' },
                    { id: 'floor-3', name: 'Poschodie 3', type: 'Bytovka', label: '3. NP', area: '722.00 m²' },
                    { id: 'floor-4', name: 'Poschodie 4', type: 'Bytovka', label: '4. NP', area: '708.00 m²' },
                    { id: 'floor-5', name: 'Poschodie 5', type: 'Bytovka', label: '5. NP', area: '616.00 m²' },
                    { id: 'floor-6', name: 'Poschodie 6', type: 'Bytovka', label: '1. PP', area: '658.00 m²' },
                ],
            },
        ],
        types: [
            { id: 'type-1', label: 'Bytovka', color: '#22c55e' },
            { id: 'type-2', label: 'Dom', color: '#22c55e' },
            { id: 'type-3', label: 'Pozemok', color: '#22c55e' },
        ],
        statuses: [
            { id: 'status-1', label: 'Voľné', color: '#22c55e' },
            { id: 'status-2', label: 'Predané', color: '#22c55e' },
            { id: 'status-3', label: 'Rezervované', color: '#22c55e' },
        ],
        colors: [
            { id: 'color-1', label: 'Farba tlačidiel', value: '#7c3aed' },
            { id: 'color-2', label: 'Farba nadpisov', value: '#111827' },
            { id: 'color-3', label: 'Farba obsahových textov', value: '#6b7280' },
        ],
        fonts: [
            { id: 'font-1', label: 'Font nadpisov' },
            { id: 'font-2', label: 'Font popisových textov' },
            { id: 'font-3', label: 'Font tlačidiel' },
        ],
    };
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default initDeveloperMap;
