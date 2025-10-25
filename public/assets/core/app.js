import { APP_VIEWS, MAP_SECTIONS, SETTINGS_SECTIONS, DRAW_VIEWBOX, DEFAULT_DRAW_POINTS } from './constants.js';
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

    // Initialize colors
    const savedColors = loadColors();
    if (savedColors) {
        data.colors = savedColors;
    }
    applyColors(data.colors);

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
        enhanceDrawModal();
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
                } else {
                    parentRow.classList.add('is-expanded');
                    button.setAttribute('aria-expanded', 'true');
                    button.setAttribute('aria-label', 'Zabaliť poschodia');
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
