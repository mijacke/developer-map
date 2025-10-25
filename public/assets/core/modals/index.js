import { MEDIA, DRAW_VIEWBOX } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function renderModal(state, data) {
    if (!state.modal) return '';
    const { type, payload } = state.modal;
    switch (type) {
        case 'add-map':
            return renderFormModal('Pridať mapu', 'Pridať mapu');
        case 'edit-map':
            return renderFormModal('Upraviť mapu', 'Uložiť zmeny');
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
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    const infoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    const isEdit = title === 'Upraviť mapu';
    const headerIcon = isEdit ? arrowIcon : plusIcon;
    
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal">
                <header class="dm-modal__header">
                    <div class="dm-modal__header-left">
                        ${headerIcon}
                        <h2>${title}</h2>
                    </div>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body ${includeImage ? 'dm-modal__body--with-media' : ''}">
                    ${includeImage ? `
                        <div class="dm-modal__media-wrapper">
                            <div class="dm-modal__media dm-hero dm-hero--building"></div>
                            <button type="button" class="dm-modal__upload-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                Nahrať obrázok
                            </button>
                        </div>
                    ` : ''}
                    <form class="dm-modal__form">
                        <div class="dm-modal__form-layout">
                            <div class="dm-upload-card">
                                <div class="dm-upload-card__dropzone">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#5a3bff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                                <label for="dm-modal-upload" class="dm-upload-card__footer">
                                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                                        <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
                                    </svg>
                                    <p>Nahrať obrázok</p>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z" stroke="currentColor" stroke-width="2"></path>
                                        <path d="M19.5 5H4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                                        <path d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z" stroke="currentColor" stroke-width="2"></path>
                                    </svg>
                                </label>
                                <input id="dm-modal-upload" type="file" class="dm-upload-card__input" />
                            </div>
                            <div class="dm-modal__form-fields">
                                <div class="dm-form__grid">
                                    <div class="dm-form__column">
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Nadradená</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Vyberte nadradenú mapu">${infoIcon}</button>
                                            </span>
                                            <select>
                                                <option value="">Žiadna nadradená mapa</option>
                                                <option>Bytovka</option>
                                                <option>Obchodné centrum</option>
                                            </select>
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Typ</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Typ nehnuteľnosti alebo objektu">${infoIcon}</button>
                                            </span>
                                            <select>
                                                <option value="">Vyberte typ</option>
                                                <option>Pozemok</option>
                                                <option>Byt</option>
                                                <option>Dom</option>
                                                <option>Kancelária</option>
                                            </select>
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Názov</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Názov mapy alebo lokality">${infoIcon}</button>
                                            </span>
                                            <input type="text" placeholder="Napr. Byt 1.01" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Minimálny zoom</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Minimálne možné oddialenie mapy">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="0.5" step="0.1" min="0.1" max="5.0" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Maximálny zoom</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Maximálne možné priblíženie mapy">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="3.0" step="0.1" min="0.1" max="5.0" />
                                        </label>
                                    </div>
                                    <div class="dm-form__column">
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Východzí zoom</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Východzie priblíženie mapy pri načítaní">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="1.0" step="0.1" min="0.1" max="5.0" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Šírka mapy</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Šírka obrázku mapy v pixeloch">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="1600" step="1" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Výška mapy</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Výška obrázku mapy v pixeloch">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="900" step="1" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Hrúbka ohraničenia</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Šírka čiary ohraničenia lokality v pixeloch">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="2" step="1" min="1" max="10" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Prehľadnosť ohraničenia</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Priehľadnosť čiary ohraničenia (0-100%)">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="100" step="1" min="0" max="100" />
                                        </label>
                                    </div>
                                    <div class="dm-form__column">
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Prehľadnosť pozadia</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Priehľadnosť výplne lokality (0-100%)">${infoIcon}</button>
                                            </span>
                                            <input type="number" placeholder="40" step="1" min="0" max="100" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Smer</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Smer orientácie objektu">${infoIcon}</button>
                                            </span>
                                            <input type="text" placeholder="Napr. Sever, Juh, Východ, Západ" />
                                        </label>
                                        <label class="dm-field">
                                            <span class="dm-field__label">
                                                <span class="dm-field__label-main">
                                                    <span class="dm-field__label-text">Uhol</span>
                                                    <span class="dm-field__required" aria-hidden="true">*</span>
                                                </span>
                                                <button type="button" class="dm-field__info" aria-label="Informácie o poli" title="Uhol natočenia objektu v stupňoch">${infoIcon}</button>
                                            </span>
                                            <input type="text" placeholder="Napr. 90°, 180°, 270°" />
                                        </label>
                                    </div>
                                </div>
                                <div class="dm-modal__actions">
                                    <button type="button" class="dm-button dm-button--dark">
                                        ${isEdit ? `${cta} ${arrowIcon}` : `${plusIcon} ${cta}`}
                                    </button>
                                </div>
                            </div>
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
