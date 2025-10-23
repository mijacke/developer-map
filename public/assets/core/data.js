export function createDemoData() {
    return {
        projects: [
            {
                id: '1',
                name: 'Bytovka',
                type: 'Bytovka',
                badge: 'A',
                floors: [
                    { id: 'floor-1', name: 'Poschodie 1', type: 'Bytovka', label: '1. NP', area: '629.00 m²' },
                    { id: 'floor-2', name: 'Poschodie 2', type: 'Bytovka', label: '2. NP', area: '578.00 m²' },
                    { id: 'floor-3', name: 'Poschodie 3', type: 'Bytovka', label: '3. NP', area: '722.00 m²' },
                    { id: 'floor-4', name: 'Poschodie 4', type: 'Bytovka', label: '4. NP', area: '708.00 m²' },
                    { id: 'floor-5', name: 'Poschodie 5', type: 'Bytovka', label: '5. NP', area: '616.00 m²' },
                    { id: 'floor-6', name: 'Poschodie 6', type: 'Bytovka', label: '1. PP', area: '658.00 m²' },
                ],
            },
        ],
        types: [
            { id: 'type-1', label: 'Bytovka', color: '#22c55e' },
            { id: 'type-2', label: 'Dom', color: '#22c55e' },
            { id: 'type-3', label: 'Pozemok', color: '#22c55e' },
        ],
        statuses: [
            { id: 'status-1', label: 'Voľné', color: '#22c55e' },
            { id: 'status-2', label: 'Predané', color: '#22c55e' },
            { id: 'status-3', label: 'Rezervované', color: '#22c55e' },
        ],
        colors: [
            { id: 'color-1', label: 'Farba tlačidiel', value: '#7c3aed' },
            { id: 'color-2', label: 'Farba nadpisov', value: '#111827' },
            { id: 'color-3', label: 'Farba obsahových textov', value: '#6b7280' },
        ],
        fonts: [
            { id: 'font-1', label: 'Font nadpisov' },
            { id: 'font-2', label: 'Font popisových textov' },
            { id: 'font-3', label: 'Font tlačidiel' },
        ],
    };
}
