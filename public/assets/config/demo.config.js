export const demoProjectConfig = {
    id: 'demo-project',
    title: 'Developer Map – Demo Projekt',
    description: 'Dashboard pre správu stavov nehnuteľností s interaktívnou mapou.',
    adapter: {
        type: 'svg',
        options: {
            snapTolerance: 8,
        },
    },
    renderer: {
        type: 'image',
        clamp: true,
        size: {
            width: 1600,
            height: 900,
        },
        source: './media/demo-floorplan-placeholder.svg',
    },
    palette: {
        statuses: [
            {
                key: 'available',
                label: 'Voľný',
                color: '#16a34a',
                hatchClass: 'dm-hatch-available',
            },
            {
                key: 'reserved',
                label: 'Rezervovaný',
                color: '#f97316',
                hatchClass: 'dm-hatch-reserved',
            },
            {
                key: 'sold',
                label: 'Predaný',
                color: '#ef4444',
                hatchClass: 'dm-hatch-sold',
                autoShadeColor: '#fca5a5',
            },
        ],
    },
    lots: [
        {
            id: 'APT-101',
            label: 'Byt 101',
            type: 'apartman',
            status: 'available',
            tags: ['byt', '3+kk'],
            geometry: {
                type: 'polygon',
                points: [
                    [120, 80],
                    [280, 80],
                    [280, 180],
                    [120, 180],
                ],
            },
            meta: {
                area: 78,
                ctaEnabled: false,
            },
        },
        {
            id: 'APT-201',
            label: 'Byt 201',
            type: 'apartman',
            status: 'reserved',
            tags: ['rezervované'],
            geometry: {
                type: 'polygon',
                points: [
                    [320, 100],
                    [480, 100],
                    [480, 220],
                    [320, 220],
                ],
            },
            meta: {
                area: 92,
                ctaEnabled: true,
            },
        },
        {
            id: 'GAR-12',
            label: 'Garáž 12',
            type: 'garaz',
            status: 'sold',
            tags: ['garaz'],
            geometry: {
                type: 'polygon',
                points: [
                    [520, 260],
                    [620, 260],
                    [620, 340],
                    [520, 340],
                ],
            },
            meta: {
                area: 32,
                ctaEnabled: false,
                maskColor: '#fca5a5',
            },
        },
    ],
};

export default demoProjectConfig;
