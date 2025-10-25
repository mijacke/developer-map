/**
 * Demo data pre Developer Map plugin
 * Obsahuje hierarchickú štruktúru projektov (budovy) a ich poschodí
 */
import { MEDIA } from './constants.js';

export function createDemoData() {
    return {
        projects: [
            // Projekt 1: Bytovka s 6 poschodiami
            {
                id: '1',
                name: 'Bytový dom A',
                type: 'Rezidenčný projekt',
                badge: 'A',
                image: MEDIA.building, // Pridaný obrázok projektu
                floors: [
                    { id: 'floor-1', name: '1. poschodie', type: 'Byty 2+kk', label: '1. NP', area: '629.00 m²', image: MEDIA.floor },
                    { id: 'floor-2', name: '2. poschodie', type: 'Byty 3+kk', label: '2. NP', area: '578.00 m²', image: MEDIA.floor },
                    { id: 'floor-3', name: '3. poschodie', type: 'Byty 3+kk', label: '3. NP', area: '722.00 m²' },
                    { id: 'floor-4', name: '4. poschodie', type: 'Byty 4+kk', label: '4. NP', area: '708.00 m²', image: MEDIA.floor },
                    { id: 'floor-5', name: '5. poschodie', type: 'Penthousy', label: '5. NP', area: '616.00 m²' },
                    { id: 'floor-6', name: 'Suterén', type: 'Parkovanie', label: '1. PP', area: '658.00 m²', image: MEDIA.floor },
                ],
            },
            // Projekt 2: Obchodné centrum s 3 podlažiami
            {
                id: '2',
                name: 'Shopping Park',
                type: 'Komerčný projekt',
                badge: 'B',
                image: MEDIA.building, // Pridaný obrázok projektu
                floors: [
                    { id: 'floor-7', name: 'Prízemie', type: 'Retail', label: 'Prízemie', area: '1245.00 m²', image: MEDIA.floor },
                    { id: 'floor-8', name: '1. poschodie', type: 'Food court', label: '1. NP', area: '892.00 m²' },
                    { id: 'floor-9', name: 'Parkovisko', type: 'Parkovacie miesta', label: '1. PP', area: '1580.00 m²', image: MEDIA.floor },
                ],
            },
            // Projekt 3: Kancelárska budova s 8 podlažiami
            {
                id: '3',
                name: 'Business Tower',
                type: 'Administratívna budova',
                badge: 'C',
                image: MEDIA.building, // Pridaný obrázok projektu
                floors: [
                    { id: 'floor-10', name: 'Prízemie', type: 'Recepcia', label: 'Prízemie', area: '425.00 m²' },
                    { id: 'floor-11', name: '1. - 3. poschodie', type: 'Open space', label: '1-3 NP', area: '1890.00 m²', image: MEDIA.floor },
                    { id: 'floor-12', name: '4. - 6. poschodie', type: 'Kancelárie', label: '4-6 NP', area: '1756.00 m²' },
                    { id: 'floor-13', name: '7. poschodie', type: 'Meeting rooms', label: '7. NP', area: '612.00 m²', image: MEDIA.floor },
                    { id: 'floor-14', name: '8. poschodie', type: 'Executive floor', label: '8. NP', area: '598.00 m²' },
                    { id: 'floor-15', name: 'Strecha', type: 'Terasa', label: 'Strecha', area: '340.00 m²', image: MEDIA.floor },
                    { id: 'floor-16', name: 'Suterén -1', type: 'Technické priestory', label: '1. PP', area: '520.00 m²' },
                    { id: 'floor-17', name: 'Suterén -2', type: 'Parkovanie', label: '2. PP', area: '980.00 m²', image: MEDIA.floor },
                ],
            },
            // Projekt 4: Rodinné domy (bez poschodí - ukážka bez hierarchie)
            {
                id: '4',
                name: 'Rodinné domy Záhradná',
                type: 'Rodinné domy',
                badge: 'D',
                floors: [], // Žiadne poschodia - toggle button sa nezobrazí
            },
            // Projekt 5: Vila s bazénom (malý projekt s 2 podlažiami)
            {
                id: '5',
                name: 'Luxury Villa Resort',
                type: 'Luxusné vily',
                badge: 'E',
                image: MEDIA.building, // Pridaný obrázok projektu
                floors: [
                    { id: 'floor-18', name: 'Prízemie + terasa', type: 'Obývacia časť', label: 'Prízemie', area: '285.00 m²', image: MEDIA.floor },
                    { id: 'floor-19', name: '1. poschodie', type: 'Spálne', label: '1. NP', area: '218.00 m²' },
                ],
            },
        ],
        types: [
            { id: 'type-1', label: 'Bytovka', color: '#22c55e' },
            { id: 'type-2', label: 'Dom', color: '#3b82f6' },
            { id: 'type-3', label: 'Pozemok', color: '#f59e0b' },
            { id: 'type-4', label: 'Komerčný priestor', color: '#8b5cf6' },
            { id: 'type-5', label: 'Kancelária', color: '#ec4899' },
        ],
        statuses: [
            { id: 'status-1', label: 'Voľné', color: '#22c55e' },
            { id: 'status-2', label: 'Predané', color: '#ef4444' },
            { id: 'status-3', label: 'Rezervované', color: '#f59e0b' },
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
