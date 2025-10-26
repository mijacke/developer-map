import { APP_VIEWS, MAP_SECTIONS, SETTINGS_SECTIONS, DRAW_VIEWBOX, DEFAULT_DRAW_POINTS, MEDIA } from './constants.js';
import { createDemoData } from './data.js';
import { renderAppShell } from './layout/app-shell.js';
import { renderModal } from './modals/index.js';

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

    // Load colors from localStorage
    function loadColors() {
        try {
            const stored = localStorage.getItem('dm-colors');
            if (stored) {
                const colors = JSON.parse(stored);
                return colors;
            }
        } catch (err) {
            console.warn('[Developer Map] Failed to load colors from localStorage', err);
        }
        return null;
    }

    // Apply colors to CSS custom properties
    function applyColors(colors) {
        if (!colors || !Array.isArray(colors)) return;
        
        const colorMap = {
            'Farba tlačidiel': '--dm-button-color',
            'Farba nadpisov': '--dm-heading-color',
            'Farba obsahových textov': '--dm-content-text-color',
        };

        colors.forEach((color) => {
            const varName = colorMap[color.label];
            if (varName && color.value) {
                root.style.setProperty(varName, color.value);
            }
        });
    }

    // Save colors to localStorage
    function saveColors(colors) {
        try {
            localStorage.setItem('dm-colors', JSON.stringify(colors));
        } catch (err) {
            console.warn('[Developer Map] Failed to save colors to localStorage', err);
        }
    }

    // Load expanded projects from localStorage
    function loadExpandedProjects() {
        try {
            const stored = localStorage.getItem('dm-expanded-projects');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.warn('[Developer Map] Failed to load expanded projects from localStorage', err);
        }
        return [];
    }

    // Save expanded projects to localStorage
    function saveExpandedProjects(expandedIds) {
        try {
            localStorage.setItem('dm-expanded-projects', JSON.stringify(expandedIds));
        } catch (err) {
            console.warn('[Developer Map] Failed to save expanded projects to localStorage', err);
        }
    }

    // Load projects (maps) from localStorage
    function loadProjects() {
        try {
            const stored = localStorage.getItem('dm-projects');
            if (stored) {
                const projects = JSON.parse(stored);
                return projects;
            }
        } catch (err) {
            console.warn('[Developer Map] Failed to load projects from localStorage', err);
        }
        return null;
    }

    // Save projects (maps) to localStorage
    function saveProjects(projects) {
        try {
            localStorage.setItem('dm-projects', JSON.stringify(projects));
            console.info('[Developer Map] Projects saved to localStorage', projects.length, 'projects');
        } catch (err) {
            console.warn('[Developer Map] Failed to save projects to localStorage', err);
        }
    }

    // Initialize colors
    const savedColors = loadColors();
    if (savedColors) {
        data.colors = savedColors;
    }
    applyColors(data.colors);

    // Initialize projects from localStorage
    const savedProjects = loadProjects();
    if (savedProjects) {
        data.projects = savedProjects;
        console.info('[Developer Map] Loaded projects from localStorage', savedProjects.length, 'projects');
    }

    const state = {
        view: APP_VIEWS.MAPS,
        mapSection: MAP_SECTIONS.LIST,
        settingsSection: SETTINGS_SECTIONS.OVERVIEW,
        activeProjectId: data.projects[0]?.id ?? null,
        searchTerm: '',
        modal: null,
        runtimeConfig,
    };

    let customSelectControllers = [];
    let customSelectDocEventsBound = false;

    function findMapItem(itemId) {
        if (!itemId) {
            return null;
        }
        const soughtId = String(itemId);
        for (const project of data.projects ?? []) {
            if (String(project.id) === soughtId) {
                return { item: project, type: 'project', parent: null };
            }
            for (const floor of project.floors ?? []) {
                if (String(floor.id) === soughtId) {
                    return { item: floor, type: 'floor', parent: project };
                }
            }
        }
        return null;
    }

    function generateId(prefix) {
        const safePrefix = prefix || 'entity';
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return `${safePrefix}-${crypto.randomUUID()}`;
        }
        const randomPart = Math.random().toString(36).slice(2, 8);
        const timePart = Date.now().toString(36);
        return `${safePrefix}-${randomPart}-${timePart}`;
    }

    function ensureBadge(name, fallback = 'M') {
        if (typeof name === 'string' && name.trim().length) {
            return name.trim().charAt(0).toUpperCase();
        }
        return fallback || 'M';
    }

    function collectModalFields() {
        const form = root.querySelector('.dm-modal__form');
        if (!form) {
            return null;
        }

        const nameInput = form.querySelector('input[data-dm-field="name"]');
        const typeSelect = form.querySelector('select[data-dm-field="map-type"]');
        const parentSelect = form.querySelector('select[data-dm-field="parent"]');

        const nameValue = nameInput ? nameInput.value.trim() : '';

        let typeValue = '';
        if (typeSelect) {
            typeValue = typeSelect.value.trim();
            if (!typeValue && typeSelect.selectedOptions.length) {
                const selected = typeSelect.selectedOptions[0];
                typeValue = selected.value.trim() || selected.textContent.trim();
            }
        }
        if (!typeValue) {
            typeValue = state.modal?.targetType === 'floor' ? 'Lokalita' : 'Projekt';
        }

        let parentId = null;
        if (parentSelect) {
            const rawValue = parentSelect.value;
            parentId = rawValue && rawValue !== 'none' ? rawValue : null;
        } else if (state.modal && state.modal.parentId) {
            parentId = state.modal.parentId;
        }

        return {
            name: nameValue,
            type: typeValue,
            parentId,
            elements: {
                nameInput,
            },
        };
    }

    root.dataset.dmHydrated = '1';
    root.classList.add('dm-root');

    function setState(patch) {
        const next = typeof patch === 'function' ? patch(state) : patch;
        Object.assign(state, next);
        render();
    }

    function openModal(modalType, rawPayload = null) {
        const normalizedType = typeof modalType === 'string' ? modalType : null;
        const normalizedPayload =
            rawPayload === null || rawPayload === undefined || rawPayload === 'null' || rawPayload === 'undefined'
                ? null
                : String(rawPayload);

        if (!normalizedType) {
            setState({ modal: null });
            return;
        }

        if (normalizedType === 'edit-map' && normalizedPayload) {
            const result = findMapItem(normalizedPayload);
            if (result) {
                setState({
                    modal: {
                        type: normalizedType,
                        payload: String(result.item.id),
                        parentId: result.type === 'floor' && result.parent ? String(result.parent.id) : null,
                        imagePreview: null,
                        targetType: result.type,
                    },
                });
                return;
            }
        }

        if (normalizedType === 'add-map') {
            setState({
                modal: {
                    type: normalizedType,
                    payload: null,
                    parentId: null,
                    imagePreview: null,
                    targetType: 'project',
                },
            });
            return;
        }

        if (normalizedType === 'add-location') {
            const parentId = normalizedPayload ?? (state.activeProjectId ? String(state.activeProjectId) : null);
            setState({
                modal: {
                    type: normalizedType,
                    payload: parentId,
                    parentId,
                    imagePreview: null,
                    targetType: 'floor',
                },
            });
            return;
        }

        if (normalizedType === 'delete-map' && normalizedPayload) {
            const result = findMapItem(normalizedPayload);
            if (result) {
                setState({
                    modal: {
                        type: normalizedType,
                        payload: String(result.item.id),
                        itemName: result.item.name || 'túto položku',
                    },
                });
                return;
            }
        }

        setState({
            modal: {
                type: normalizedType,
                payload: normalizedPayload,
            },
        });
    }

    function render() {
        root.innerHTML = [renderAppShell(state, data), renderModal(state, data)].join('');
        attachEventHandlers();
        enhanceSelects();
        enhanceDrawModal();
        restoreExpandedProjects();
    }

    function restoreExpandedProjects() {
        const expandedIds = loadExpandedProjects();
        if (!expandedIds || expandedIds.length === 0) return;

        expandedIds.forEach((projectId) => {
            const parentRow = root.querySelector(`[data-dm-parent-id="${projectId}"]`);
            const toggleButton = root.querySelector(`[data-dm-toggle="${projectId}"]`);
            
            if (parentRow && toggleButton) {
                parentRow.classList.add('is-expanded');
                toggleButton.setAttribute('aria-expanded', 'true');
                toggleButton.setAttribute('aria-label', 'Zabaliť poschodia');
            }
        });
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

        // Hierarchické rozbaľovanie/zabaľovanie
        const toggleButtons = root.querySelectorAll('[data-dm-toggle]');
        toggleButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const parentId = button.getAttribute('data-dm-toggle');
                const parentRow = root.querySelector(`[data-dm-parent-id="${parentId}"]`);
                const childrenContainer = root.querySelector(`[data-dm-children="${parentId}"]`);
                
                if (!parentRow || !childrenContainer) return;
                
                const isExpanded = parentRow.classList.contains('is-expanded');
                
                // Toggle expanded state
                if (isExpanded) {
                    parentRow.classList.remove('is-expanded');
                    button.setAttribute('aria-expanded', 'false');
                    button.setAttribute('aria-label', 'Rozbaliť poschodia');
                    
                    // Remove from expanded list
                    const expandedProjects = loadExpandedProjects();
                    const updatedExpanded = expandedProjects.filter(id => id !== parentId);
                    saveExpandedProjects(updatedExpanded);
                } else {
                    parentRow.classList.add('is-expanded');
                    button.setAttribute('aria-expanded', 'true');
                    button.setAttribute('aria-label', 'Zabaliť poschodia');
                    
                    // Add to expanded list
                    const expandedProjects = loadExpandedProjects();
                    if (!expandedProjects.includes(parentId)) {
                        expandedProjects.push(parentId);
                        saveExpandedProjects(expandedProjects);
                    }
                }
            });
            
            // Keyboard support pre toggle button
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    button.click();
                }
            });
        });

        // Add keyboard support for clickable thumbnails
        const clickableThumbs = root.querySelectorAll('.dm-board__thumb--clickable');
        clickableThumbs.forEach((thumb) => {
            thumb.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    thumb.click();
                }
            });
        });

        // Copy to clipboard functionality
        const copyButtons = root.querySelectorAll('[data-dm-copy]');
        copyButtons.forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                const textToCopy = button.getAttribute('data-dm-copy');
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Visual feedback - len zmena ikony bez zmeny farieb
                    const originalContent = button.innerHTML;
                    button.innerHTML = '<span class="dm-copy-button__icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8L6.5 11.5L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg></span>';
                    button.classList.add('is-copied');
                    
                    setTimeout(() => {
                        button.innerHTML = originalContent;
                        button.classList.remove('is-copied');
                    }, 1500);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                }
            });
        });

        const modalTriggers = root.querySelectorAll('[data-dm-modal]');
        modalTriggers.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const modal = button.getAttribute('data-dm-modal');
                const payload = button.getAttribute('data-dm-payload');
                openModal(modal, payload);
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

        if (state.modal && ['add-map', 'edit-map', 'add-location'].includes(state.modal.type)) {
            bindMapModalEvents();
        }

        // Color picker sync
        const colorInputs = root.querySelectorAll('[data-dm-color-input]');
        colorInputs.forEach((input) => {
            const colorId = input.getAttribute('data-dm-color-input');
            const textInput = root.querySelector(`[data-dm-color-text="${colorId}"]`);
            
            if (textInput) {
                input.addEventListener('input', (event) => {
                    textInput.value = event.target.value;
                });
                
                textInput.addEventListener('input', (event) => {
                    const value = event.target.value.trim();
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        input.value = value;
                    }
                });
            }
        });

        // Save color button
        const saveColorButtons = root.querySelectorAll('[data-dm-save-color]');
        saveColorButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const colorId = button.getAttribute('data-dm-save-color');
                const colorInput = root.querySelector(`[data-dm-color-input="${colorId}"]`);
                
                if (colorInput) {
                    const newValue = colorInput.value;
                    const colorIndex = data.colors.findIndex((c) => c.id === colorId);
                    
                    if (colorIndex !== -1) {
                        data.colors[colorIndex].value = newValue;
                        saveColors(data.colors);
                        applyColors(data.colors);
                        setState({ modal: null });
                    }
                }
            });
        });

        // Confirm delete button
        const confirmDeleteButton = root.querySelector('[data-dm-confirm-delete]');
        if (confirmDeleteButton) {
            confirmDeleteButton.addEventListener('click', () => {
                handleDeleteMap();
            });
        }

        // Disable default browser tooltips
        const elementsWithTitle = root.querySelectorAll('[title]');
        elementsWithTitle.forEach((element) => {
            const originalTitle = element.getAttribute('title');
            
            element.addEventListener('mouseenter', () => {
                element.setAttribute('data-dm-title', originalTitle);
                element.removeAttribute('title');
            });
            
            element.addEventListener('mouseleave', () => {
                const storedTitle = element.getAttribute('data-dm-title');
                if (storedTitle) {
                    element.setAttribute('title', storedTitle);
                    element.removeAttribute('data-dm-title');
                }
            });
        });
    }

    function bindMapModalEvents() {
        const uploadInput = root.querySelector('#dm-modal-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', handleFileInputChange);
        }

        const parentSelect = root.querySelector('select[data-dm-field="parent"]');
        if (parentSelect) {
            parentSelect.addEventListener('change', (event) => {
                const value = event.target.value;
                const nextParentId = value === 'none' ? null : value;
                const currentParentId = state.modal ? state.modal.parentId ?? null : null;
                if ((currentParentId ?? null) !== (nextParentId ?? null)) {
                    setState((prev) => {
                        if (!prev.modal) {
                            return {};
                        }
                        return {
                            modal: {
                                ...prev.modal,
                                parentId: nextParentId,
                            },
                        };
                    });
                }
            });
        }

        const saveButton = root.querySelector('[data-dm-modal-save]');
        if (saveButton) {
            saveButton.addEventListener('click', handleModalPrimaryAction);
        }
    }

    function handleFileInputChange(event) {
        const input = event.currentTarget;
        const file = input.files && input.files[0];

        if (!file) {
            if (state.modal?.imagePreview) {
                setState((prev) => {
                    if (!prev.modal) {
                        return {};
                    }
                    return {
                        modal: {
                            ...prev.modal,
                            imagePreview: null,
                        },
                    };
                });
            }
            return;
        }

        if (!file.type || !file.type.startsWith('image/')) {
            console.warn('[Developer Map] Vyberte prosím súbor typu obrázok.');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            if (typeof reader.result === 'string') {
                setState((prev) => {
                    if (!prev.modal) {
                        return {};
                    }
                    return {
                        modal: {
                            ...prev.modal,
                            imagePreview: reader.result,
                        },
                    };
                });
            }
        });
        reader.addEventListener('error', () => {
            console.warn('[Developer Map] Nepodarilo sa načítať obrázok.', reader.error);
        });
        reader.readAsDataURL(file);
    }

    function handleModalPrimaryAction() {
        if (!state.modal) {
            return;
        }
        if (state.modal.type === 'edit-map') {
            handleSaveEditMap();
        } else if (state.modal.type === 'add-map' || state.modal.type === 'add-location') {
            handleSaveAddMap();
        }
    }

    function handleSaveEditMap() {
        const modalState = state.modal;
        if (!modalState || !modalState.payload) {
            return;
        }

        const result = findMapItem(modalState.payload);
        if (!result) {
            console.warn('[Developer Map] Nepodarilo sa nájsť mapu pre úpravu.', modalState.payload);
            setState({ modal: null });
            return;
        }

        const fields = collectModalFields();
        if (!fields) {
            setState({ modal: null });
            return;
        }

        if (!fields.name) {
            fields.elements.nameInput?.focus();
            return;
        }

        const nextName = fields.name;
        const nextType = fields.type;
        const targetParentId = fields.parentId ? String(fields.parentId) : null;
        const imageData = modalState.imagePreview;

        if (result.type === 'project') {
            result.item.name = nextName;
            result.item.type = nextType;
            result.item.badge = ensureBadge(nextName, result.item.badge);
            if (imageData) {
                result.item.image = imageData;
            }
            saveProjects(data.projects);
            setState({ modal: null });
            return;
        }

        const currentParentId = result.parent ? String(result.parent.id) : null;
        result.item.name = nextName;
        result.item.type = nextType;
        if (!result.item.label || result.item.label === result.item.name) {
            result.item.label = nextName;
        }
        if (imageData) {
            result.item.image = imageData;
        }

        let newActiveProjectId = currentParentId ?? state.activeProjectId;

        if ((targetParentId ?? null) !== (currentParentId ?? null)) {
            if (result.parent && Array.isArray(result.parent.floors)) {
                result.parent.floors = result.parent.floors.filter((floor) => floor.id !== result.item.id);
            }

            if (targetParentId) {
                const newParent = data.projects.find((project) => String(project.id) === targetParentId);
                if (newParent) {
                    if (!Array.isArray(newParent.floors)) {
                        newParent.floors = [];
                    }
                    const existsInTarget = newParent.floors.some((floor) => floor.id === result.item.id);
                    if (!existsInTarget) {
                        newParent.floors.push(result.item);
                    }
                    newActiveProjectId = String(newParent.id);
                } else {
                    console.warn('[Developer Map] Nenašla sa nová nadradená mapa s ID:', targetParentId);
                    if (result.parent && Array.isArray(result.parent.floors)) {
                        const existsInOriginal = result.parent.floors.some((floor) => floor.id === result.item.id);
                        if (!existsInOriginal) {
                            result.parent.floors.push(result.item);
                        }
                    }
                }
            } else {
                const newProjectId = generateId('project');
                const projectImage = imageData || result.item.image || MEDIA.building;
                const badge = ensureBadge(nextName);
                data.projects.push({
                    id: newProjectId,
                    name: nextName,
                    type: nextType,
                    badge,
                    image: projectImage,
                    floors: [result.item],
                });
                newActiveProjectId = newProjectId;
            }
        }

        saveProjects(data.projects);
        setState({ modal: null, activeProjectId: newActiveProjectId });
    }

    function handleSaveAddMap() {
        const modalState = state.modal;
        if (!modalState) {
            return;
        }

        const fields = collectModalFields();
        if (!fields) {
            setState({ modal: null });
            return;
        }

        if (!fields.name) {
            fields.elements.nameInput?.focus();
            return;
        }

        const { name, type, parentId } = fields;
        const imageData = modalState.imagePreview;
        let newActiveProjectId = state.activeProjectId;

        if (!parentId) {
            const newProjectId = generateId('project');
            const badge = ensureBadge(name);
            data.projects.push({
                id: newProjectId,
                name,
                type,
                badge,
                image: imageData || MEDIA.building,
                floors: [],
            });
            newActiveProjectId = newProjectId;
        } else {
            const parentProject = data.projects.find((project) => String(project.id) === String(parentId));
            if (!parentProject) {
                console.warn('[Developer Map] Nenašla sa nadradená mapa pre pridanie lokality:', parentId);
                return;
            }
            if (!Array.isArray(parentProject.floors)) {
                parentProject.floors = [];
            }
            const newFloorId = generateId('floor');
            parentProject.floors.push({
                id: newFloorId,
                name,
                type,
                label: name,
                image: imageData || MEDIA.floor,
            });
            newActiveProjectId = String(parentProject.id);
        }

        saveProjects(data.projects);
        setState({ modal: null, activeProjectId: newActiveProjectId });
    }

    function handleDeleteMap() {
        const modalState = state.modal;
        if (!modalState || !modalState.payload) {
            setState({ modal: null });
            return;
        }

        const result = findMapItem(modalState.payload);
        if (!result) {
            console.warn('[Developer Map] Nepodarilo sa nájsť položku pre vymazanie:', modalState.payload);
            setState({ modal: null });
            return;
        }

        if (result.type === 'project') {
            // Vymazanie celého projektu
            const projectIndex = data.projects.findIndex((p) => p.id === result.item.id);
            if (projectIndex !== -1) {
                data.projects.splice(projectIndex, 1);
                
                // Ak bol vymazaný aktívny projekt, nastav nový aktívny projekt
                let newActiveProjectId = state.activeProjectId;
                if (state.activeProjectId === result.item.id) {
                    newActiveProjectId = data.projects[0]?.id ?? null;
                }
                
                saveProjects(data.projects);
                setState({ modal: null, activeProjectId: newActiveProjectId, view: APP_VIEWS.MAPS, mapSection: MAP_SECTIONS.LIST });
            }
        } else if (result.type === 'floor' && result.parent) {
            // Vymazanie poschodia z projektu
            if (Array.isArray(result.parent.floors)) {
                result.parent.floors = result.parent.floors.filter((floor) => floor.id !== result.item.id);
                saveProjects(data.projects);
                setState({ modal: null });
            }
        }
    }

    function enhanceSelects() {
        customSelectControllers = customSelectControllers.filter((controller) => {
            return controller.select.isConnected && controller.wrapper.isConnected;
        });

        const selects = root.querySelectorAll('[data-dm-select]');
        if (!selects.length) {
            return;
        }

        selects.forEach((select) => {
            if (customSelectControllers.some((controller) => controller.select === select)) {
                return;
            }

            const field = select.closest('.dm-field');
            if (!field) {
                return;
            }

            const controller = buildCustomSelect(select, field);
            if (controller) {
                customSelectControllers.push(controller);
            }
        });

        if (!customSelectDocEventsBound && customSelectControllers.length) {
            document.addEventListener('click', handleSelectDocumentClick);
            document.addEventListener('keydown', handleSelectDocumentKeydown, true);
            customSelectDocEventsBound = true;
        } else if (customSelectDocEventsBound && !customSelectControllers.length) {
            document.removeEventListener('click', handleSelectDocumentClick);
            document.removeEventListener('keydown', handleSelectDocumentKeydown, true);
            customSelectDocEventsBound = false;
        }
    }

    function buildCustomSelect(select, field) {
        if (select.dataset.dmEnhanced === '1' || !select.options.length) {
            return null;
        }

        const label = field.querySelector('.dm-field__label');
        const labelText = label ? label.textContent.trim() : '';

        if (label && !label.id) {
            label.id = `dm-field-label-${Math.random().toString(36).slice(2, 9)}`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'dm-select';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'dm-select__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        if (label && label.id) {
            trigger.setAttribute('aria-labelledby', label.id);
        } else if (labelText) {
            trigger.setAttribute('aria-label', labelText);
        }

        const valueEl = document.createElement('span');
        valueEl.className = 'dm-select__value';

        const iconEl = document.createElement('span');
        iconEl.className = 'dm-select__icon';
        iconEl.innerHTML = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true"><path d="M2 2L8 8L14 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

        trigger.append(valueEl, iconEl);
        wrapper.appendChild(trigger);

        const dropdown = document.createElement('div');
        dropdown.className = 'dm-select__dropdown';

        const list = document.createElement('ul');
        list.className = 'dm-select__list';
        list.setAttribute('role', 'listbox');

        const dropdownId = select.id ? `${select.id}-dropdown` : `dm-select-${Math.random().toString(36).slice(2, 9)}`;
        list.id = dropdownId;
        trigger.setAttribute('aria-controls', dropdownId);

        dropdown.appendChild(list);
        wrapper.appendChild(dropdown);

        select.insertAdjacentElement('afterend', wrapper);
        select.setAttribute('data-dm-enhanced', '1');
        select.classList.add('dm-select__native');
        select.setAttribute('aria-hidden', 'true');
        select.tabIndex = -1;
        field.classList.add('dm-field--select');

        const optionItems = [];
        valueEl.innerHTML = '&nbsp;';

        Array.from(select.options).forEach((option) => {
            if (option.hidden) {
                return;
            }

            const optionEl = document.createElement('li');
            optionEl.className = 'dm-select__option';
            optionEl.setAttribute('role', 'option');
            optionEl.dataset.value = option.value;
            optionEl.textContent = option.textContent;

            if (option.disabled) {
                optionEl.classList.add('is-disabled');
                optionEl.setAttribute('aria-disabled', 'true');
            }

            list.appendChild(optionEl);
            optionItems.push({ option, el: optionEl });
        });

        const controller = {
            select,
            field,
            wrapper,
            trigger,
            dropdown,
            list,
            valueEl,
            placeholderMarkup: '&nbsp;',
            options: optionItems,
        };

        updateSelectDisplay(controller);

        trigger.addEventListener('click', () => toggleSelect(controller));
        trigger.addEventListener('keydown', (event) => handleTriggerKeydown(event, controller));
        trigger.addEventListener('blur', () => {
            window.setTimeout(() => {
                if (!wrapper.contains(document.activeElement)) {
                    closeSelect(controller);
                }
            }, 0);
        });

        list.addEventListener('mousedown', (event) => {
            const optionEl = event.target.closest('.dm-select__option');
            if (optionEl && !optionEl.classList.contains('is-disabled')) {
                event.preventDefault();
            }
        });

        list.addEventListener('click', (event) => {
            const optionEl = event.target.closest('.dm-select__option');
            if (!optionEl || optionEl.classList.contains('is-disabled')) {
                return;
            }
            setSelectValue(controller, optionEl.dataset.value, { focusTrigger: true });
        });

        select.addEventListener('change', () => updateSelectDisplay(controller));

        return controller;
    }

    function toggleSelect(controller) {
        if (controller.wrapper.classList.contains('dm-select--open')) {
            closeSelect(controller);
        } else {
            openSelect(controller);
        }
    }

    function openSelect(controller) {
        closeAllSelects(controller);
        controller.wrapper.classList.add('dm-select--open');
        controller.field.classList.add('dm-field--select-open');
        controller.trigger.setAttribute('aria-expanded', 'true');
        controller.trigger.focus({ preventScroll: true });
    }

    function closeSelect(controller) {
        if (!controller.wrapper.classList.contains('dm-select--open')) {
            return;
        }
        controller.wrapper.classList.remove('dm-select--open');
        controller.field.classList.remove('dm-field--select-open');
        controller.trigger.setAttribute('aria-expanded', 'false');
    }

    function closeAllSelects(except) {
        customSelectControllers.forEach((controller) => {
            if (controller !== except) {
                closeSelect(controller);
            }
        });
    }

    function setSelectValue(controller, value, options = {}) {
        const { closeDropdown = true, focusTrigger = false } = options;
        const optionItem = controller.options.find((item) => item.option.value === value && !item.option.hidden);
        if (!optionItem || optionItem.option.disabled) {
            return;
        }

        if (controller.select.value !== value) {
            controller.select.value = value;
            controller.select.dispatchEvent(new Event('input', { bubbles: true }));
            controller.select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            updateSelectDisplay(controller);
        }

        if (closeDropdown) {
            closeSelect(controller);
        }
        if (focusTrigger) {
            controller.trigger.focus({ preventScroll: true });
        }
    }

    function updateSelectDisplay(controller) {
        const { select, valueEl, placeholderMarkup, wrapper, options, field } = controller;
        const currentValue = select.value;
        const activeOption = options.find((item) => item.option.value === currentValue && !item.option.hidden && !item.option.disabled);

        if (activeOption) {
            valueEl.textContent = activeOption.option.textContent;
        } else {
            valueEl.innerHTML = placeholderMarkup;
        }

        const hasValue = Boolean(currentValue);
        wrapper.classList.toggle('dm-select--has-value', hasValue);
        wrapper.classList.toggle('dm-select--placeholder', !hasValue);
        field.classList.toggle('dm-field--select-has-value', hasValue);

        options.forEach((item) => {
            const isActive = item.option.value === currentValue && !item.option.hidden && !item.option.disabled;
            item.el.classList.toggle('is-active', isActive);
            item.el.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    function handleTriggerKeydown(event, controller) {
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                if (!controller.wrapper.classList.contains('dm-select--open')) {
                    openSelect(controller);
                }
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                moveSelectValue(controller, direction);
                break;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();
                toggleSelect(controller);
                break;
            }
            case 'Escape': {
                if (controller.wrapper.classList.contains('dm-select--open')) {
                    event.preventDefault();
                    closeSelect(controller);
                }
                break;
            }
            default:
                break;
        }
    }

    function moveSelectValue(controller, direction) {
        const enabledOptions = controller.options.filter((item) => !item.option.disabled && !item.option.hidden);
        if (!enabledOptions.length) {
            return;
        }

        const currentValue = controller.select.value;
        let index = enabledOptions.findIndex((item) => item.option.value === currentValue);
        if (index === -1) {
            index = direction > 0 ? -1 : 0;
        }
        index = (index + direction + enabledOptions.length) % enabledOptions.length;
        const nextValue = enabledOptions[index].option.value;

        setSelectValue(controller, nextValue, { closeDropdown: false, focusTrigger: false });
        updateSelectDisplay(controller);
    }

    function handleSelectDocumentClick(event) {
        customSelectControllers.forEach((controller) => {
            if (!controller.wrapper.contains(event.target)) {
                closeSelect(controller);
            }
        });
    }

    function handleSelectDocumentKeydown(event) {
        if (event.key !== 'Escape') {
            return;
        }

        let closedAny = false;
        customSelectControllers.forEach((controller) => {
            if (controller.wrapper.classList.contains('dm-select--open')) {
                closeSelect(controller);
                closedAny = true;
            }
        });

        if (closedAny) {
            event.stopPropagation();
        }
    }

    function enhanceDrawModal() {
        if (!state.modal || state.modal.type !== 'draw-coordinates') {
            return;
        }
        const drawRoot = root.querySelector('[data-dm-draw-root]');
        if (!drawRoot) {
            return;
        }
        initDrawSurface(drawRoot);
    }

    function initDrawSurface(drawRoot) {
        if (!drawRoot || drawRoot.dataset.dmDrawReady === '1') {
            return;
        }

        drawRoot.dataset.dmDrawReady = '1';

        const overlay = drawRoot.querySelector('[data-role="overlay"]');
        const fill = drawRoot.querySelector('[data-role="fill"]');
        const outline = drawRoot.querySelector('[data-role="outline"]');
        const baseline = drawRoot.querySelector('[data-role="baseline"]');
        const handlesLayer = drawRoot.querySelector('[data-role="handles"]');
        const output = drawRoot.querySelector('[data-role="output"]');
        const cursor = drawRoot.querySelector('.dm-draw__cursor');
        const stage = drawRoot.querySelector('.dm-draw__stage');
        const resetButton = root.querySelector('[data-dm-reset-draw]');
        const saveButton = root.querySelector('[data-dm-save-draw]');
        const floorName = drawRoot.dataset.dmFloorName ?? 'Lokalita';

        if (!overlay || !fill || !outline || !baseline || !handlesLayer || !output || !stage) {
            return;
        }

        let points = clonePoints(DEFAULT_DRAW_POINTS);
        let handleElements = [];
        let activeHandle = null;
        let activeIndex = -1;
        let preventClick = false;
        let cursorAnchorIndex = 0;

        const handleResize = () => positionCursor();
        window.addEventListener('resize', handleResize);

        const observer = new MutationObserver(() => {
            if (!root.contains(drawRoot)) {
                teardown();
            }
        });
        observer.observe(root, { childList: true, subtree: true });

        function teardown() {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        }

        function clonePoints(source) {
            return source.map((point) => ({ x: point.x, y: point.y }));
        }

        function clampPoint(point) {
            return {
                x: Math.max(0, Math.min(DRAW_VIEWBOX.width, Math.round(point.x))),
                y: Math.max(0, Math.min(DRAW_VIEWBOX.height, Math.round(point.y))),
            };
        }

        function toViewBoxCoordinates(event) {
            const rect = overlay.getBoundingClientRect();
            const scaleX = DRAW_VIEWBOX.width / rect.width;
            const scaleY = DRAW_VIEWBOX.height / rect.height;
            return {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY,
            };
        }

        function pointsToString(list) {
            return list.map((point) => `${point.x},${point.y}`).join(' ');
        }

        function pointsToClosedString(list) {
            if (!list.length) {
                return '';
            }
            const extended = list.concat(list[0]);
            return extended.map((point) => `${point.x},${point.y}`).join(' ');
        }

        function updateShapes() {
            const pointString = pointsToString(points);
            const closedString = pointsToClosedString(points);
            fill.setAttribute('points', pointString);
            outline.setAttribute('points', closedString);
            baseline.setAttribute('points', closedString);
            points.forEach((point, index) => {
                const handle = handleElements[index];
                if (handle) {
                    handle.setAttribute('cx', String(point.x));
                    handle.setAttribute('cy', String(point.y));
                }
            });
        }

        function updateOutput() {
            const normalised = points.map((point) => [
                Number((point.x / DRAW_VIEWBOX.width).toFixed(4)),
                Number((point.y / DRAW_VIEWBOX.height).toFixed(4)),
            ]);
            output.textContent = `${floorName}: ${JSON.stringify(normalised)}`;
        }

        function positionCursor() {
            if (!cursor) {
                return;
            }
            if (!points.length) {
                cursor.style.transform = 'translate(-9999px, -9999px)';
                return;
            }
            if (cursorAnchorIndex >= points.length) {
                cursorAnchorIndex = points.length - 1;
            }
            const anchor = points[cursorAnchorIndex];
            const overlayRect = overlay.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const scaleX = overlayRect.width / DRAW_VIEWBOX.width;
            const scaleY = overlayRect.height / DRAW_VIEWBOX.height;
            const x = (anchor.x * scaleX) + (overlayRect.left - stageRect.left) - 28;
            const y = (anchor.y * scaleY) + (overlayRect.top - stageRect.top) - 28;
            cursor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        }

        function redraw() {
            updateShapes();
            updateOutput();
            positionCursor();
        }

        function buildHandles() {
            handlesLayer.innerHTML = points
                .map(
                    (point, index) => `
                        <circle tabindex="0" role="button" aria-label="Bod ${index + 1}" data-index="${index}" cx="${point.x}" cy="${point.y}" r="14"></circle>
                    `,
                )
                .join('');
            handleElements = Array.from(handlesLayer.querySelectorAll('circle'));
            if (cursorAnchorIndex >= points.length) {
                cursorAnchorIndex = Math.max(0, points.length - 1);
            }
            handleElements.forEach((handle) => {
                handle.addEventListener('pointerdown', startDrag);
                handle.addEventListener('keydown', handleHandleKeydown);
            });
        }

        function handleHandleKeydown(event) {
            const target = event.currentTarget;
            const index = Number(target.getAttribute('data-index'));
            if (!Number.isFinite(index)) return;
            const step = event.shiftKey ? 10 : 4;
            let changed = false;
            switch (event.key) {
                case 'ArrowUp':
                    points[index].y = Math.max(0, points[index].y - step);
                    changed = true;
                    break;
                case 'ArrowDown':
                    points[index].y = Math.min(DRAW_VIEWBOX.height, points[index].y + step);
                    changed = true;
                    break;
                case 'ArrowLeft':
                    points[index].x = Math.max(0, points[index].x - step);
                    changed = true;
                    break;
                case 'ArrowRight':
                    points[index].x = Math.min(DRAW_VIEWBOX.width, points[index].x + step);
                    changed = true;
                    break;
                case 'Delete':
                case 'Backspace':
                    if (points.length > 3) {
                        points.splice(index, 1);
                        if (cursorAnchorIndex >= points.length) {
                            cursorAnchorIndex = Math.max(0, points.length - 1);
                        }
                        buildHandles();
                        redraw();
                    }
                    break;
                default:
                    break;
            }
            if (changed) {
                redraw();
            }
        }

        function startDrag(event) {
            const target = event.currentTarget;
            activeIndex = Number(target.getAttribute('data-index'));
            if (!Number.isFinite(activeIndex)) {
                return;
            }
            activeHandle = target;
            cursorAnchorIndex = activeIndex;
            preventClick = false;
            activeHandle.classList.add('is-active');
            activeHandle.setPointerCapture(event.pointerId);
            event.preventDefault();
            window.addEventListener('pointermove', handleDrag);
            window.addEventListener('pointerup', endDrag, { once: true });
        }

        function handleDrag(event) {
            if (activeIndex < 0) {
                return;
            }
            preventClick = true;
            const { x, y } = toViewBoxCoordinates(event);
            points[activeIndex] = clampPoint({ x, y });
            redraw();
        }

        function endDrag(event) {
            if (activeIndex < 0) {
                return;
            }
            const { x, y } = toViewBoxCoordinates(event);
            points[activeIndex] = clampPoint({ x, y });
            if (activeHandle) {
                activeHandle.releasePointerCapture(event.pointerId);
                activeHandle.classList.remove('is-active');
            }
            activeHandle = null;
            activeIndex = -1;
            window.removeEventListener('pointermove', handleDrag);
            setTimeout(() => {
                preventClick = false;
            }, 0);
            redraw();
        }

        function handleOverlayClick(event) {
            if (event.target !== overlay || preventClick) {
                preventClick = false;
                return;
            }
            const { x, y } = toViewBoxCoordinates(event);
            const point = clampPoint({ x, y });
            insertPoint(point);
        }

        function insertPoint(point) {
            if (points.length < 3) {
                points.push(point);
                buildHandles();
                redraw();
                return;
            }
            let bestIndex = 0;
            let bestDistance = Number.POSITIVE_INFINITY;
            for (let i = 0; i < points.length; i += 1) {
                const a = points[i];
                const b = points[(i + 1) % points.length];
                const distance = distanceToSegment(point, a, b);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = i + 1;
                }
            }
            points.splice(bestIndex, 0, point);
            cursorAnchorIndex = bestIndex;
            buildHandles();
            redraw();
        }

        function distanceToSegment(point, a, b) {
            const abx = b.x - a.x;
            const aby = b.y - a.y;
            const apx = point.x - a.x;
            const apy = point.y - a.y;
            const ab2 = (abx * abx) + (aby * aby);
            const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, ((apx * abx) + (apy * aby)) / ab2));
            const closestX = a.x + (abx * t);
            const closestY = a.y + (aby * t);
            const dx = point.x - closestX;
            const dy = point.y - closestY;
            return Math.sqrt((dx * dx) + (dy * dy));
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                points = clonePoints(DEFAULT_DRAW_POINTS);
                cursorAnchorIndex = 0;
                buildHandles();
                redraw();
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const normalised = points.map((point) => ({
                    x: Number((point.x / DRAW_VIEWBOX.width).toFixed(4)),
                    y: Number((point.y / DRAW_VIEWBOX.height).toFixed(4)),
                }));
                console.info(`[Developer Map] ${floorName} – uložené súradnice`, normalised);
                setState({ modal: null });
            });
        }

        overlay.addEventListener('click', handleOverlayClick);

        buildHandles();
        redraw();
        positionCursor();
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

export default initDeveloperMap;
