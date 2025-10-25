import { MAP_SECTIONS, MEDIA } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function renderMapsView(state, data) {
    const projectsCount = data.projects?.length ?? 0;
    const totalFloors = data.projects?.reduce((sum, p) => sum + (p.floors?.length ?? 0), 0) ?? 0;
    const subtitle = projectsCount > 0
        ? `${projectsCount} ${projectsCount === 1 ? 'projekt' : projectsCount <= 4 ? 'projekty' : 'projektov'} • ${totalFloors} ${totalFloors === 1 ? 'lokalita' : totalFloors <= 4 ? 'lokality' : 'lokalít'}`
        : 'Spravujte developerské projekty a ich mapy.';

    return `
        <section class="dm-main-surface">
            <header class="dm-main-surface__header">
                <div class="dm-main-surface__title">
                    <h1>Developer Map</h1>
                    <p>${subtitle}</p>
                </div>
                <nav class="dm-subnav" role="tablist" aria-label="Sekcie máp">
                    ${renderSubnavButton('Zoznam', MAP_SECTIONS.LIST, state.mapSection)}
                    ${renderSubnavButton('Poschodia', MAP_SECTIONS.FLOORS, state.mapSection)}
                    ${renderSubnavButton('Pôdorysy', MAP_SECTIONS.BLUEPRINTS, state.mapSection)}
                </nav>
            </header>
            <div class="dm-main-surface__content">
                ${state.mapSection === MAP_SECTIONS.LIST ? renderMapList(data, state) : ''}
                ${state.mapSection === MAP_SECTIONS.FLOORS ? renderFloorsContent(data, state) : ''}
                ${state.mapSection === MAP_SECTIONS.BLUEPRINTS ? renderBlueprintsContent(data, state) : ''}
            </div>
        </section>
    `;
}

function renderSubnavButton(label, section, activeSection) {
    const isActive = section === activeSection;
    return `
        <button type="button" class="dm-subnav__button${isActive ? ' is-active' : ''}" data-dm-section="${section}" role="tab" aria-selected="${isActive}">
            ${escapeHtml(label)}
        </button>
    `;
}

const ACTION_ICONS = {
    open: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M5 5H13V13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 13L13 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>',
    edit: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M3.25 12.75V14.75H5.25L12.58 7.42L10.58 5.42L3.25 12.75Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.58 4.42L13.58 6.42" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg>',
    delete: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4.5 5.5H13.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path><path d="M6.25 5.5V4.6C6.25 4.04 6.7 3.5 7.36 3.5H10.64C11.3 3.5 11.75 4.04 11.75 4.6V5.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path><path d="M6 5.5L6.5 14C6.54 14.58 7 15.05 7.58 15.05H10.42C11 15.05 11.46 14.58 11.5 14L12 5.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path><path d="M7.75 8.25L8 12.3" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"></path><path d="M10.25 8.25L10 12.3" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"></path></svg>',
};

function renderActionButton(type, label, attributes = {}) {
    const iconMarkup = ACTION_ICONS[type] ?? '';
    const attributeString = Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && value !== false)
        .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
        .join(' ');
    const inlineAttributes = attributeString ? ` ${attributeString}` : '';
    return `
        <button type="button" class="dm-icon-button dm-icon-button--${escapeHtml(type)}"${inlineAttributes} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
            <span class="dm-icon-button__icon" aria-hidden="true">${iconMarkup}</span>
        </button>
    `;
}

function renderMapList(data, state) {
    const projects = data.projects ?? [];
    const filterTerm = state.searchTerm.trim().toLowerCase();

    return `
        <div class="dm-board dm-board--list">
            <div class="dm-board__table" role="table" aria-label="Zoznam máp">
                <div class="dm-board__head" role="row">
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Zoznam</div>
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Typ</div>
                    <div class="dm-board__cell dm-board__cell--head dm-board__cell--head-actions" role="columnheader">Akcie</div>
                    <div class="dm-board__cell dm-board__cell--head" role="columnheader">Vloženie na web</div>
                </div>
                ${projects.map((project) => {
                    const shortcode = `[fuudobre_map map_id="${project.id}"]`;
                    const floors = project.floors ?? [];
                    const filteredFloors = filterTerm
                        ? floors.filter((floor) => `${floor.name} ${floor.type}`.toLowerCase().includes(filterTerm))
                        : floors;
                    return renderProjectRow(project, shortcode, filteredFloors);
                }).join('')}
            </div>
            <div class="dm-board__footer">
                <button class="dm-board__cta" data-dm-modal="add-map">Pridať mapu</button>
            </div>
        </div>
    `;
}

