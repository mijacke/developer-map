import { MEDIA, DRAW_VIEWBOX } from '../constants.js';
import { escapeHtml } from '../utils/html.js';

export function renderModal(state, data) {
    if (!state.modal) return '';
    const { type, payload } = state.modal;
    switch (type) {
        case 'add-map':
            return renderFormModal('Pridať mapu', 'Pridať mapu', data, null, state.modal);
        case 'edit-map':
            return renderFormModal('Upraviť mapu', 'Uložiť zmeny', data, payload, state.modal);
        case 'delete-map':
            return renderConfirmModal(state);
        case 'draw-coordinates':
            return renderDrawModal(state, data);
        case 'add-location':
            return renderFormModal('Pridať lokalitu', 'Pridať lokalitu', data, payload ?? null, state.modal);
        case 'add-type':
            return renderTypeModal('Pridať typ', 'Pridať typ', data, null, state.modal);
        case 'edit-type':
            return renderTypeModal('Upraviť typ', 'Uložiť zmeny', data, payload, state.modal);
        case 'delete-type':
            return renderConfirmModal(state);
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

function renderFormModal(title, cta, data, itemId = null, modalState = null) {
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    const infoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    const isEdit = title === 'Upraviť mapu';
    const headerIcon = isEdit ? arrowIcon : plusIcon;
    
    // Zisti položku, ktorú upravujeme (project alebo floor)
    let editItem = null;
    let editParent = null;
    let editType = null;
    const projects = Array.isArray(data.projects) ? data.projects : [];

    if (itemId && projects.length) {
        editItem = projects.find((project) => project.id === itemId) ?? null;
        if (editItem) {
            editType = 'project';
        } else {
            for (const project of projects) {
                const floor = project.floors?.find((f) => f.id === itemId);
                if (floor) {
                    editItem = floor;
                    editParent = project;
                    editType = 'floor';
                    break;
                }
            }
        }
    }

    const selectedPreview = modalState?.imagePreview ?? null;
    let imageUrl = selectedPreview || (editItem?.image ?? null);
    if (!imageUrl && isEdit) {
        imageUrl = editType === 'floor' ? MEDIA.floor : MEDIA.building;
    }

    const uploadLabel = isEdit ? 'Zmeniť obrázok' : 'Nahrať obrázok';

    const targetContext = modalState?.targetType ?? editType ?? 'project';
    const canChangeParent = !isEdit || targetContext === 'floor';
    const parentSelectAttrs = canChangeParent ? '' : ' disabled aria-disabled="true"';

    const resolvedParentValue = (() => {
        if (modalState && Object.prototype.hasOwnProperty.call(modalState, 'parentId')) {
            if (modalState.parentId === null || modalState.parentId === undefined || modalState.parentId === '') {
                return 'none';
            }
            return String(modalState.parentId);
        }
        if (editType === 'floor' && editParent) {
            return String(editParent.id);
        }
        return 'none';
    })();

    const parentOptions = projects
        .map((project) => {
            const value = String(project.id);
            const isSelected = resolvedParentValue === value;
            return `<option value="${escapeHtml(value)}"${isSelected ? ' selected' : ''}>${escapeHtml(project.name)}</option>`;
        })
        .join('');

    const placeholderSelected = resolvedParentValue === '' ? ' selected' : '';
    const noneSelected = resolvedParentValue === 'none' ? ' selected' : '';

    const resolvedName = editItem?.name ?? '';

    const typeOptionsSource = Array.isArray(data.types) ? data.types : [];
    const resolvedType = editItem?.type ?? '';
    const resolvedTypeInList = resolvedType
        ? typeOptionsSource.some((option) => option.label === resolvedType)
        : false;
    const selectTypeValue = resolvedTypeInList ? resolvedType : '';
    const typePlaceholderSelected = selectTypeValue ? '' : ' selected';
    const typePlaceholderLabel = typeOptionsSource.length
        ? 'Vyberte typ'
        : 'Najprv pridajte typ v nastaveniach';
    const typeOptions = typeOptionsSource
        .map((option) => {
            const value = option.label;
            const isSelected = selectTypeValue === value;
            return `<option value="${escapeHtml(value)}"${isSelected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`;
        })
        .join('');
    
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
                <div class="dm-modal__body">
                    <form class="dm-modal__form">
                        <div class="dm-modal__form-layout">
                            <div class="dm-upload-card">
                                ${imageUrl ? `
                                    <div class="dm-upload-card__preview">
                                        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(resolvedName || 'Obrázok mapy')}" />
                                    </div>
                                ` : `
                                    <div class="dm-upload-card__dropzone">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#5a3bff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg>
                                    </div>
                                `}
                                <label for="dm-modal-upload" class="dm-upload-card__footer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                                    <p>${uploadLabel}</p>
                                </label>
                                <input id="dm-modal-upload" type="file" accept="image/*" class="dm-upload-card__input" />
                            </div>
                            <div class="dm-modal__form-fields">
                                <div class="dm-form__grid">
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Vyberte nadradenú mapu" data-tooltip="Vyberte nadradenú mapu">${infoIcon}</button>
                                            <select required autocomplete="off" class="dm-field__input" data-dm-select data-dm-field="parent"${parentSelectAttrs}>
                                                <option value="" disabled${placeholderSelected} hidden>${escapeHtml('Vyberte nadradenú')}</option>
                                                <option value="none"${noneSelected}>Žiadna</option>
                                                ${parentOptions}
                                            </select>
                                            <label class="dm-field__label">Nadradená<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Typ nehnuteľnosti alebo objektu" data-tooltip="Typ nehnuteľnosti alebo objektu">${infoIcon}</button>
                                            <select required autocomplete="off" class="dm-field__input" data-dm-select data-dm-field="map-type">
                                                <option value="" disabled${typePlaceholderSelected} hidden>${escapeHtml(typePlaceholderLabel)}</option>
                                                ${typeOptions}
                                            </select>
                                            <label class="dm-field__label">Typ<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Názov mapy alebo lokality" data-tooltip="Názov mapy alebo lokality">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input" data-dm-field="name" value="${escapeHtml(resolvedName)}">
                                            <label class="dm-field__label">Názov<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Minimálne možné oddialenie mapy" data-tooltip="Minimálne možné oddialenie mapy">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Minimálny zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Maximálne možné priblíženie mapy" data-tooltip="Maximálne možné priblíženie mapy">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Maximálny zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Východzie priblíženie mapy pri načítaní" data-tooltip="Východzie priblíženie mapy pri načítaní">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Východzí zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Šírka obrázku mapy v pixeloch" data-tooltip="Šírka obrázku mapy v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Šírka mapy<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Výška obrázku mapy v pixeloch" data-tooltip="Výška obrázku mapy v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Výška mapy<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Šírka čiary ohraničenia lokality v pixeloch" data-tooltip="Šírka čiary ohraničenia lokality v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" min="1" max="10" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Hrúbka ohraničenia<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Priehľadnosť čiary ohraničenia (0-100%)" data-tooltip="Priehľadnosť čiary ohraničenia (0-100%)">${infoIcon}</button>
                                            <input required type="number" step="1" min="0" max="100" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Prehľadnosť ohraničenia<span class="dm-field__required">*</span></label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Priehľadnosť výplne lokality (0-100%)" data-tooltip="Priehľadnosť výplne lokality (0-100%)">${infoIcon}</button>
                                            <input required type="number" step="1" min="0" max="100" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Prehľadnosť pozadia<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Smer orientácie objektu" data-tooltip="Smer orientácie objektu">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Smer<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Uhol natočenia objektu v stupňoch" data-tooltip="Uhol natočenia objektu v stupňoch">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input">
                                            <label class="dm-field__label">Uhol<span class="dm-field__required">*</span></label>
                                        </div>
                                    </div>
                                </div>
                                <div class="dm-modal__actions">
                                    <button type="button" class="dm-button dm-button--dark" data-dm-modal-save>
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

function renderTypeModal(title, cta, data, itemId = null, modalState = null) {
    const saveIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>';
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    const types = Array.isArray(data.types) ? data.types : [];
    const targetId = itemId || modalState?.payload || '';
    const editItem = targetId ? types.find((type) => String(type.id) === String(targetId)) ?? null : null;
    const typeId = editItem?.id ?? targetId ?? '';

    const defaultColor = '#7c3aed';
    const nameValue = modalState?.name ?? modalState?.itemName ?? editItem?.label ?? '';
    const colorValue = modalState?.color ?? editItem?.color ?? defaultColor;
    const hexValue = typeof colorValue === 'string' && colorValue.startsWith('#') ? colorValue : `#${String(colorValue || '').replace(/^#+/, '')}`;

    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>${title}</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">
                    <form class="dm-form" data-dm-type-form${typeId ? ` data-dm-type-id="${escapeHtml(typeId)}"` : ''}>
                        <div class="dm-field">
                            <input 
                                required 
                                type="text" 
                                autocomplete="off" 
                                class="dm-field__input"
                                value="${escapeHtml(nameValue)}"
                                data-dm-type-name
                            />
                            <label class="dm-field__label">Názov typu<span class="dm-field__required">*</span></label>
                        </div>
                        <div class="dm-field">
                            <input 
                                type="color" 
                                value="${escapeHtml(hexValue)}" 
                                autocomplete="off"
                                class="dm-field__input dm-field__input--color"
                                data-dm-type-color
                                required
                            />
                            <label class="dm-field__label">Farba</label>
                        </div>
                        <div class="dm-field">
                            <input 
                                type="text" 
                                value="${escapeHtml(hexValue)}"
                                autocomplete="off"
                                class="dm-field__input"
                                data-dm-type-hex
                                required
                            />
                            <label class="dm-field__label">HEX kód<span class="dm-field__required">*</span></label>
                        </div>
                    </form>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Zrušiť</button>
                    <button class="dm-button dm-button--dark" data-dm-modal-save>
                        <span class="dm-button__icon" aria-hidden="true">${editItem ? saveIcon : plusIcon}</span>
                        ${cta}
                    </button>
                </footer>
            </div>
        </div>
    `;
}

function renderConfirmModal(state) {
    const itemName = state?.modal?.itemName || 'túto položku';
    const deleteKind = state?.modal?.type === 'delete-type' ? 'type' : state?.modal?.type === 'delete-map' ? 'map' : '';
    const deleteTarget = state?.modal?.payload ?? '';
    const confirmAttributes = deleteKind
        ? ` data-dm-delete-kind="${escapeHtml(deleteKind)}" data-dm-delete-target="${escapeHtml(String(deleteTarget))}"`
        : '';
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>Ste si istý?</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>&times;</button>
                </header>
                <div class="dm-modal__body">
                    <p>Naozaj chcete vymazať <strong>${escapeHtml(itemName)}</strong>?</p>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split">
                    <button class="dm-button dm-button--outline" data-dm-close-modal>Zrušiť</button>
                    <button class="dm-button dm-button--dark" data-dm-confirm-delete${confirmAttributes}>Vymazať</button>
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
            <div class="dm-field">
                <input required type="text" autocomplete="off" class="dm-field__input" />
                <label class="dm-field__label">${placeholder}</label>
            </div>
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
                        <div class="dm-field">
                            <input 
                                type="color" 
                                value="${escapeHtml(color.value)}" 
                                data-dm-color-input="${escapeHtml(color.id)}"
                                autocomplete="off"
                                class="dm-field__input dm-field__input--color"
                                required
                            />
                            <label class="dm-field__label">${escapeHtml(color.label)}</label>
                        </div>
                        <div class="dm-field">
                            <input 
                                type="text" 
                                value="${escapeHtml(color.value)}" 
                                data-dm-color-text="${escapeHtml(color.id)}"
                                autocomplete="off"
                                class="dm-field__input"
                                required
                            />
                            <label class="dm-field__label">HEX kód</label>
                        </div>
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
