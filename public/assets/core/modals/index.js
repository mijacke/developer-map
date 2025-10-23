import { MEDIA, DRAW_VIEWBOX } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function renderModal(state, data) {
    if (!state.modal) return '';
    const { type, payload } = state.modal;
    switch (type) {
        case 'add-map':
            return renderFormModal('Pridať mapu', 'Pridať mapu');
        case 'edit-map':
            return renderFormModal('Upraviť mapu', 'Uložiť zmeny', true);
        case 'delete-map':
            return renderConfirmModal();
        case 'draw-coordinates':
            return renderDrawModal(state, data);
        case 'add-location':
            return renderFormModal('Pridať lokalitu', 'Pridať lokalitu');
        case 'add-type':
            return renderSimpleModal('Pridať typ', renderSimpleForm('Nový typ'));
        case 'add-status':
            return renderSimpleModal('Pridať stav', renderSimpleForm('Nový stav'));
        case 'add-blueprint':
            return renderSimpleModal('Pridať pôdorys', renderSimpleForm('Názov pôdorysu'));
        case 'edit-color':
            return renderColorModal(data, payload);
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

function renderDrawModal(state, data) {
    const payload = state.modal?.payload ?? null;
    const project = data.projects[0];
    const floors = project?.floors ?? [];
    const activeFloor = payload ? floors.find((floor) => floor.id === payload) : floors[0];
    const floorLabel = activeFloor?.name ?? 'Lokalita';
    const projectBadge = project && typeof project.badge === 'string' ? project.badge : 'A';
    const floorBadge = projectBadge.trim().slice(0, 2).toUpperCase() || 'A';
    const npSorted = floors
        .filter((floor) => /NP$/i.test(floor.label ?? ''))
        .sort((a, b) => {
            const aNum = parseInt(String(a.label).replace(/\D/g, ''), 10) || 0;
            const bNum = parseInt(String(b.label).replace(/\D/g, ''), 10) || 0;
            return bNum - aNum;
        });
    const npLabels = (npSorted.length > 4 ? npSorted.slice(1, 5) : npSorted.slice(0, 4)).map((floor) => floor.label);
    const ppLabel = floors.find((floor) => /PP$/i.test(floor.label ?? ''))?.label;
    const levelLabels = Array.from(new Set(ppLabel ? [...npLabels, ppLabel] : npLabels));
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--draw">
                <header class="dm-modal__header dm-modal__header--center">
                    <h2>Nakresliť súradnice</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body dm-modal__body--draw">
                    <div class="dm-draw" data-dm-draw-root data-dm-floor="${activeFloor ? escapeHtml(activeFloor.id) : ''}" data-dm-floor-name="${escapeHtml(floorLabel)}">
                        <div class="dm-draw__stage">
                            <img src="${MEDIA.draw}" alt="Ukážkový objekt na zakreslenie súradníc" class="dm-draw__image" draggable="false" />
                            <svg class="dm-draw__overlay" viewBox="0 0 ${DRAW_VIEWBOX.width} ${DRAW_VIEWBOX.height}" preserveAspectRatio="xMidYMid slice" data-role="overlay">
                                <polygon class="dm-draw__shape-fill" data-role="fill" points=""></polygon>
                                <polyline class="dm-draw__shape-outline" data-role="outline" points=""></polyline>
                                <polyline class="dm-draw__shape-baseline" data-role="baseline" points=""></polyline>
                                <g class="dm-draw__handles" data-role="handles"></g>
                            </svg>
                            <div class="dm-draw__badge">${escapeHtml(floorBadge)}</div>
                            <div class="dm-draw__cursor" aria-hidden="true">
                                <img src="${MEDIA.cursor}" alt="" draggable="false" />
                            </div>
                            <ul class="dm-draw__levels">
                                ${levelLabels
                                    .map(
                                        (label) => `
                                            <li class="${activeFloor?.label === label ? 'is-active' : ''}">
                                                ${escapeHtml(label)}
                                            </li>
                                        `,
                                    )
                                    .join('')}
                            </ul>
                        </div>
                        <div class="dm-draw__toolbar">
                            <div class="dm-draw__toolbar-left">
                                <span class="dm-draw__floor-label">${escapeHtml(floorLabel)}</span>
                                <span class="dm-draw__hint">Kliknite pre pridanie bodu • potiahnite bod pre úpravu</span>
                            </div>
                            <code class="dm-draw__output" data-role="output"></code>
                        </div>
                    </div>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split dm-modal__actions--draw">
                    <button type="button" class="dm-button dm-button--outline" data-dm-reset-draw>Vrátiť zmeny</button>
                    <button type="button" class="dm-button dm-button--dark" data-dm-save-draw>Uložiť a zatvoriť</button>
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

function renderColorModal(data, payload) {
    const colorId = payload || 'color-1';
    const color = data.colors.find((c) => c.id === colorId) || data.colors[0];
    
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>Upraviť farbu</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">
                    <form class="dm-form">
                        <label class="dm-field">
                            <span>${escapeHtml(color.label)}</span>
                            <input 
                                type="color" 
                                value="${escapeHtml(color.value)}" 
                                data-dm-color-input="${escapeHtml(color.id)}"
                                style="width: 100%; height: 60px; border-radius: 12px; border: 1px solid var(--dm-border); cursor: pointer;"
                            />
                        </label>
                        <label class="dm-field">
                            <span>HEX kód</span>
                            <input 
                                type="text" 
                                value="${escapeHtml(color.value)}" 
                                data-dm-color-text="${escapeHtml(color.id)}"
                                placeholder="#000000"
                            />
                        </label>
                    </form>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Zrušiť</button>
                    <button class="dm-button dm-button--dark" data-dm-save-color="${escapeHtml(color.id)}">Uložiť</button>
                </footer>
            </div>
        </div>
    `;
}
