export const demoProjectConfig = {
    id: 'demo-project',
    title: 'Developer Map – Demo Projekt',
    publicKey: 'demo-projekt',
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
    regions: [
        {
            id: 'APT-101',
            label: 'Byt 101',
            type: 'apartman',
            status: 'available',
            statusId: 'available',
            tags: ['byt', '3+kk'],
            hatchClass: 'dm-hatch-available',
            geometry: {
                type: 'polygon',
                points: [
                    [0.075, 0.0889],
                    [0.175, 0.0889],
                    [0.175, 0.2],
                    [0.075, 0.2],
                ],
            },
            meta: {
                area: 78,
                ctaEnabled: false,
            },
            children: [],
        },
        {
            id: 'APT-201',
            label: 'Byt 201',
            type: 'apartman',
            status: 'reserved',
            statusId: 'reserved',
            tags: ['rezervované'],
            hatchClass: 'dm-hatch-reserved',
            geometry: {
                type: 'polygon',
                points: [
                    [0.2, 0.1111],
                    [0.3, 0.1111],
                    [0.3, 0.2444],
                    [0.2, 0.2444],
                ],
            },
            meta: {
                area: 92,
                ctaEnabled: true,
            },
            children: [],
        },
        {
            id: 'GAR-12',
            label: 'Garáž 12',
            type: 'garaz',
            status: 'sold',
            statusId: 'sold',
            tags: ['garaz'],
            hatchClass: 'dm-hatch-sold',
            geometry: {
                type: 'polygon',
                points: [
                    [0.325, 0.2889],
                    [0.3875, 0.2889],
                    [0.3875, 0.3778],
                    [0.325, 0.3778],
                ],
            },
            meta: {
                area: 32,
                ctaEnabled: false,
                maskColor: '#fca5a5',
            },
            children: [],
        },
    ],
};

export default demoProjectConfig;
