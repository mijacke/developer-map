const DEFAULT_SNAP_TOLERANCE = 8;

/**
 * Lightweight SVG adapter placeholder. Responsible for rendering lots and applying hatch overlays.
 * @param {{ host: HTMLElement; projectConfig: object; renderer?: object; state: object }} options
 */
export function createSvgAdapter(options) {
    const { host, projectConfig, renderer, state } = options;
    const lotElements = new Map();
    const palette = projectConfig.palette ?? { statuses: [] };
    const snapTolerance = projectConfig.adapter?.options?.snapTolerance ?? DEFAULT_SNAP_TOLERANCE;

    function resolveSurface() {
        if (renderer?.getSurface) {
            return renderer.getSurface();
        }
        return host;
    }

    function mount() {
        const surface = resolveSurface();
        if (!surface) return;

        surface.classList.add('dm-map-surface');
        surface.dataset.dmSnapTolerance = String(snapTolerance);
        surface.innerHTML = '';

        const fragment = document.createDocumentFragment();
        const lots = Array.isArray(state?.lots) && state.lots.length ? state.lots : projectConfig.lots;
        for (const lot of lots) {
            const element = document.createElement('button');
            element.type = 'button';
            element.className = 'dm-map-lot';
            element.dataset.dmLotId = lot.id;
            element.dataset.dmStatus = lot.status;
            element.style.setProperty('--dm-lot-color', getStatusColor(lot.status));
            if (lot.meta?.maskColor) {
                element.style.setProperty('--dm-lot-mask-color', lot.meta.maskColor);
            }
            element.setAttribute('aria-label', `${lot.label ?? lot.id}`);
            element.addEventListener('click', () => {
                host.dispatchEvent(
                    new CustomEvent('dm:select-lot', {
                        detail: {
                            lotId: lot.id,
                            source: 'map',
                        },
                        bubbles: true,
                    }),
                );
            });

            const label = document.createElement('span');
            label.className = 'dm-map-lot__label';
            label.textContent = lot.label ?? lot.id;
            element.appendChild(label);

            fragment.appendChild(element);
            lotElements.set(lot.id, element);
        }

        surface.appendChild(fragment);
    }

    function highlight(lotId) {
        for (const [, element] of lotElements) {
            element.classList.toggle('is-focused', false);
        }
        const element = lotElements.get(lotId);
        if (element) {
            element.classList.add('is-focused');
            element.focus({ preventScroll: false });
        }
    }

    function setStatus(lotId, statusKey) {
        const element = lotElements.get(lotId);
        if (!element) return;
        element.dataset.dmStatus = statusKey;
        element.style.setProperty('--dm-lot-color', getStatusColor(statusKey));
    }

    function updateLotColor(lotId, color) {
        const element = lotElements.get(lotId);
        if (!element) return;
        element.style.setProperty('--dm-lot-mask-color', color);
    }

    function updatePalette(nextPalette) {
        if (!nextPalette?.statuses) return;
        palette.statuses = nextPalette.statuses;
        for (const [lotId] of lotElements) {
            const lot = state.lotsMap.get(lotId);
            if (!lot) continue;
            setStatus(lotId, lot.status);
        }
    }

    function removeLot(lotId) {
        const element = lotElements.get(lotId);
        if (!element) return;
        element.remove();
        lotElements.delete(lotId);
    }

    function destroy() {
        for (const [, element] of lotElements) {
            element.remove();
        }
        lotElements.clear();
        const surface = resolveSurface();
        if (surface) {
            surface.innerHTML = '';
            surface.classList.remove('dm-map-surface');
        }
    }

    function getStatusColor(statusKey) {
        const status = palette.statuses?.find((item) => item.key === statusKey);
        return status?.color ?? '#94a3b8';
    }

    return {
        mount,
        highlight,
        setStatus,
        updateLotColor,
        updatePalette,
        removeLot,
        destroy,
    };
}

export default createSvgAdapter;