function renderProjectRow(project, shortcode, floors = []) {
    const floorsCount = floors.length;
    const toggleIcon = `
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
    `;
    
    return `
        <div class="dm-board__row dm-board__row--project dm-board__row--parent" role="row" data-dm-parent-id="${project.id}">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--project dm-board__thumb--clickable" aria-hidden="true" data-dm-project="${project.id}" role="button" tabindex="0" aria-label="${escapeHtml(`Otvoriť projekt ${project.name}`)}">
                    <img src="${MEDIA.building}" alt="${escapeHtml(`Náhľad projektu ${project.name}`)}" loading="lazy" />
                </div>
                <span class="dm-board__label">${escapeHtml(project.name)}</span>
                ${floorsCount > 0 ? `<span class="dm-board__children-count">${floorsCount}</span>` : ''}
            </div>
            <div class="dm-board__cell dm-board__cell--type" role="cell" data-label="Typ:">${escapeHtml(project.type)}</div>
            <div class="dm-board__cell dm-board__cell--actions" role="cell" data-label="Akcie:">
                ${renderActionButton('open', `Zobraziť projekt ${project.name}`, {
                    'data-dm-modal': 'draw-coordinates',
                    'data-dm-payload': project.id,
                })}
                ${renderActionButton('edit', `Upraviť projekt ${project.name}`, {
                    'data-dm-modal': 'edit-map',
                    'data-dm-payload': project.id,
                })}
                ${renderActionButton('delete', `Zmazať projekt ${project.name}`, {
                    'data-dm-modal': 'delete-map',
                    'data-dm-payload': project.id,
                })}
            </div>
            <div class="dm-board__cell dm-board__cell--shortcode" role="cell" data-label="Shortcode:">
                <code>${escapeHtml(shortcode)}</code>
            </div>
            ${floorsCount > 0 ? `
                <button type="button" class="dm-board__toggle" data-dm-toggle="${project.id}" aria-expanded="false" aria-label="Rozbaliť poschodia">
                    <span class="dm-board__toggle-icon">${toggleIcon}</span>
                </button>
            ` : ''}
        </div>
        ${floorsCount > 0 ? `
            <div class="dm-board__children" data-dm-children="${project.id}">
                <div class="dm-board__children-inner">
                    ${floors.map((floor) => renderFloorRow(floor, shortcode)).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function renderFloorRow(floor, shortcode) {
    return `
        <div class="dm-board__row dm-board__row--floor dm-board__row--child" role="row" data-dm-child-id="${floor.id}">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--floor dm-board__thumb--clickable" aria-hidden="true" data-dm-modal="draw-coordinates" data-dm-payload="${floor.id}" role="button" tabindex="0" aria-label="${escapeHtml(`Zobraziť lokalitu ${floor.name}`)}">
                    <img src="${MEDIA.floor}" alt="${escapeHtml(`Pôdorys ${floor.name}`)}" loading="lazy" />
                    <span class="dm-board__thumb-floor-highlight"></span>
                </div>
                <span class="dm-board__label">${escapeHtml(floor.name)}</span>
            </div>
            <div class="dm-board__cell dm-board__cell--type" role="cell" data-label="Typ:">${escapeHtml(floor.type)}</div>
            <div class="dm-board__cell dm-board__cell--actions" role="cell" data-label="Akcie:">
                ${renderActionButton('open', `Zobraziť lokalitu ${floor.name}`, {
                    'data-dm-modal': 'draw-coordinates',
                    'data-dm-payload': floor.id,
                })}
                ${renderActionButton('edit', `Upraviť lokalitu ${floor.name}`, {
                    'data-dm-modal': 'edit-map',
                    'data-dm-payload': floor.id,
                })}
                ${renderActionButton('delete', `Zmazať lokalitu ${floor.name}`, {
                    'data-dm-modal': 'delete-map',
                    'data-dm-payload': floor.id,
                })}
            </div>
            <div class="dm-board__cell dm-board__cell--shortcode" role="cell" data-label="Shortcode:">
                <code>${escapeHtml(shortcode)}</code>
            </div>
        </div>
    `;
}

function renderFormPlaceholder(title) {
    return `
        <div class="dm-form-placeholder">
            <div class="dm-form-placeholder__header">
                <h3>${escapeHtml(title)}</h3>
            </div>
            <div class="dm-form-placeholder__fields">
                <div class="dm-form-placeholder__field">
                    <div class="dm-form-placeholder__label"></div>
                    <div class="dm-form-placeholder__input"></div>
                </div>
                <div class="dm-form-placeholder__field">
                    <div class="dm-form-placeholder__label"></div>
                    <div class="dm-form-placeholder__input"></div>
                </div>
                <div class="dm-form-placeholder__field">
                    <div class="dm-form-placeholder__label"></div>
                    <div class="dm-form-placeholder__input"></div>
                </div>
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
