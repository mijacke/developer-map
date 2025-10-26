import { escapeHtml } from '../utils/html.js';

const TOOLBAR_ICONS = {
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    chevron: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
};

const ACTION_ICONS = {
    open: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

function safeText(value, fallback = '—') {
    if (value === null || value === undefined || value === '') {
        return escapeHtml(fallback);
    }
    return escapeHtml(String(value));
}

function slugifyStatus(label) {
    if (!label) return 'unknown';
    return label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-)|(-$)/g, '') || 'unknown';
}

function resolveStatus(floor, statuses) {
    if (!floor) {
        return { label: 'Neznáme', variant: 'unknown' };
    }

    const statusById = floor.statusId
        ? statuses.find((status) => String(status.id) === String(floor.statusId))
        : null;
    const label = floor.statusLabel ?? floor.status ?? statusById?.label ?? 'Neznáme';
    const hasExplicitStatus = Boolean(floor.statusId || floor.status || floor.statusLabel);
    const normalized = slugifyStatus(label);

    return {
        label,
        variant: hasExplicitStatus ? normalized : 'unknown',
    };
}

function renderDashboardAction(type, modal, payload, label) {
    const iconMarkup = ACTION_ICONS[type] ?? '';
    const attributes = [
        'type="button"',
        `class="dm-dashboard__action dm-dashboard__action--${type}"`,
        `aria-label="${escapeHtml(label)}"`,
        `title="${escapeHtml(label)}"`,
        modal ? `data-dm-modal="${escapeHtml(modal)}"` : '',
        payload ? `data-dm-payload="${escapeHtml(String(payload))}"` : '',
    ]
        .filter(Boolean)
        .join(' ');

    return `
        <button ${attributes}>
            <span class="dm-dashboard__action-icon" aria-hidden="true">${iconMarkup}</span>
        </button>
    `;
}

function renderStatusBadge(status) {
    return `
        <span class="dm-status dm-status--${escapeHtml(status.variant)}">
            ${escapeHtml(status.label)}
        </span>
    `;
}

export function renderDashboardView(state, data) {
    const project = data.projects.find((item) => item.id === state.activeProjectId) ?? data.projects[0];
    const floors = project?.floors ?? [];
    const statuses = data.statuses ?? [];

    const tableRows =
        floors.length > 0
            ? floors
                  .map((floor) => {
                      const status = resolveStatus(floor, statuses);
                      const designation = floor.designation ?? floor.shortcode ?? floor.label;

                      return `
                        <tr role="row">
                            <td role="cell" data-label="Typ">${safeText(floor.type)}</td>
                            <td role="cell" data-label="Názov">${safeText(floor.name)}</td>
                            <td role="cell" data-label="Označenie">${safeText(designation)}</td>
                            <td role="cell" data-label="Rozloha">${safeText(floor.area)}</td>
                            <td role="cell" data-label="Cena">${safeText(floor.price)}</td>
                            <td role="cell" data-label="Prenájom">${safeText(floor.rent)}</td>
                            <td role="cell" data-label="Stav">${renderStatusBadge(status)}</td>
                            <td role="cell" data-label="Akcie">
                                <div class="dm-dashboard__row-actions">
                                    ${renderDashboardAction(
                                        'open',
                                        'draw-coordinates',
                                        floor.id,
                                        `Zobraziť lokalitu ${floor.name}`,
                                    )}
                                    ${renderDashboardAction(
                                        'edit',
                                        'edit-map',
                                        floor.id,
                                        `Upraviť lokalitu ${floor.name}`,
                                    )}
                                    ${renderDashboardAction(
                                        'delete',
                                        'delete-map',
                                        floor.id,
                                        `Zmazať lokalitu ${floor.name}`,
                                    )}
                                </div>
                            </td>
                        </tr>
                    `;
                  })
                  .join('')
            : `
                <tr role="row" class="dm-dashboard__empty-row">
                    <td role="cell" colspan="8">
                        <div class="dm-dashboard__empty-state">
                            <p>V tomto projekte zatiaľ nie sú žiadne lokality.</p>
                            <button type="button" class="dm-dashboard__add dm-dashboard__add--ghost" data-dm-modal="add-location">
                                <span class="dm-dashboard__add-icon" aria-hidden="true">${TOOLBAR_ICONS.plus}</span>
                                Pridať prvú lokalitu
                            </button>
                        </div>
                    </td>
                </tr>
            `;

    return `
        <section class="dm-dashboard">
            <button class="dm-link-button dm-dashboard__back" data-dm-back>← Späť na zoznam</button>
            <div class="dm-dashboard__card">
                <header class="dm-dashboard__card-head">
                    <div class="dm-dashboard__heading">
                        <h1>Zoznam lokalít</h1>
                        <p>${escapeHtml(project?.name ?? '')}</p>
                    </div>
                    <div class="dm-dashboard__toolbar" role="search">
                        <label class="dm-dashboard__search">
                            <span class="dm-dashboard__search-icon" aria-hidden="true">${TOOLBAR_ICONS.search}</span>
                            <input
                                type="search"
                                name="dm-dashboard-search"
                                placeholder="Vyhľadať lokalitu..."
                                autocomplete="off"
                                aria-label="Vyhľadať lokalitu"
                            />
                        </label>
                        <label class="dm-dashboard__select">
                            <select name="dm-dashboard-status" aria-label="Filtrovať podľa stavu">
                                <option value="">Stav</option>
                                ${statuses
                                    .map(
                                        (status) =>
                                            `<option value="${escapeHtml(String(status.id))}">${escapeHtml(status.label)}</option>`,
                                    )
                                    .join('')}
                            </select>
                            <span class="dm-dashboard__select-icon" aria-hidden="true">${TOOLBAR_ICONS.chevron}</span>
                        </label>
                        <label class="dm-dashboard__select">
                            <select name="dm-dashboard-price" aria-label="Filtrovať podľa ceny">
                                <option value="">Cena</option>
                                <option value="asc">Najnižšia</option>
                                <option value="desc">Najvyššia</option>
                            </select>
                            <span class="dm-dashboard__select-icon" aria-hidden="true">${TOOLBAR_ICONS.chevron}</span>
                        </label>
                        <button class="dm-dashboard__add" data-dm-modal="add-location">
                            <span class="dm-dashboard__add-icon" aria-hidden="true">${TOOLBAR_ICONS.plus}</span>
                            Pridať lokalitu
                        </button>
                    </div>
                </header>
                <div class="dm-dashboard__table-wrapper">
                    <table class="dm-dashboard__table" role="table">
                        <thead>
                            <tr role="row">
                                <th scope="col">Typ</th>
                                <th scope="col">Názov</th>
                                <th scope="col">Označenie</th>
                                <th scope="col">Rozloha</th>
                                <th scope="col">Cena</th>
                                <th scope="col">Prenájom</th>
                                <th scope="col">Stav</th>
                                <th scope="col">Akcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `;
}
