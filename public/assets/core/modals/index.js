import { DRAW_VIEWBOX } from '../constants.js';
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
            return renderLocationModal('Pridať lokalitu', 'Pridať lokalitu', data, null, state.modal);
        case 'edit-location':
            return renderLocationModal('Upraviť lokalitu', 'Uložiť zmeny', data, payload, state.modal);
        case 'add-type':
            return renderTypeModal('Pridať typ', 'Pridať typ', data, null, state.modal);
        case 'edit-type':
            return renderTypeModal('Upraviť typ', 'Uložiť zmeny', data, payload, state.modal);
        case 'delete-type':
            return renderConfirmModal(state);
        case 'add-status':
            return renderStatusModal('Pridať stav', 'Pridať stav', data, null, state.modal);
        case 'edit-status':
            return renderStatusModal('Upraviť stav', 'Uložiť zmeny', data, payload, state.modal);
        case 'delete-status':
            return renderConfirmModal(state);
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

    const imageSelection = modalState?.imageSelection ?? null;
    const selectedPreview = imageSelection?.url ?? modalState?.imagePreview ?? null;
    let imageUrl = selectedPreview || (editItem?.image ?? editItem?.imageUrl ?? null);
    if (!imageUrl && isEdit) {
        imageUrl = '';
    }

    const uploadLabel = isEdit ? 'Zmeniť obrázok' : 'Nahrať obrázok';

    const resolvedName = editItem?.name ?? '';
    const selectionId = imageSelection?.id ?? editItem?.image_id ?? '';
    const selectionAlt = imageSelection?.alt ?? editItem?.imageAlt ?? (resolvedName || '');

    const targetContext = modalState?.targetType ?? editType ?? 'project';
    const canChangeParent = !isEdit || targetContext === 'floor';
    const parentSelectAttrs = canChangeParent ? '' : ' disabled aria-disabled="true"';

    const resolvedParentValue = (() => {
        const hasParentProp = modalState && Object.prototype.hasOwnProperty.call(modalState, 'parentId');
        if (hasParentProp) {
            const stateParent = modalState.parentId;
            if (stateParent === null || stateParent === undefined || stateParent === '') {
                return modalState?.type === 'add-map' ? '' : 'none';
            }
            return String(stateParent);
        }
        if (!isEdit) {
            return '';
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
            <div class="dm-modal dm-modal--map">
                <header class="dm-modal__header">
                    <div class="dm-modal__header-left">
                        ${headerIcon}
                        <h2>${title}</h2>
                    </div>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
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
                                <button type="button" class="dm-upload-card__footer" data-dm-media-trigger>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                                    <p>${uploadLabel}</p>
                                </button>
                                <input type="hidden" data-dm-media-id value="${selectionId ? escapeHtml(String(selectionId)) : ''}">
                                <input type="hidden" data-dm-media-alt value="${escapeHtml(selectionAlt)}">
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
                                            <input required type="text" autocomplete="off" class="dm-field__input" data-dm-field="name" placeholder=" " value="${escapeHtml(resolvedName)}">
                                            <label class="dm-field__label">Názov<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Minimálne možné oddialenie mapy" data-tooltip="Minimálne možné oddialenie mapy">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Minimálny zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Maximálne možné priblíženie mapy" data-tooltip="Maximálne možné priblíženie mapy">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Maximálny zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Východzie priblíženie mapy pri načítaní" data-tooltip="Východzie priblíženie mapy pri načítaní">${infoIcon}</button>
                                            <input required type="number" step="0.1" min="0.1" max="5.0" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Východzí zoom<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Šírka obrázku mapy v pixeloch" data-tooltip="Šírka obrázku mapy v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Šírka mapy<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Výška obrázku mapy v pixeloch" data-tooltip="Výška obrázku mapy v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Výška mapy<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Šírka čiary ohraničenia lokality v pixeloch" data-tooltip="Šírka čiary ohraničenia lokality v pixeloch">${infoIcon}</button>
                                            <input required type="number" step="1" min="1" max="10" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Hrúbka ohraničenia<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Priehľadnosť čiary ohraničenia (0-100%)" data-tooltip="Priehľadnosť čiary ohraničenia (0-100%)">${infoIcon}</button>
                                            <input required type="number" step="1" min="0" max="100" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Prehľadnosť ohraničenia<span class="dm-field__required">*</span></label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Priehľadnosť výplne lokality (0-100%)" data-tooltip="Priehľadnosť výplne lokality (0-100%)">${infoIcon}</button>
                                            <input required type="number" step="1" min="0" max="100" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Prehľadnosť pozadia<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Smer orientácie objektu" data-tooltip="Smer orientácie objektu">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input" placeholder=" ">
                                            <label class="dm-field__label">Smer<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Uhol natočenia objektu v stupňoch" data-tooltip="Uhol natočenia objektu v stupňoch">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input" placeholder=" ">
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

function renderLocationModal(title, cta, data, itemId = null, modalState = null) {
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    const infoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    const isEdit = title.includes('Upraviť');
    const headerIcon = isEdit ? arrowIcon : plusIcon;
    
    // Find the location being edited
    let editLocation = null;
    let editParent = null;
    const projects = Array.isArray(data.projects) ? data.projects : [];

    if (itemId && projects.length) {
        for (const project of projects) {
            const floor = project.floors?.find((f) => f.id === itemId);
            if (floor) {
                editLocation = floor;
                editParent = project;
                break;
            }
        }
    }

    const nameValue = editLocation?.name ?? '';
    const imageSelection = modalState?.imageSelection ?? null;
    const selectedPreview = imageSelection?.url ?? modalState?.imagePreview ?? null;
    let imageUrl = selectedPreview || (editLocation?.image ?? editLocation?.imageUrl ?? null);
    if (!imageUrl && isEdit) {
        imageUrl = '';
    }

    const uploadLabel = isEdit ? 'Zmeniť obrázok' : 'Nahrať obrázok';
    const selectionId = imageSelection?.id ?? editLocation?.image_id ?? '';
    const selectionAlt = imageSelection?.alt ?? editLocation?.imageAlt ?? (nameValue || '');

    // Parent project select
    const parentValue = modalState?.parentId ?? (editParent ? String(editParent.id) : '');
    const parentOptions = projects
        .map((project) => {
            const value = String(project.id);
            const isSelected = parentValue === value;
            return `<option value="${escapeHtml(value)}"${isSelected ? ' selected' : ''}>${escapeHtml(project.name)}</option>`;
        })
        .join('');
    const parentPlaceholderSelected = parentValue === '' ? ' selected' : '';

    // Type select
    const typeOptionsSource = Array.isArray(data.types) ? data.types : [];
    const resolvedType = editLocation?.type ?? '';
    const resolvedTypeInList = resolvedType ? typeOptionsSource.some((option) => option.label === resolvedType) : false;
    const selectTypeValue = resolvedTypeInList ? resolvedType : '';
    const typePlaceholderSelected = selectTypeValue ? '' : ' selected';
    const typePlaceholderLabel = typeOptionsSource.length ? 'Vyberte typ' : 'Najprv pridajte typ v nastaveniach';
    const typeOptions = typeOptionsSource
        .map((option) => {
            const value = option.label;
            const isSelected = selectTypeValue === value;
            return `<option value="${escapeHtml(value)}"${isSelected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`;
        })
        .join('');

    // Status select
    const statusOptionsSource = Array.isArray(data.statuses) ? data.statuses : [];
    const statusIdFromState = modalState?.statusId ?? null;
    const statusLabelFromState = modalState?.status ?? '';
    const locationStatusId = editLocation?.statusId ?? null;
    const locationStatusLabel = editLocation?.status ?? editLocation?.statusLabel ?? '';
    const matchedStatus = (() => {
        const targetId = statusIdFromState ?? locationStatusId;
        if (targetId) {
            return statusOptionsSource.find((option) => String(option.id) === String(targetId)) ?? null;
        }
        if (statusLabelFromState) {
            return statusOptionsSource.find((option) => option.label === statusLabelFromState) ?? null;
        }
        if (locationStatusLabel) {
            return statusOptionsSource.find((option) => option.label === locationStatusLabel) ?? null;
        }
        return null;
    })();
    const resolvedStatusLabel = statusLabelFromState || matchedStatus?.label || locationStatusLabel;
    const resolvedStatusInList = resolvedStatusLabel ? statusOptionsSource.some((option) => option.label === resolvedStatusLabel) : false;
    const selectStatusValue = resolvedStatusInList ? resolvedStatusLabel : '';
    const statusPlaceholderSelected = selectStatusValue ? '' : ' selected';
    const statusPlaceholderLabel = statusOptionsSource.length ? 'Vyberte stav' : 'Najprv pridajte stav v nastaveniach';
    const statusOptions = statusOptionsSource
        .map((option) => {
            const value = option.label;
            const isSelected = selectStatusValue === value;
            return `<option value="${escapeHtml(value)}" data-status-id="${escapeHtml(String(option.id))}"${isSelected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`;
        })
        .join('');

    // Field values - always set, even if empty (like in renderFormModal)
    const urlValue = editLocation?.url ?? '';
    const areaValue = editLocation?.area ?? '';
    const suffixValue = editLocation?.suffix ?? '';
    const prefixValue = editLocation?.prefix ?? '';
    const designationValue = editLocation?.designation ?? editLocation?.label ?? '';
    const priceValue = editLocation?.price ?? editLocation?.rent ?? '';
    const rentValue = editLocation?.rent ?? editLocation?.price ?? '';

    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--location">
                <header class="dm-modal__header">
                    <div class="dm-modal__header-left">
                        ${headerIcon}
                        <h2>${title}</h2>
                    </div>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
                </header>
                <div class="dm-modal__body">
                    <form class="dm-modal__form">
                        <div class="dm-modal__form-layout">
                            <div class="dm-upload-card">
                                ${imageUrl ? `
                                    <div class="dm-upload-card__preview">
                                        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(nameValue || 'Obrázok lokality')}" />
                                    </div>
                                ` : `
                                    <div class="dm-upload-card__dropzone">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#5a3bff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg>
                                    </div>
                                `}
                                <button type="button" class="dm-upload-card__footer" data-dm-media-trigger>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                                    <p>${uploadLabel}</p>
                                </button>
                                <input type="hidden" data-dm-media-id value="${selectionId ? escapeHtml(String(selectionId)) : ''}">
                                <input type="hidden" data-dm-media-alt value="${escapeHtml(selectionAlt)}">
                            </div>
                            <div class="dm-modal__form-fields">
                                <div class="dm-form__grid">
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Vyberte nadradenú mapu" data-tooltip="Vyberte nadradenú mapu">${infoIcon}</button>
                                            <select required autocomplete="off" class="dm-field__input" data-dm-select data-dm-field="parent">
                                                <option value="" disabled${parentPlaceholderSelected} hidden>Vyberte nadradenú</option>
                                                ${parentOptions}
                                            </select>
                                            <label class="dm-field__label">Nadradená<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Typ nehnuteľnosti alebo objektu" data-tooltip="Typ nehnuteľnosti alebo objektu">${infoIcon}</button>
                                            <select required autocomplete="off" class="dm-field__input" data-dm-select data-dm-field="location-type">
                                                <option value="" disabled${typePlaceholderSelected} hidden>${escapeHtml(typePlaceholderLabel)}</option>
                                                ${typeOptions}
                                            </select>
                                            <label class="dm-field__label">Typ<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Názov lokality" data-tooltip="Názov lokality">${infoIcon}</button>
                                            <input required type="text" autocomplete="off" class="dm-field__input" data-dm-field="name" placeholder=" " value="${escapeHtml(nameValue)}">
                                            <label class="dm-field__label">Názov<span class="dm-field__required">*</span></label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Označenie lokality" data-tooltip="Označenie lokality">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="designation" placeholder=" " value="${escapeHtml(designationValue)}">
                                            <label class="dm-field__label">Označenie</label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="URL lokality" data-tooltip="URL lokality">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="url" placeholder=" " value="${escapeHtml(urlValue)}">
                                            <label class="dm-field__label">URL</label>
                                        </div>
                                        <div class="dm-field dm-field--with-unit" data-unit="m²">
                                            <button type="button" class="dm-field__info" aria-label="Rozloha lokality v m²" data-tooltip="Rozloha lokality v m²">${infoIcon}</button>
                                            <input type="number" step="0.01" autocomplete="off" class="dm-field__input" data-dm-field="area" placeholder=" " value="${escapeHtml(areaValue)}">
                                            <label class="dm-field__label">Rozloha (m²)</label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Prefix lokality" data-tooltip="Prefix lokality">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="prefix" placeholder=" " value="${escapeHtml(prefixValue)}">
                                            <label class="dm-field__label">Prefix</label>
                                        </div>
                                        <div class="dm-field dm-field--with-unit" data-unit="€">
                                            <button type="button" class="dm-field__info" aria-label="Cena v €" data-tooltip="Cena v €">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="price" placeholder=" " value="${escapeHtml(priceValue)}">
                                            <label class="dm-field__label">Cena (€)</label>
                                        </div>
                                    </div>
                                    <div class="dm-form__column">
                                        <div class="dm-field dm-field--with-unit" data-unit="€">
                                            <button type="button" class="dm-field__info" aria-label="Prenájom v €" data-tooltip="Prenájom v €">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="rent" placeholder=" " value="${escapeHtml(rentValue)}">
                                            <label class="dm-field__label">Prenájom (€)</label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Suffix pre rozlohu" data-tooltip="Suffix pre rozlohu">${infoIcon}</button>
                                            <input type="text" autocomplete="off" class="dm-field__input" data-dm-field="suffix" placeholder=" " value="${escapeHtml(suffixValue)}">
                                            <label class="dm-field__label">Suffix</label>
                                        </div>
                                        <div class="dm-field">
                                            <button type="button" class="dm-field__info" aria-label="Stav lokality" data-tooltip="Stav lokality">${infoIcon}</button>
                                            <select required autocomplete="off" class="dm-field__input" data-dm-select data-dm-field="location-status">
                                                <option value="" disabled${statusPlaceholderSelected} hidden>${escapeHtml(statusPlaceholderLabel)}</option>
                                                ${statusOptions}
                                            </select>
                                            <label class="dm-field__label">Stav<span class="dm-field__required">*</span></label>
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
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
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

function renderStatusModal(title, cta, data, itemId = null, modalState = null) {
    const saveIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>';
    const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
    const statuses = Array.isArray(data.statuses) ? data.statuses : [];
    const targetId = itemId || modalState?.payload || '';
    const editItem = targetId ? statuses.find((status) => String(status.id) === String(targetId)) ?? null : null;
    const statusId = editItem?.id ?? targetId ?? '';

    const defaultColor = '#22c55e';
    const nameValue = modalState?.name ?? modalState?.itemName ?? editItem?.label ?? '';
    const colorValue = modalState?.color ?? editItem?.color ?? defaultColor;
    const hexValue = typeof colorValue === 'string' && colorValue.startsWith('#') ? colorValue : `#${String(colorValue || '').replace(/^#+/, '')}`;

    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>${title}</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
                </header>
                <div class="dm-modal__body">
                    <form class="dm-form" data-dm-status-form${statusId ? ` data-dm-status-id="${escapeHtml(statusId)}"` : ''}>
                        <div class="dm-field">
                            <input 
                                required 
                                type="text" 
                                autocomplete="off" 
                                class="dm-field__input"
                                value="${escapeHtml(nameValue)}"
                                data-dm-status-name
                            />
                            <label class="dm-field__label">Názov stavu<span class="dm-field__required">*</span></label>
                        </div>
                        <div class="dm-field">
                            <input 
                                type="color" 
                                value="${escapeHtml(hexValue)}" 
                                autocomplete="off"
                                class="dm-field__input dm-field__input--color"
                                data-dm-status-color
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
                                data-dm-status-hex
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
    const deleteKind = state?.modal?.type === 'delete-type' ? 'type' : state?.modal?.type === 'delete-status' ? 'status' : state?.modal?.type === 'delete-map' ? 'map' : '';
    const deleteTarget = state?.modal?.payload ?? '';
    const confirmAttributes = deleteKind
        ? ` data-dm-delete-kind="${escapeHtml(deleteKind)}" data-dm-delete-target="${escapeHtml(String(deleteTarget))}"`
        : '';
    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--narrow">
                <header class="dm-modal__header">
                    <h2>Ste si istý?</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
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
    const projects = Array.isArray(data.projects) ? data.projects : [];

    if (!projects.length) {
        return renderSimpleModal('Nakresliť súradnice', '<p>Najprv pridajte mapu alebo lokalitu.</p>');
    }

    let activeProject = projects[0];
    let activeFloor = null;
    let contextType = 'project';

    for (const project of projects) {
        if (String(project.id) === String(payload)) {
            activeProject = project;
            contextType = 'project';
            activeFloor = null;
            break;
        }
        const floors = Array.isArray(project?.floors) ? project.floors : [];
        const foundFloor = floors.find((floor) => String(floor.id) === String(payload));
        if (foundFloor) {
            activeProject = project;
            activeFloor = foundFloor;
            contextType = 'floor';
            break;
        }
    }

    if (contextType === 'floor' && !activeFloor && activeProject?.floors?.length) {
        activeFloor = activeProject.floors[0];
    }

    const regionOwner = contextType === 'floor' ? activeFloor : activeProject;

    const rendererSizeSource =
        regionOwner && typeof regionOwner === 'object' && regionOwner.renderer && typeof regionOwner.renderer === 'object'
            ? regionOwner.renderer.size
            : activeProject && typeof activeProject === 'object' && activeProject.renderer && typeof activeProject.renderer === 'object'
                ? activeProject.renderer.size
                : null;

    const sanitiseViewboxDimension = (value) => {
        const num = Number(value);
        return Number.isFinite(num) && num > 0 ? num : null;
    };

    const sanitiseZoomValue = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) {
            return null;
        }
        return Math.min(1.5, Math.max(0.35, num));
    };

    const initialViewboxWidth = sanitiseViewboxDimension(rendererSizeSource?.width);
    const initialViewboxHeight = sanitiseViewboxDimension(rendererSizeSource?.height);
    const defaultViewboxWidth = initialViewboxWidth ?? DRAW_VIEWBOX.width;
    const defaultViewboxHeight = initialViewboxHeight ?? DRAW_VIEWBOX.height;
    const initialZoom = sanitiseZoomValue(
        state?.modal?.zoom ?? regionOwner?.renderer?.zoom ?? activeProject?.renderer?.zoom ?? null,
    ) ?? 0.65;

    const regions = Array.isArray(regionOwner?.regions) ? regionOwner.regions : [];
    const floorsForChildren = Array.isArray(activeProject?.floors) ? activeProject.floors : [];

    const surfaceLabel =
        contextType === 'floor'
            ? activeFloor?.name ?? 'Lokalita'
            : activeProject?.name ?? activeProject?.title ?? 'Mapa projektu';
    const projectBadge = activeProject && typeof activeProject.badge === 'string' ? activeProject.badge : 'A';
    const badgeLabel = projectBadge.trim().slice(0, 2).toUpperCase() || 'A';

    const npSorted =
        contextType === 'project'
            ? floorsForChildren
                  .filter((floor) => /NP$/i.test(floor.label ?? ''))
                  .sort((a, b) => {
                      const aNum = parseInt(String(a.label).replace(/\D/g, ''), 10) || 0;
                      const bNum = parseInt(String(b.label).replace(/\D/g, ''), 10) || 0;
                      return bNum - aNum;
                  })
            : [];
    const npLabels = (npSorted.length > 4 ? npSorted.slice(1, 5) : npSorted.slice(0, 4)).map((floor) => floor.label);
    const ppLabel =
        contextType === 'project'
            ? floorsForChildren.find((floor) => /PP$/i.test(floor.label ?? ''))?.label
            : null;
    const levelLabels =
        contextType === 'project'
            ? Array.from(new Set(ppLabel ? [...npLabels, ppLabel] : npLabels))
            : [];

    const statusOptionsSource = Array.isArray(data.statuses) ? data.statuses : [];

    const activeRegionId = state.modal?.regionId ?? (regions[0]?.id ? String(regions[0].id) : null);
    const activeRegion = activeRegionId
        ? regions.find((region) => String(region.id) === String(activeRegionId)) ?? regions[0] ?? null
        : regions[0] ?? null;

    const resolveStatusLabel = (region) => {
        const statusKey = String(region?.statusId ?? region?.status ?? '');
        if (!statusKey) {
            return '';
        }
        const match =
            statusOptionsSource.find((status) => String(status.id) === statusKey) ??
            statusOptionsSource.find((status) => String(status.key) === statusKey);
        return match?.label ?? region?.statusLabel ?? '';
    };

    const regionChildrenValues = Array.isArray(activeRegion?.children)
        ? activeRegion.children.map((id) => String(id))
        : [];

    const regionListMarkup = regions.length
        ? regions
              .map((region, index) => {
                  const id = String(region.id ?? region.lotId ?? `region-${index + 1}`);
                  const isActive = activeRegion
                      ? String(activeRegion.id ?? '') === id
                      : index === 0 && !activeRegionId;
                  const label = region.label ?? region.name ?? `Zóna ${index + 1}`;
                  const statusLabel = resolveStatusLabel(region);
                  const childCount = Array.isArray(region.children) ? region.children.length : 0;
                  const childMeta = childCount
                      ? `<span class="dm-draw__region-meta"><span class="dm-draw__region-meta-badge">${childCount}</span><span>prepojené</span></span>`
                      : '';
                  return `
                        <li class="dm-draw__region-item${isActive ? ' is-active' : ''}" data-dm-region-item="${escapeHtml(id)}">
                            <button type="button" class="dm-draw__region-button" data-dm-region-trigger="${escapeHtml(id)}">
                                <span class="dm-draw__region-index">${index + 1}.</span>
                                <span class="dm-draw__region-name">${escapeHtml(label)}</span>
                                ${statusLabel ? `<span class="dm-draw__region-status">${escapeHtml(statusLabel)}</span>` : ''}
                                ${childMeta}
                            </button>
                        </li>
                    `;
              })
              .join('')
        : `
                <li class="dm-draw__region-item dm-draw__region-item--empty">
                    <span>Žiadne zóny zatiaľ nevytvorené.</span>
                </li>
            `;

    const regionNameValue = activeRegion?.label ?? activeRegion?.name ?? '';
    const regionStatusValue = String(activeRegion?.statusId ?? activeRegion?.status ?? '');
    const hasStatuses = statusOptionsSource.length > 0;
    const statusPlaceholderLabel = hasStatuses ? 'Vyberte stav' : 'Najprv pridajte stav v nastaveniach';
    const statusPlaceholderSelected = regionStatusValue ? '' : ' selected';
    const statusSelectDisabledAttr = hasStatuses ? '' : ' disabled aria-disabled="true"';
    const statusOptions = statusOptionsSource
        .map((status) => {
            const value = String(status.id ?? status.key ?? '');
            if (!value) {
                return '';
            }
            const isSelected = value === regionStatusValue;
            return `<option value="${escapeHtml(value)}"${isSelected ? ' selected' : ''}>${escapeHtml(
                status.label ?? value,
            )}</option>`;
        })
        .filter(Boolean)
        .join('');

    const childSelectorMarkup =
        contextType === 'project' && floorsForChildren.length
            ? `
                <fieldset class="dm-draw__children" data-dm-region-children>
                    <legend>Naviazané lokality</legend>
                    <div class="dm-draw__children-list">
                        ${floorsForChildren
                            .map((floor) => {
                                const value = String(floor.id);
                                const checked = regionChildrenValues.includes(value) ? ' checked' : '';
                                return `
                                    <label class="dm-draw__child-option">
                                        <input type="checkbox" data-dm-region-child value="${escapeHtml(value)}"${checked}>
                                        <span>${escapeHtml(floor.name ?? value)}</span>
                                    </label>
                                `;
                            })
                            .join('')}
                    </div>
                </fieldset>
            `
            : contextType === 'project'
                ? `<p class="dm-draw__child-empty">Zóny môžete prepojiť s poschodiami projektu.</p>`
                : '';

    const canRemoveRegion = regions.length > 1;
    const backgroundImage =
        contextType === 'floor'
            ? activeFloor?.image ?? activeFloor?.imageUrl ?? activeFloor?.imageurl ?? ''
            : activeProject?.image ?? activeProject?.imageUrl ?? activeProject?.imageurl ?? '';
    const backgroundAlt = surfaceLabel ? `${surfaceLabel} - podklad mapy` : 'Podklad mapy';

    return `
        <div class="dm-modal-overlay">
            <div class="dm-modal dm-modal--draw">
                <header class="dm-modal__header dm-modal__header--center">
                    <h2>Nakresliť súradnice</h2>
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
                </header>
                <div class="dm-modal__body dm-modal__body--draw">
                    <div
                        class="dm-draw"
                        data-dm-draw-root
                        data-dm-owner="${escapeHtml(contextType)}"
                        data-dm-owner-id="${escapeHtml(
                            contextType === 'floor'
                                ? activeFloor?.id ?? ''
                                : activeProject?.id ?? '',
                        )}"
                        data-dm-project-id="${escapeHtml(activeProject?.id ?? '')}"
                        data-dm-floor-name="${escapeHtml(surfaceLabel)}"
                        data-dm-active-region="${activeRegion ? escapeHtml(String(activeRegion.id)) : ''}"
                        data-dm-viewbox-width="${initialViewboxWidth ? escapeHtml(String(initialViewboxWidth)) : ''}"
                        data-dm-viewbox-height="${initialViewboxHeight ? escapeHtml(String(initialViewboxHeight)) : ''}"
                        data-dm-zoom="${escapeHtml(String(initialZoom))}"
                    >
                        <div class="dm-draw__layout">
                            <aside class="dm-draw__aside">
                                <div class="dm-draw__aside-header">
                                    <h3>Segmenty mapy</h3>
                                    <button type="button" class="dm-button dm-button--outline dm-draw__add-region" data-dm-add-region>+ Pridať zónu</button>
                                </div>
                                <ul class="dm-draw__regions" data-dm-region-list>
                                    ${regionListMarkup}
                                </ul>
                                <div class="dm-draw__region-form" data-dm-region-form>
                                    <div class="dm-field">
                                        <input type="text" autocomplete="off" class="dm-field__input" data-dm-region-name placeholder=" " value="${escapeHtml(regionNameValue)}">
                                        <label class="dm-field__label">Názov zóny</label>
                                    </div>
                                    <div class="dm-field">
                                        <select class="dm-field__input" data-dm-region-status${statusSelectDisabledAttr}>
                                            <option value="" disabled${statusPlaceholderSelected} hidden>${escapeHtml(statusPlaceholderLabel)}</option>
                                            ${statusOptions}
                                        </select>
                                        <label class="dm-field__label">Stav zóny</label>
                                    </div>
                                    ${childSelectorMarkup}
                                    <button type="button" class="dm-button dm-button--outline dm-draw__remove-region" data-dm-remove-region${canRemoveRegion ? '' : ' disabled aria-disabled="true"'}>Odstrániť zónu</button>
                                </div>
                            </aside>
                            <div class="dm-draw__main">
                                <div class="dm-draw__stage">
                            <img src="${escapeHtml(backgroundImage)}" alt="${escapeHtml(backgroundAlt)}" class="dm-draw__image" draggable="false" />
                            <svg class="dm-draw__overlay" viewBox="0 0 ${escapeHtml(String(defaultViewboxWidth))} ${escapeHtml(String(defaultViewboxHeight))}" preserveAspectRatio="xMidYMid meet" data-role="overlay">
                                <polygon class="dm-draw__shape-fill" data-role="fill" points=""></polygon>
                                <polyline class="dm-draw__shape-outline" data-role="outline" points=""></polyline>
                                <polyline class="dm-draw__shape-baseline" data-role="baseline" points=""></polyline>
                                <g class="dm-draw__handles" data-role="handles"></g>
                            </svg>
                            <div class="dm-draw__badge">${escapeHtml(badgeLabel)}</div>
                            <div class="dm-draw__cursor" aria-hidden="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="currentColor"/></svg>
                            </div>
                            ${levelLabels.length ? `
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
                            </ul>` : ''}
                        </div>
                        <div class="dm-draw__toolbar">
                            <div class="dm-draw__toolbar-left">
                                <span class="dm-draw__floor-label">${escapeHtml(surfaceLabel)}</span>
                                <span class="dm-draw__hint">Kliknite pre pridanie bodu • použite Reset pre zmazanie</span>
                            </div>
                            <div class="dm-draw__toolbar-right">
                                <button type="button" class="dm-draw__zoom-button" data-dm-zoom-out aria-label="Oddialiť">
                                    &minus;
                                </button>
                                <span class="dm-draw__zoom-value" data-dm-zoom-value>${Math.round(initialZoom * 100)}%</span>
                                <button type="button" class="dm-draw__zoom-button" data-dm-zoom-in aria-label="Priblížiť">
                                    +
                                </button>
                            </div>
                            <code class="dm-draw__output" data-role="output"></code>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="dm-modal__actions dm-modal__actions--split dm-modal__actions--draw">
                    <button type="button" class="dm-button dm-button--outline" data-dm-reset-draw>Reset</button>
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
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
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
                    <button type="button" class="dm-modal__close" aria-label="Zavrieť" data-dm-close-modal>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4841 15.5772L3.09313 24.9681L0 21.875L9.39094 12.4841L0 3.09313L3.09313 0L12.4841 9.39094L21.875 0L24.9681 3.09313L15.5772 12.4841L24.9681 21.875L21.875 24.9681L12.4841 15.5772Z" fill="#1C134F"/>
                        </svg>
                    </button>
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
