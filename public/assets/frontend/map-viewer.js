(() => {
    const config = window.dmFrontendConfig || {};
    const endpoint = typeof config.endpoint === 'string' ? config.endpoint : '';

    if (!endpoint) {
        console.warn('[Developer Map] Missing REST endpoint configuration.');
        return;
    }

    const AVAILABLE_KEYWORDS = ['available', 'free', 'voln', 'volne', 'volny', 'volny apartman', 'volne apartmany', 'predaj', 'na predaj'];

    function ensureStyles() {
        const STYLE_ID = 'dm-map-viewer-style';
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .dm-map-viewer { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 1.5rem 0; }
            .dm-map-viewer__card { border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 18px; padding: 24px; background: #ffffff; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06); display: grid; gap: 24px; }
            .dm-map-viewer__header h3 { margin: 0; font-size: 1.4rem; color: #1c134f; }
            .dm-map-viewer__header p { margin: 8px 0 0; color: #475569; line-height: 1.5; }
            .dm-map-viewer__surface { position: relative; border-radius: 20px; overflow: hidden; background: #0f172a; }
            .dm-map-viewer__image { width: 100%; height: auto; display: block; }
            .dm-map-viewer__overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
            .dm-map-viewer__regions { pointer-events: none; }
            .dm-map-viewer__region { fill: rgba(52, 69, 235, 0.12); stroke: none; pointer-events: auto; transition: fill 0.18s ease, opacity 0.18s ease; opacity: 0.4; outline: none; }
            .dm-map-viewer__region:hover { opacity: 0.72; }
            .dm-map-viewer__region.is-active { opacity: 0.82; }
            .dm-map-viewer__region:focus { outline: none; }
            .dm-map-viewer__region:focus-visible { outline: none; }
            .dm-map-viewer__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
            .dm-map-viewer__item { display: flex; align-items: center; gap: 12px; justify-content: space-between; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 12px; padding: 12px 16px; background: #f8fafc; }
            .dm-map-viewer__item strong { font-weight: 600; color: #1c134f; }
            .dm-map-viewer__badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 999px; background: rgba(124, 58, 237, 0.12); color: #5b21b6; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
            .dm-map-viewer__error { padding: 16px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
            .dm-map-viewer__loading { padding: 16px; border-radius: 12px; background: rgba(30, 64, 175, 0.08); color: #1d4ed8; }
            .dm-map-viewer__empty { margin: 0; padding: 16px; border-radius: 12px; background: rgba(15, 118, 110, 0.08); color: #0f766e; }
            .dm-map-viewer__popover { position: absolute; z-index: 10; display: none; pointer-events: auto; }
            .dm-map-viewer__popover.is-visible { display: block; }
            .dm-map-viewer__popover-card { background: #ffffff; border-radius: 16px; padding: 18px 20px; box-shadow: 0 18px 42px rgba(15, 23, 42, 0.22); min-width: 220px; max-width: 280px; border: 1px solid rgba(15, 23, 42, 0.08); display: flex; flex-direction: column; gap: 12px; }
            .dm-map-viewer__popover-summary { font-weight: 600; font-size: 0.95rem; color: #1c134f; text-align: center; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
            .dm-map-viewer__popover-summary strong { color: #16a34a; font-size: 1.05rem; margin-right: 6px; }
            .dm-map-viewer__popover-label { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; background: var(--dm-popover-label-bg, rgba(99, 102, 241, 0.12)); color: var(--dm-popover-label-color, #1c134f); border: 1px solid var(--dm-popover-label-border, transparent); }
            .dm-map-viewer__popover-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #334155; }
            .dm-map-viewer__popover-list li { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; }
            .dm-map-viewer__popover-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dm-status-color, #6366f1); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15); }
            .dm-map-viewer__popover-empty { font-size: 0.85rem; color: #64748b; text-align: center; }
            .dm-map-viewer__popover-cta { border: none; border-radius: 10px; padding: 10px 18px; background: #4d38ff; color: #ffffff; font-weight: 600; font-size: 0.9rem; cursor: pointer; align-self: center; min-width: 140px; text-align: center; transition: transform 0.15s ease, box-shadow 0.15s ease; box-shadow: 0 12px 24px rgba(77, 56, 255, 0.18); }
            .dm-map-viewer__popover-cta:hover { transform: translateY(-1px); box-shadow: 0 16px 32px rgba(77, 56, 255, 0.26); }
            .dm-map-viewer__popover-cta:active { transform: translateY(0); }
        `;
        document.head.appendChild(style);
    }

    const STATUS_FALLBACK_COLOR = '#6366f1';

    function clamp(value, min, max) {
        if (!Number.isFinite(value)) {
            return min;
        }
        return Math.min(max, Math.max(min, value));
    }

    function toRgba(color, alpha = 1) {
        const safeAlpha = clamp(alpha, 0, 1);
        if (!color || typeof color !== 'string') {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const trimmed = color.trim();
        if (trimmed.startsWith('rgb')) {
            if (trimmed.startsWith('rgba')) {
                return trimmed;
            }
            const values = trimmed
                .replace(/rgba?\(([^)]+)\)/, '$1')
                .split(',')
                .map((part) => Number(part.trim()));
            if (values.length >= 3) {
                const [r, g, b] = values;
                return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
            }
        }
        const hex = trimmed.replace('#', '');
        if (!hex) {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const normalised = hex.length === 3 ? hex.split('').map((token) => token + token).join('') : hex.substring(0, 6);
        const numeric = Number.parseInt(normalised, 16);
        if (Number.isNaN(numeric)) {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const r = (numeric >> 16) & 255;
        const g = (numeric >> 8) & 255;
        const b = numeric & 255;
        return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }

    function normaliseStatusId(value) {
        return String(value ?? '').trim();
    }

    function parsePriceValue(value) {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : Number.NaN;
        }
        if (typeof value !== 'string') {
            return Number.NaN;
        }
        const cleaned = value
            .replace(/\s+/g, '')
            .replace(/[^0-9,.-]/g, '')
            .replace(/,(?=\d{3}(?:[^0-9]|$))/g, '')
            .replace(/\.(?=\d{3}(?:[^0-9]|$))/g, '');
        const normalised = cleaned.includes(',') && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned;
        const numeric = Number(normalised);
        return Number.isFinite(numeric) ? numeric : Number.NaN;
    }

    // Legacy popup implementation moved to public/assets/frontend/map-popup-backup.js.

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    const withCacheBusting = (url) => {
        if (!url || typeof url !== 'string') {
            return url;
        }
        try {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.set('_', String(Date.now()));
            return urlObj.toString();
        } catch (error) {
            const delimiter = url.includes('?') ? '&' : '?';
            return `${url}${delimiter}_=${Date.now()}`;
        }
    };

    const normaliseUrl = (value) => {
        if (!value) {
            return '';
        }
        const trimmed = String(value).trim();
        if (!trimmed) {
            return '';
        }
        try {
            const resolved = new URL(trimmed, window.location.origin);
            return resolved.toString();
        } catch (error) {
            return trimmed;
        }
    };

    async function renderMap(container) {
        const key = container.dataset.dmMapKey;
        if (!key) {
            container.innerHTML = '<p class="dm-map-viewer__error">Chýba identifikátor mapy.</p>';
            return;
        }

        container.classList.add('dm-map-viewer');
        container.innerHTML = '<p class="dm-map-viewer__loading">Načítavam mapu…</p>';

        ensureStyles();

        try {
            // Pokús sa o štandardný REST API endpoint
            let response = await fetch(withCacheBusting(`${endpoint}?public_key=${encodeURIComponent(key)}`), {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
            });

            // Ak zlyhá (404 = REST API endpoint neexistuje), skús alternatívny endpoint
            if (!response.ok && response.status === 404) {
                console.warn('[Developer Map] Standard REST API endpoint failed, trying alternative endpoint...');
                const pluginUrl = window.location.origin + '/wp-content/plugins/developer-map';
                const alternativeUrl = `${pluginUrl}/get-project.php?public_key=${encodeURIComponent(key)}`;
                
                response = await fetch(withCacheBusting(alternativeUrl), {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Cache-Control': 'no-cache',
                    },
                    cache: 'no-store',
                });
            }

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            const project = payload?.project;

            if (!project || typeof project !== 'object') {
                throw new Error('Missing project payload');
            }

            const title = project.name ?? project.title ?? key;
            const description = project.description ?? '';
            const floors = Array.isArray(project.floors) ? project.floors : [];

            // Poskladaj kandidátov na URL obrázka v poradí preferencie
            const imageCandidates = [
                project.image,
                project.imageUrl,
                project.imageurl,
                project.img,
                project?.media?.image,
                project?.media?.heroImage,
            ];

            let imageUrl = '';

            for (const candidate of imageCandidates) {
                if (!candidate) {
                    continue;
                }
                if (typeof candidate === 'string') {
                    const trimmed = candidate.trim();
                    if (trimmed.length > 0) {
                        imageUrl = trimmed;
                        break;
                    }
                    continue;
                }
                if (typeof candidate === 'object') {
                    const nested = candidate.url ?? candidate.src ?? candidate.href ?? candidate.link ?? '';
                    if (typeof nested === 'string' && nested.trim().length > 0) {
                        imageUrl = nested.trim();
                        break;
                    }
                }
            }

            // Debug výpis do konzoly pre chýbajúci obrázok
            if (!imageUrl) {
                console.warn('[Developer Map] Missing image URL for project:', key);
                console.log('[Developer Map] Project data:', project);
            }
            
            const rendererOptions = project.renderer ?? {};
            const viewbox = rendererOptions.size ?? { width: 1280, height: 720 };
            const regions = Array.isArray(project.regions) ? project.regions : [];
            const statuses = Array.isArray(project?.palette?.statuses) ? project.palette.statuses : [];

            const lookupStatus = (statusId) => {
                const sought = String(statusId ?? '').trim();
                if (!sought) return null;
                return (
                    statuses.find((status) => String(status.key) === sought) ||
                    statuses.find((status) => String(status.id ?? '') === sought) ||
                    null
                );
            };

            const baseWidth = viewbox.width || 1280;
            const baseHeight = viewbox.height || 720;

            const polygonsMarkup = regions
                .map((region) => {
                    const points = Array.isArray(region?.geometry?.points) ? region.geometry.points : [];
                    if (points.length < 3) {
                        return '';
                    }
                    const status = lookupStatus(region.statusId ?? region.status);
                    const statusLabel = status?.label ?? region.statusLabel ?? '';
                    const color = status?.color ?? '#6366f1';
                    const pointsAttr = points
                        .map(([x, y]) => {
                            const px = Number(x) * baseWidth;
                            const py = Number(y) * baseHeight;
                            return `${px},${py}`;
                        })
                        .join(' ');
                    return `
                        <polygon
                            class="dm-map-viewer__region"
                            data-region-id="${escapeHtml(region.id)}"
                            points="${escapeHtml(pointsAttr)}"
                            style="--dm-region-color:${escapeHtml(color)}"
                            tabindex="0"
                        ></polygon>
                    `;
                })
                .join('');

            // Zobraz iba interaktívny obrázok bez zoznamu lokalít
            container.innerHTML = `
                <div class="dm-map-viewer__surface">
                    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="dm-map-viewer__image" />` : '<p class="dm-map-viewer__error">Chýba obrázok mapy. Nahrajte obrázok v administrácii.</p>'}
                    ${imageUrl ? `<svg class="dm-map-viewer__overlay" viewBox="0 0 ${escapeHtml(String(baseWidth))} ${escapeHtml(String(baseHeight))}" aria-hidden="true">
                        <g class="dm-map-viewer__regions">${polygonsMarkup}</g>
                    </svg>` : ''}
                </div>
            `;

            const surface = container.querySelector('.dm-map-viewer__surface');
            const overlay = container.querySelector('.dm-map-viewer__overlay');
            const surfaceImage = container.querySelector('.dm-map-viewer__image');

            if (!surface || !overlay) {
                console.warn('[Developer Map] Rendering surface missing for map viewer.');
                return;
            }
            const regionElements = Array.from(container.querySelectorAll('.dm-map-viewer__region'));

            const sanitiseId = (value) => String(value ?? '').trim();

            const parseRegionChildKey = (value) => {
                if (value && typeof value === 'object') {
                    const rawId = value.id ?? value.target ?? value.value ?? value.uuid;
                    const id = sanitiseId(rawId);
                    if (!id) {
                        return null;
                    }
                    const rawType = String(value.type ?? value.kind ?? value.nodeType ?? value.node_type ?? '').toLowerCase();
                    const type = rawType === 'map' || rawType === 'project' ? 'map' : 'location';
                    return {
                        type,
                        id,
                        key: type === 'map' ? `map:${id}` : `location:${id}`,
                    };
                }
                const raw = sanitiseId(value);
                if (!raw) {
                    return null;
                }
                const colonIndex = raw.indexOf(':');
                if (colonIndex <= 0) {
                    return { type: 'location', key: raw, id: raw };
                }
                const prefix = raw.slice(0, colonIndex).toLowerCase();
                const remainder = sanitiseId(raw.slice(colonIndex + 1));
                if (!remainder) {
                    return null;
                }
                if (prefix === 'map' || prefix === 'project') {
                    return { type: 'map', key: raw, id: remainder };
                }
                return { type: 'location', key: raw, id: remainder };
            };

            const projectRegistry = new Map();
            const registerProjectNode = (candidate) => {
                if (!candidate || typeof candidate !== 'object') {
                    return;
                }
                if (!Array.isArray(candidate.floors)) {
                    return;
                }
                const projectIdCandidate = sanitiseId(
                    candidate.id ?? candidate.projectId ?? candidate.uuid ?? candidate.shortcode ?? '',
                );
                if (!projectIdCandidate || projectRegistry.has(projectIdCandidate)) {
                    return;
                }
                projectRegistry.set(projectIdCandidate, candidate);
            };

            const rootProjectId = sanitiseId(
                project.id ?? project.projectId ?? project.uuid ?? project.shortcode ?? '',
            );
            if (rootProjectId) {
                registerProjectNode(project);
            }

            const visitedPayloadNodes = new WeakSet();
            const traversePayload = (value) => {
                if (!value || typeof value !== 'object') {
                    return;
                }
                if (visitedPayloadNodes.has(value)) {
                    return;
                }
                visitedPayloadNodes.add(value);
                if (Array.isArray(value)) {
                    value.forEach(traversePayload);
                    return;
                }
                registerProjectNode(value);
                Object.keys(value).forEach((key) => {
                    traversePayload(value[key]);
                });
            };
            traversePayload(project);

            const linkedProjects = Array.isArray(payload?.linkedProjects) ? payload.linkedProjects : [];
            linkedProjects.forEach((linkedProject) => {
                traversePayload(linkedProject);
            });

            if (rootProjectId && !projectRegistry.has(rootProjectId)) {
                projectRegistry.set(rootProjectId, project);
            }

            const mapChildrenByProjectId = new Map();
            projectRegistry.forEach((projectNode, projectId) => {
                const regionsList = Array.isArray(projectNode?.regions) ? projectNode.regions : [];
                regionsList.forEach((region) => {
                    const rawChildren = Array.isArray(region?.children) ? region.children : [];
                    rawChildren.forEach((child) => {
                        const parsed = parseRegionChildKey(child);
                        if (!parsed || parsed.type !== 'map' || !parsed.id) {
                            return;
                        }
                        const childId = sanitiseId(parsed.id);
                        if (!childId || childId === projectId) {
                            return;
                        }
                        if (!mapChildrenByProjectId.has(projectId)) {
                            mapChildrenByProjectId.set(projectId, new Set());
                        }
                        mapChildrenByProjectId.get(projectId).add(childId);
                    });
                });
            });

            const floorById = new Map();
            const registerFloorKeys = (floor, rawKeys, ownerId) => {
                if (!floor || typeof floor !== 'object') {
                    return;
                }
                const keys = rawKeys
                    .filter((candidate) => candidate !== null && candidate !== undefined)
                    .map((candidate) => sanitiseId(candidate))
                    .filter(Boolean);
                if (!keys.length) {
                    return;
                }
                const ownerKey = sanitiseId(ownerId);
                const storedFloor = (() => {
                    const clone = { ...floor };
                    if (ownerKey) {
                        clone.__dmOwnerMapId = ownerKey;
                    }
                    return clone;
                })();
                keys.forEach((key) => {
                    if (!floorById.has(key)) {
                        floorById.set(key, storedFloor);
                    }
                    if (!key.includes(':')) {
                        const prefixed = `location:${key}`;
                        if (!floorById.has(prefixed)) {
                            floorById.set(prefixed, storedFloor);
                        }
                    }
                });
            };

            const registerProjectFloors = (projectNode, projectId) => {
                const floorsList = Array.isArray(projectNode?.floors) ? projectNode.floors : [];
                floorsList.forEach((floor) => {
                    registerFloorKeys(floor, [
                        floor?.id,
                        floor?.floorId,
                        floor?.uuid,
                        floor?.slug,
                        floor?.shortcode,
                        floor?.code,
                        floor?.identifier,
                        floor?.externalId,
                        floor?.externalID,
                        floor?.meta?.id,
                        floor?.meta?.floorId,
                        floor?.meta?.uuid,
                        floor?.meta?.slug,
                        floor?.meta?.shortcode,
                        floor?.meta?.identifier,
                    ], projectId);
                });
            };

            if (rootProjectId) {
                registerProjectFloors(project, rootProjectId);
            } else {
                registerProjectFloors(project, '');
            }
            projectRegistry.forEach((projectNode, projectId) => {
                if (projectNode === project && projectId === rootProjectId) {
                    return;
                }
                registerProjectFloors(projectNode, projectId);
            });

            const wrapFloorForOwner = (floor, ownerId) => {
                if (!floor || typeof floor !== 'object') {
                    return null;
                }
                const canonicalKey = sanitiseId(
                    floor.id ??
                        floor.floorId ??
                        floor.uuid ??
                        floor.slug ??
                        floor.shortcode ??
                        floor.identifier ??
                        floor.externalId ??
                        floor.externalID ??
                        '',
                );
                if (canonicalKey && floorById.has(canonicalKey)) {
                    return floorById.get(canonicalKey);
                }
                if (canonicalKey && floorById.has(`location:${canonicalKey}`)) {
                    return floorById.get(`location:${canonicalKey}`);
                }
                const clone = { ...floor };
                const ownerKey = sanitiseId(ownerId);
                if (ownerKey) {
                    clone.__dmOwnerMapId = ownerKey;
                }
                return clone;
            };

            const aggregateFloorCache = new Map();
            const collectProjectFloors = (projectId, stack = new Set()) => {
                const normalisedId = sanitiseId(projectId);
                if (!normalisedId) {
                    return [];
                }
                if (aggregateFloorCache.has(normalisedId)) {
                    return aggregateFloorCache.get(normalisedId);
                }
                if (stack.has(normalisedId)) {
                    return [];
                }
                stack.add(normalisedId);
                const projectNode = projectRegistry.get(normalisedId);
                if (!projectNode) {
                    stack.delete(normalisedId);
                    aggregateFloorCache.set(normalisedId, []);
                    return [];
                }
                const aggregate = [];
                const floorsList = Array.isArray(projectNode?.floors) ? projectNode.floors : [];
                floorsList.forEach((floor) => {
                    const wrapped = wrapFloorForOwner(floor, normalisedId);
                    if (wrapped) {
                        aggregate.push(wrapped);
                    }
                });
                const childSet = mapChildrenByProjectId.get(normalisedId);
                if (childSet) {
                    childSet.forEach((childId) => {
                        const descendantFloors = collectProjectFloors(childId, stack);
                        if (descendantFloors.length) {
                            aggregate.push(...descendantFloors);
                        }
                    });
                }
                stack.delete(normalisedId);
                aggregateFloorCache.set(normalisedId, aggregate);
                return aggregate;
            };

            const projectRegionEntryCache = new Map();
            const collectProjectRegionEntries = (projectId, stack = new Set()) => {
                const normalisedId = sanitiseId(projectId);
                if (!normalisedId) {
                    return [];
                }
                if (projectRegionEntryCache.has(normalisedId)) {
                    return projectRegionEntryCache.get(normalisedId);
                }
                if (stack.has(normalisedId)) {
                    return [];
                }
                stack.add(normalisedId);
                const projectNode = projectRegistry.get(normalisedId);
                if (!projectNode) {
                    stack.delete(normalisedId);
                    projectRegionEntryCache.set(normalisedId, []);
                    return [];
                }

                const entries = [];
                const regionsList = Array.isArray(projectNode?.regions) ? projectNode.regions : [];
                regionsList.forEach((region, index) => {
                    if (!region || typeof region !== 'object') {
                        return;
                    }

                    const children = Array.isArray(region.children) ? region.children : [];
                    let hasLocationChild = false;
                    children.forEach((childValue) => {
                        const parsedChild = parseRegionChildKey(childValue);
                        if (!parsedChild) {
                            return;
                        }
                        if (parsedChild.type === 'map' && parsedChild.id) {
                            const descendant = collectProjectRegionEntries(parsedChild.id, stack);
                            if (descendant.length) {
                                descendant.forEach((item) => entries.push(item));
                            }
                        }
                        if (parsedChild.type === 'location') {
                            hasLocationChild = true;
                        }
                    });

                    const statusIdCandidate = sanitiseId(
                        region.statusId ??
                            region.status ??
                            region.paletteStatus ??
                            region.meta?.status ??
                            region.meta?.statusId ??
                            region.meta?.paletteStatus ??
                            '',
                    );
                    const labelCandidateRaw =
                        region.statusLabel ??
                        region.label ??
                        region.name ??
                        region.meta?.statusLabel ??
                        region.meta?.label ??
                        '';
                    const labelCandidate = String(labelCandidateRaw ?? '').trim();
                    const colorCandidate =
                        region.statusColor ??
                        region.color ??
                        region.meta?.statusColor ??
                        region.meta?.color ??
                        '';

                    const hasStatusInfo = Boolean(
                        statusIdCandidate ||
                            (typeof region.status === 'string' && region.status.trim() !== '') ||
                            labelCandidate,
                    );

                    if (!hasStatusInfo) {
                        return;
                    }

                    const pseudoIdBase = region.id ? String(region.id) : `index-${index}`;
                    const pseudoFloor = {
                        id: `region:${normalisedId}:${pseudoIdBase}`,
                        statusId: statusIdCandidate || region.status || region.statusLabel || '',
                        status: region.status ?? '',
                        statusLabel: labelCandidate || statusIdCandidate || region.label || '',
                        statusColor: colorCandidate,
                        __dmOwnerMapId: normalisedId,
                    };

                    // If region has explicit location children, prefer child data when present.
                    if (!hasLocationChild) {
                        entries.push(pseudoFloor);
                    } else if (!children.length) {
                        entries.push(pseudoFloor);
                    }
                });

                stack.delete(normalisedId);
                projectRegionEntryCache.set(normalisedId, entries);
                return entries;
            };

            const regionById = new Map();
            regions.forEach((region) => {
                if (!region || region.id === undefined || region.id === null) {
                    return;
                }
                regionById.set(String(region.id), region);
            });

            const popover = document.createElement('div');
            popover.className = 'dm-map-viewer__popover';
            popover.innerHTML = `
                <div class="dm-map-viewer__popover-card">
                    <div class="dm-map-viewer__popover-summary" data-role="summary"></div>
                    <ul class="dm-map-viewer__popover-list" data-role="list"></ul>
                    <div class="dm-map-viewer__popover-empty" data-role="empty"></div>
                    <button type="button" class="dm-map-viewer__popover-cta" data-role="cta">Detail</button>
                </div>
            `;
            surface.appendChild(popover);
            const summaryEl = popover.querySelector('[data-role="summary"]');
            const listEl = popover.querySelector('[data-role="list"]');
            const emptyEl = popover.querySelector('[data-role="empty"]');
            const ctaButton = popover.querySelector('[data-role="cta"]');
            listEl.hidden = true;
            emptyEl.hidden = true;
            let activeRegionId = null;

            const normaliseLabel = (value) => {
                const str = String(value ?? '').trim().toLowerCase();
                if (!str) {
                    return '';
                }
                let normalised = str;
                try {
                    normalised = str.normalize('NFD');
                } catch (error) {
                    normalised = str;
                }
                return normalised.replace(/[\u0300-\u036f]/g, '');
            };

            const parseAvailability = (statusInfo, statusIdRaw, label) => {
                const explicit = statusInfo?.available;
                if (typeof explicit === 'boolean') {
                    return explicit;
                }
                if (typeof explicit === 'string') {
                    const value = explicit.trim().toLowerCase();
                    if (['true', '1', 'yes', 'ano'].includes(value)) {
                        return true;
                    }
                    if (['false', '0', 'no', 'nie'].includes(value)) {
                        return false;
                    }
                }
                const labelNormalized = normaliseLabel(label);
                const keyNormalized = normaliseLabel(statusInfo?.key ?? statusIdRaw);
                return AVAILABLE_KEYWORDS.some(
                    (keyword) =>
                        labelNormalized.includes(keyword) ||
                        (keyNormalized ? keyNormalized.includes(keyword) : false),
                );
            };

            const summariseRegion = (region) => {
                const children = Array.isArray(region?.children) ? region.children : [];
                const entriesMap = new Map();
                const linkedFloors = [];
                const seenFloorKeys = new Set();
                const seenFloorObjects = new WeakSet();
                let availableCount = 0;

                const addFloorToSummary = (floor, fallbackKey) => {
                    if (!floor || typeof floor !== 'object') {
                        return;
                    }

                    const fallback = sanitiseId(fallbackKey);
                    const candidateKeys = [
                        floor?.id,
                        floor?.floorId,
                        floor?.uuid,
                        floor?.slug,
                        floor?.shortcode,
                        floor?.identifier,
                        floor?.externalId,
                        floor?.externalID,
                        floor?.locationId,
                        floor?.location?.id,
                        floor?.meta?.id,
                        floor?.meta?.floorId,
                        floor?.meta?.uuid,
                        floor?.meta?.slug,
                        floor?.meta?.shortcode,
                        floor?.meta?.identifier,
                    ]
                        .map((candidate) => sanitiseId(candidate))
                        .filter(Boolean);

                    if (fallback && !fallback.toLowerCase().startsWith('map:')) {
                        candidateKeys.push(fallback);
                    }

                    const uniqueCandidates = Array.from(new Set(candidateKeys));

                    if (uniqueCandidates.length) {
                        const dedupeVariants = uniqueCandidates.map((candidate) =>
                            candidate.includes(':') ? candidate : `location:${candidate}`,
                        );
                        if (dedupeVariants.some((variant) => seenFloorKeys.has(variant))) {
                            return;
                        }
                        dedupeVariants.forEach((variant) => seenFloorKeys.add(variant));
                    } else if (seenFloorObjects.has(floor)) {
                        return;
                    }

                    if (seenFloorObjects.has(floor)) {
                        return;
                    }
                    seenFloorObjects.add(floor);

                    linkedFloors.push(floor);

                    const statusIdRaw = sanitiseId(floor.statusId ?? floor.status ?? '');
                    const statusInfo = lookupStatus(statusIdRaw);
                    const label =
                        statusInfo?.label ??
                        floor.statusLabel ??
                        (statusIdRaw || 'Bez stavu');
                    const key = (statusInfo?.id ?? statusInfo?.key ?? statusIdRaw) || label;
                    const color = statusInfo?.color ?? floor.statusColor ?? '#6366f1';
                    const normalisedLabel = normaliseLabel(label);
                    const entry =
                        entriesMap.get(key) ?? {
                            label,
                            color,
                            count: 0,
                            normalisedLabel,
                            isAvailable: false,
                            isReserved: false,
                            isSold: false,
                        };
                    entry.count += 1;
                    if (color) {
                        entry.color = color;
                    }
                    entry.normalisedLabel = normalisedLabel || entry.normalisedLabel;
                    const isAvailable = parseAvailability(statusInfo, statusIdRaw, label);
                    if (isAvailable) {
                        availableCount += 1;
                        entry.isAvailable = true;
                    }
                    if (normalisedLabel.includes('rezerv')) {
                        entry.isReserved = true;
                    }
                    if (normalisedLabel.includes('predan')) {
                        entry.isSold = true;
                    }
                    entriesMap.set(key, entry);
                };

                children.forEach((childValue) => {
                    const parsed = parseRegionChildKey(childValue);
                    if (!parsed) {
                        return;
                    }
                    if (parsed.type === 'map' && parsed.id) {
                        const descendantFloors = collectProjectFloors(parsed.id);
                        if (descendantFloors.length) {
                            descendantFloors.forEach((floor) => addFloorToSummary(floor, parsed.key));
                        } else {
                            const derivedRegionEntries = collectProjectRegionEntries(parsed.id);
                            derivedRegionEntries.forEach((pseudoFloor) => addFloorToSummary(pseudoFloor, parsed.key));
                        }
                        return;
                    }
                    if (parsed.type !== 'location') {
                        return;
                    }

                    const candidateKeys = [];
                    if (parsed.key) {
                        candidateKeys.push(parsed.key);
                    }
                    if (parsed.id) {
                        candidateKeys.push(parsed.id);
                        if (!parsed.id.includes(':')) {
                            candidateKeys.push(`location:${parsed.id}`);
                        }
                    }

                    let floor = null;
                    for (const candidate of candidateKeys) {
                        const lookupKey = sanitiseId(candidate);
                        if (!lookupKey) {
                            continue;
                        }
                        floor = floorById.get(lookupKey);
                        if (floor) {
                            break;
                        }
                    }
                    if (!floor) {
                        return;
                    }
                    addFloorToSummary(floor, parsed.key ?? parsed.id);
                });

                const entries = Array.from(entriesMap.values()).sort((a, b) => b.count - a.count);
                return { entries, linkedFloors, availableCount };
            };

            const baseFillColor = '#3f4cff';
            const positiveFillColor = '#1f8b4e';
            const reservedFillColor = '#f97316';
            const negativeFillColor = '#c53030';
            const neutralFillColor = '#62718d';
            const idleAlpha = 0.45;
            const hoverAlpha = 0.68;
            const selectedAlpha = 0.82;
            const idleStrokeAlpha = 0.6;
            const hoverStrokeAlpha = 0.8;
            const selectedStrokeAlpha = 0.95;
            const idleOpacity = 0.55;
            const hoverOpacity = 0.75;
            const selectedOpacity = 0.9;
            const headlinePreparingColor = '#64748b';
            const headlineDefaultColor = '#1c134f';

            const sanitiseColorValue = (value, fallback) => {
                const raw = String(value ?? '').trim();
                if (!raw) {
                    return fallback;
                }
                const lower = raw.toLowerCase();
                if (lower.startsWith('var(') || lower.startsWith('rgb(') || lower.startsWith('rgba(') || lower.startsWith('hsl(') || lower.startsWith('hsla(')) {
                    return raw;
                }
                if (lower.startsWith('#')) {
                    const trimmed = lower.replace(/[^0-9a-f]/g, '');
                    if (trimmed.length === 3 || trimmed.length === 4 || trimmed.length === 6 || trimmed.length === 8) {
                        return `#${trimmed}`;
                    }
                    return fallback;
                }
                const hexCandidate = lower.replace(/[^0-9a-f]/g, '');
                if (hexCandidate.length === 3 || hexCandidate.length === 6 || hexCandidate.length === 8) {
                    return `#${hexCandidate}`;
                }
                return fallback;
            };

            const resolveRegionState = (summary) => {
                const emptyState = {
                    state: 'preparing',
                    headline: 'Pripravujeme',
                    headlineColor: headlinePreparingColor,
                    fillColor: neutralFillColor,
                    alphaBoost: 0,
                    strokeBoost: 0,
                    opacityBoost: 0,
                };

                if (!summary || !Array.isArray(summary.entries) || summary.entries.length === 0) {
                    return emptyState;
                }

                const primaryEntry = summary.entries[0] ?? null;
                const availableEntry = summary.entries.find((entry) => entry.isAvailable);
                const reservedEntry = summary.entries.find((entry) => entry.isReserved);
                const soldEntry = summary.entries.find((entry) => entry.isSold);

                if (availableEntry) {
                    const color = sanitiseColorValue(availableEntry.color, positiveFillColor);
                    const headline = availableEntry.label || 'Dostupné';
                    return {
                        state: 'available',
                        headline,
                        headlineColor: color,
                        fillColor: color,
                        alphaBoost: 0.08,
                        strokeBoost: 0.08,
                        opacityBoost: 0.08,
                    };
                }
                if (reservedEntry) {
                    const color = sanitiseColorValue(reservedEntry.color, reservedFillColor);
                    const headline = reservedEntry.label || 'Rezervované';
                    return {
                        state: 'reserved',
                        headline,
                        headlineColor: color,
                        fillColor: color,
                        alphaBoost: 0.06,
                        strokeBoost: 0.06,
                        opacityBoost: 0.06,
                    };
                }
                if (soldEntry) {
                    const color = sanitiseColorValue(soldEntry.color, negativeFillColor);
                    const headline = soldEntry.label || 'Predané';
                    return {
                        state: 'sold',
                        headline,
                        headlineColor: color,
                        fillColor: color,
                        alphaBoost: 0.06,
                        strokeBoost: 0.06,
                        opacityBoost: 0.06,
                    };
                }
                if (primaryEntry && primaryEntry.label) {
                    const color = sanitiseColorValue(primaryEntry.color, neutralFillColor);
                    return {
                        state: 'custom',
                        headline: primaryEntry.label,
                        headlineColor: color,
                        fillColor: color,
                        alphaBoost: 0.14,
                        strokeBoost: 0.12,
                        opacityBoost: 0.12,
                    };
                }
                return emptyState;
            };

            const applyRegionFill = (polygon, summary) => {
                if (!polygon) {
                    return;
                }
                const {
                    state,
                    fillColor = baseFillColor,
                    alphaBoost = 0,
                    strokeBoost = 0,
                    opacityBoost = 0,
                } = resolveRegionState(summary);
                const color = fillColor || baseFillColor;

                const isSelected = polygon.dataset.dmSelected === 'true';
                const isHover = polygon.dataset.dmHover === 'true';
                const alphaBase = isSelected ? selectedAlpha : isHover ? hoverAlpha : idleAlpha;
                const strokeBase = isSelected ? selectedStrokeAlpha : isHover ? hoverStrokeAlpha : idleStrokeAlpha;
                const opacityBase = isSelected ? selectedOpacity : isHover ? hoverOpacity : idleOpacity;
                const alpha = clamp(alphaBase + alphaBoost, 0, 1);
                const strokeAlpha = clamp(strokeBase + strokeBoost, 0, 1);
                const opacity = clamp(opacityBase + opacityBoost, 0, 1);

                polygon.style.fill = toRgba(color, alpha);
                polygon.style.stroke = toRgba(color, strokeAlpha);
                polygon.style.strokeWidth = '1';
                polygon.style.strokeLinejoin = 'round';
                polygon.style.strokeLinecap = 'round';
                polygon.style.paintOrder = 'fill stroke';
                polygon.style.vectorEffect = 'non-scaling-stroke';
                polygon.style.opacity = String(opacity);
                switch (state) {
                    case 'available':
                        polygon.dataset.dmAvailability = 'available';
                        break;
                    case 'reserved':
                        polygon.dataset.dmAvailability = 'reserved';
                        break;
                    case 'sold':
                        polygon.dataset.dmAvailability = 'unavailable';
                        break;
                    case 'custom':
                        polygon.dataset.dmAvailability = 'custom';
                        break;
                    default:
                        polygon.dataset.dmAvailability = 'empty';
                        break;
                }
                polygon.dataset.dmStatusState = state;
                polygon.dataset.dmStatusColor = color;
            };

            const renderPopover = (region, summary) => {
                const { headline, headlineColor } = resolveRegionState(summary);
                const tone = headlineColor || headlineDefaultColor;
                summaryEl.innerHTML = `<strong style="color:${escapeHtml(tone)}">${escapeHtml(headline)}</strong>`;
                listEl.hidden = true;
                listEl.innerHTML = '';
                emptyEl.hidden = true;
                emptyEl.textContent = '';
            };

            const positionPopover = (polygon) => {
                if (!overlay || !surface || popover.style.display === 'none') {
                    return;
                }
                const bbox = polygon.getBBox();
                const overlayRect = overlay.getBoundingClientRect();
                const surfaceRect = surface.getBoundingClientRect();
                const scaleX = overlayRect.width / baseWidth;
                const scaleY = overlayRect.height / baseHeight;
                const centerX = (bbox.x + bbox.width / 2) * scaleX;
                const topY = bbox.y * scaleY;

                const cardRect = popover.getBoundingClientRect();
                let left = centerX - cardRect.width / 2;
                let top = topY - cardRect.height - 16;
                if (top < 8) {
                    top = (bbox.y + bbox.height) * scaleY + 16;
                }
                left = Math.max(8, Math.min(left, surfaceRect.width - cardRect.width - 8));
                top = Math.max(8, Math.min(top, surfaceRect.height - cardRect.height - 8));
                popover.style.left = `${left}px`;
                popover.style.top = `${top}px`;
            };

            const hidePopover = () => {
                if (!activeRegionId) {
                    return;
                }
                activeRegionId = null;
                popover.style.display = 'none';
                popover.classList.remove('is-visible');
                summaryEl.textContent = '';
                listEl.innerHTML = '';
                listEl.hidden = true;
                emptyEl.textContent = '';
                emptyEl.hidden = true;
                ctaButton.hidden = true;
                ctaButton.onclick = null;
                regionElements.forEach((polygon) => {
                    polygon.classList.remove('is-active');
                    polygon.dataset.dmSelected = 'false';
                    polygon.dataset.dmHover = 'false';
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
            };

            const showPopover = (region, polygon) => {
                const summary = summariseRegion(region);
                renderPopover(region, summary);

                const detailUrlCandidate = normaliseUrl(
                    region?.meta?.detailUrl ??
                    region?.meta?.url ??
                    region?.detailUrl ??
                    region?.url ??
                    (() => {
                        const withUrl = summary.linkedFloors.find((floor) => floor.detailUrl || floor.url);
                        const fallback = withUrl ? withUrl.detailUrl ?? withUrl.url : '';
                        return normaliseUrl(fallback);
                    })()
                );

                ctaButton.hidden = !detailUrlCandidate && !summary.linkedFloors.length;
                ctaButton.dataset.href = detailUrlCandidate || '';
                ctaButton.onclick = (event) => {
                    event.preventDefault();
                    const detailPayload = {
                        region,
                        floors: summary.linkedFloors,
                        project,
                        statuses,
                    };
                    const detailEvent = new CustomEvent('dmRegionDetail', {
                        detail: detailPayload,
                        cancelable: true,
                        bubbles: true,
                    });
                    const notCancelled = container.dispatchEvent(detailEvent);
                    if (notCancelled && detailUrlCandidate) {
                        window.location.href = detailUrlCandidate;
                    }
                };

                popover.style.display = 'block';
                popover.classList.add('is-visible');
                positionPopover(polygon);
                applyRegionFill(polygon, summary);
            };

            const openRegion = (polygon) => {
                const regionId = polygon.getAttribute('data-region-id');
                if (!regionId) {
                    return;
                }
                const region = regionById.get(regionId);
                if (!region) {
                    return;
                }
                if (activeRegionId === regionId) {
                    hidePopover();
                    return;
                }
                activeRegionId = regionId;
                regionElements.forEach((el) => {
                    const regionInstance = regionById.get(el.getAttribute('data-region-id'));
                    const isSelected = el === polygon;
                    el.dataset.dmSelected = isSelected ? 'true' : 'false';
                    if (!isSelected) {
                        el.dataset.dmHover = 'false';
                    }
                    if (isSelected) {
                        el.classList.add('is-active');
                    } else {
                        el.classList.remove('is-active');
                    }
                    const summary = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(el, summary);
                });
                showPopover(region, polygon);
            };

            regionElements.forEach((polygon) => {
                const region = regionById.get(polygon.getAttribute('data-region-id'));
                const summary = region
                    ? summariseRegion(region)
                    : { entries: [], linkedFloors: [], availableCount: 0 };
                polygon.dataset.dmSelected = 'false';
                polygon.dataset.dmHover = 'false';
                applyRegionFill(polygon, summary);

                polygon.addEventListener('mouseenter', () => {
                    polygon.dataset.dmHover = 'true';
                    polygon.classList.add('is-active');
                    const regionInstance = regionById.get(polygon.getAttribute('data-region-id'));
                    const summaryActive = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summaryActive);
                });
                polygon.addEventListener('mouseleave', () => {
                    polygon.dataset.dmHover = 'false';
                    const isSelected = activeRegionId === polygon.getAttribute('data-region-id');
                    if (!isSelected) {
                        polygon.classList.remove('is-active');
                    }
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
                polygon.addEventListener('focus', () => {
                    polygon.dataset.dmHover = 'true';
                    polygon.classList.add('is-active');
                    const regionInstance = regionById.get(polygon.getAttribute('data-region-id'));
                    const summaryActive = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summaryActive);
                });
                polygon.addEventListener('blur', () => {
                    polygon.dataset.dmHover = 'false';
                    const isSelected = activeRegionId === polygon.getAttribute('data-region-id');
                    if (!isSelected) {
                        polygon.classList.remove('is-active');
                    }
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
                polygon.addEventListener('click', (event) => {
                    event.preventDefault();
                    openRegion(polygon);
                });
                polygon.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openRegion(polygon);
                    } else if (event.key === 'Escape') {
                        hidePopover();
                    }
                });
            });

            const handleDocumentClick = (event) => {
                if (!container.contains(event.target)) {
                    hidePopover();
                    return;
                }
                if (
                    !event.target.closest('.dm-map-viewer__popover') &&
                    !event.target.closest('.dm-map-viewer__region')
                ) {
                    hidePopover();
                }
            };
            document.addEventListener('click', handleDocumentClick);
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    hidePopover();
                }
            });

            const updatePolygonPoints = (width, height) => {
                if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
                    return;
                }
                if (overlay) {
                    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
                }
                regionElements.forEach((polygon) => {
                    const regionId = polygon.getAttribute('data-region-id');
                    const region = regionById.get(regionId);
                    if (!region) {
                        polygon.setAttribute('points', '');
                        applyRegionFill(polygon, { entries: [], linkedFloors: [], availableCount: 0 });
                        return;
                    }
                    const points = Array.isArray(region?.geometry?.points) ? region.geometry.points : [];
                    if (!points.length) {
                        polygon.setAttribute('points', '');
                        applyRegionFill(polygon, { entries: [], linkedFloors: [], availableCount: 0 });
                        return;
                    }
                    const attr = points
                        .map(([x, y]) => {
                            const px = Number(x) * width;
                            const py = Number(y) * height;
                            return `${px},${py}`;
                        })
                        .join(' ');
                    polygon.setAttribute('points', attr);
                    const summary = summariseRegion(region);
                    applyRegionFill(polygon, summary);
                });
                if (activeRegionId) {
                    const activePolygon = regionElements.find(
                        (el) => el.getAttribute('data-region-id') === activeRegionId,
                    );
                    if (activePolygon) {
                        positionPopover(activePolygon);
                    }
                }
            };

            updatePolygonPoints(baseWidth, baseHeight);

            const shouldSyncViewbox =
                !rendererOptions.size ||
                !Number(rendererOptions.size.width) ||
                !Number(rendererOptions.size.height);

            if (surfaceImage && shouldSyncViewbox) {
                const syncToImage = () => {
                    if (surfaceImage.naturalWidth > 0 && surfaceImage.naturalHeight > 0) {
                        updatePolygonPoints(surfaceImage.naturalWidth, surfaceImage.naturalHeight);
                        if (activeRegionId) {
                            const activePolygon = regionElements.find(
                                (el) => el.getAttribute('data-region-id') === activeRegionId,
                            );
                            if (activePolygon) {
                                positionPopover(activePolygon);
                            }
                        }
                    }
                };
                if (surfaceImage.complete) {
                    syncToImage();
                } else {
                    surfaceImage.addEventListener('load', syncToImage, { once: true });
                }
            }

            window.addEventListener('resize', () => {
                if (activeRegionId) {
                    const activePolygon = regionElements.find(
                        (el) => el.getAttribute('data-region-id') === activeRegionId,
                    );
                    if (activePolygon) {
                        positionPopover(activePolygon);
                    }
                }
            });
        } catch (error) {
            console.error('[Developer Map] Failed to load map', error);
            container.innerHTML =
                '<p class="dm-map-viewer__error">Mapa sa nepodarila načítať. Skúste to prosím neskôr.</p>';
        }
    }

    function hydrate() {
        const containers = document.querySelectorAll('[data-dm-map-key]');
        containers.forEach((container) => {
            if (container.dataset.dmMapHydrated === '1') {
                return;
            }
            container.dataset.dmMapHydrated = '1';
            void renderMap(container);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrate, { once: true });
    } else {
        hydrate();
    }
})();
