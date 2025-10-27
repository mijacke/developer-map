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
            </header>
            <div class="dm-main-surface__content">
                ${renderMapList(data, state)}
            </div>
        </section>
    `;
}



const ACTION_ICONS = {
    open: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waypoints-icon lucide-waypoints"><circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

const HEADER_ICONS = {
    list: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-filter-icon lucide-list-filter"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></svg>',
    type: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-filter-icon lucide-list-filter"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></svg>',
    actions: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-filter-icon lucide-list-filter"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></svg>',
    embed: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-filter-icon lucide-list-filter"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
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

function renderColumnHeader(label, iconKey, extraClass = '') {
    const iconMarkup = HEADER_ICONS[iconKey] ?? '';
    const classNames = `dm-board__cell dm-board__cell--head${extraClass ? ' ' + extraClass : ''}`;
    return `
        <div class="${classNames}" role="columnheader">
            <span class="dm-board__header-icon" aria-hidden="true">${iconMarkup}</span>
            <span>${escapeHtml(label)}</span>
        </div>
    `;
}

function renderMapList(data, state) {
    const projects = data.projects ?? [];
    const filterTerm = state.searchTerm.trim().toLowerCase();

    return `
        <div class="dm-board dm-board--list">
            <div class="dm-board__table" role="table" aria-label="Zoznam máp">
                <div class="dm-board__head" role="row">
                    ${renderColumnHeader('Zoznam', 'list')}
                    ${renderColumnHeader('Typ', 'type')}
                    ${renderColumnHeader('Akcie', 'actions', 'dm-board__cell--head-actions')}
                    ${renderColumnHeader('Vloženie na web', 'embed')}
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
                <button class="dm-board__cta" data-dm-modal="add-map">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                    Pridať mapu
                </button>
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
    const projectImage = project.image ?? MEDIA.building;
    
    return `
        <div class="dm-board__row dm-board__row--project dm-board__row--parent" role="row" data-dm-parent-id="${project.id}">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--project dm-board__thumb--clickable" data-dm-project="${project.id}" role="button" tabindex="0" aria-label="${escapeHtml(`Otvoriť projekt ${project.name}`)}">
                    <img src="${escapeHtml(projectImage)}" alt="${escapeHtml(`Náhľad projektu ${project.name}`)}" loading="lazy" />
                </div>
                <span class="dm-board__label">${escapeHtml(project.name)}</span>
                ${floorsCount > 0 ? `<span class="dm-board__children-count">${floorsCount}</span>` : ''}
            </div>
            <div class="dm-board__cell dm-board__cell--type" role="cell" data-label="Typ:">${escapeHtml(project.type)}</div>
            <div class="dm-board__cell dm-board__cell--actions" role="cell" data-label="Akcie:">
                ${renderActionButton('open', 'Lokality', {
                    'data-dm-modal': 'draw-coordinates',
                    'data-dm-payload': project.id,
                })}
                ${renderActionButton('edit', 'Upraviť', {
                    'data-dm-modal': 'edit-map',
                    'data-dm-payload': project.id,
                })}
                ${renderActionButton('delete', 'Zmazať', {
                    'data-dm-modal': 'delete-map',
                    'data-dm-payload': project.id,
                })}
            </div>
            <div class="dm-board__cell dm-board__cell--shortcode" role="cell" data-label="Shortcode:">
                <code>
                    <span>${escapeHtml(shortcode)}</span>
                    <button type="button" class="dm-copy-button" data-dm-copy="${escapeHtml(shortcode)}" aria-label="Kopírovať shortcode" title="Kopírovať do schránky">
                        <span class="dm-copy-button__icon" aria-hidden="true">${HEADER_ICONS.copy}</span>
                    </button>
                </code>
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
    const floorImage = floor.image ?? MEDIA.floor;
    return `
        <div class="dm-board__row dm-board__row--floor dm-board__row--child" role="row" data-dm-child-id="${floor.id}">
            <div class="dm-board__cell dm-board__cell--main" role="cell">
                <div class="dm-board__thumb dm-board__thumb--floor dm-board__thumb--clickable" data-dm-modal="draw-coordinates" data-dm-payload="${floor.id}" role="button" tabindex="0" aria-label="${escapeHtml(`Zobraziť lokalitu ${floor.name}`)}">
                    <img src="${escapeHtml(floorImage)}" alt="${escapeHtml(`Pôdorys ${floor.name}`)}" loading="lazy" />
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
                <code>
                    <span>${escapeHtml(shortcode)}</span>
                    <button type="button" class="dm-copy-button" data-dm-copy="${escapeHtml(shortcode)}" aria-label="Kopírovať shortcode" title="Kopírovať do schránky">
                        <span class="dm-copy-button__icon" aria-hidden="true">${HEADER_ICONS.copy}</span>
                    </button>
                </code>
            </div>
        </div>
    `;
}




