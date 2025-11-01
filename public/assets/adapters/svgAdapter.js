const DEFAULT_SNAP_TOLERANCE = 8;

/**
 * Lightweight SVG adapter placeholder. Responsible for rendering interactive regions and applying hatch overlays.
 * @param {{ host: HTMLElement; projectConfig: object; renderer?: object; state: object }} options
 */
export function createSvgAdapter(options) {
    const { host, projectConfig, renderer, state } = options;
    const regionElements = new Map();
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
        const regions =
            (Array.isArray(state?.regions) && state.regions.length ? state.regions : projectConfig.regions) ?? [];
        const registry =
            state?.regionsMap instanceof Map
                ? state.regionsMap
                : state?.lotsMap instanceof Map
                    ? state.lotsMap
                    : null;

        for (const region of regions) {
            const regionId = region?.id ?? region?.lotId ?? region?.lot_id;
            if (!regionId) continue;
            const statusKey =
                region.status ?? region.statusId ?? region.status_id ?? region.statusKey ?? region.status_key ?? '';
            const element = document.createElement('button');
            element.type = 'button';
            element.className = 'dm-map-region dm-map-lot';
            element.dataset.dmRegionId = String(regionId);
            element.dataset.dmLotId = String(regionId);
            element.dataset.dmStatus = statusKey;
            element.style.setProperty('--dm-lot-color', getStatusColor(statusKey));
            if (region.meta?.maskColor) {
                element.style.setProperty('--dm-lot-mask-color', region.meta.maskColor);
            }
            if (region.geometry) {
                try {
                    element.dataset.dmRegionGeometry = JSON.stringify(region.geometry);
                } catch (serializationError) {
                    console.warn('[Developer Map] Failed to serialise region geometry', serializationError);
                }
            }
            const labelText = region.label ?? region.name ?? regionId;
            element.setAttribute('aria-label', `${labelText}`);
            element.addEventListener('click', () => {
                host.dispatchEvent(
                    new CustomEvent('dm:select-lot', {
                        detail: {
                            lotId: regionId,
                            regionId,
                            source: 'map',
                        },
                        bubbles: true,
                    }),
                );
            });

            const label = document.createElement('span');
            label.className = 'dm-map-lot__label';
            label.textContent = labelText;
            element.appendChild(label);

            fragment.appendChild(element);
            regionElements.set(String(regionId), element);

            if (registry && !registry.has(String(regionId))) {
                registry.set(String(regionId), region);
            }
        }

        surface.appendChild(fragment);
    }

    function highlight(regionId) {
        for (const [, element] of regionElements) {
            element.classList.toggle('is-focused', false);
        }
        const element = regionElements.get(String(regionId));
        if (element) {
            element.classList.add('is-focused');
            element.focus({ preventScroll: false });
        }
    }

    function setStatus(regionId, statusKey) {
        const element = regionElements.get(String(regionId));
        if (!element) return;
        element.dataset.dmStatus = statusKey;
        element.style.setProperty('--dm-lot-color', getStatusColor(statusKey));
    }

    function updateRegionMaskColor(regionId, color) {
        const element = regionElements.get(String(regionId));
        if (!element) return;
        element.style.setProperty('--dm-lot-mask-color', color);
    }

    function updatePalette(nextPalette) {
        if (!nextPalette?.statuses) return;
        palette.statuses = nextPalette.statuses;
        const lookup =
            state?.regionsMap instanceof Map
                ? state.regionsMap
                : state?.lotsMap instanceof Map
                    ? state.lotsMap
                    : null;
        for (const [regionId] of regionElements) {
            if (lookup) {
                const region = lookup.get(regionId);
                if (region) {
                    const statusKey =
                        region.status ?? region.statusId ?? region.statusKey ?? region.status_id ?? '';
                    setStatus(regionId, statusKey);
                }
            }
        }
    }

    function removeRegion(regionId) {
        const element = regionElements.get(String(regionId));
        if (!element) return;
        element.remove();
        regionElements.delete(String(regionId));
    }

    function destroy() {
        for (const [, element] of regionElements) {
            element.remove();
        }
        regionElements.clear();
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
        updateLotColor: updateRegionMaskColor,
        updateRegionMaskColor,
        updatePalette,
        removeLot: removeRegion,
        removeRegion,
        destroy,
    };
}

export default createSvgAdapter;
