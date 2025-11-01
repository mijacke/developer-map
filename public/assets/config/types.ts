/**
 * Developer Map Project Configuration Types
 */

export interface DMProjectConfig {
    id: string;
    title: string;
    floors?: Array<{
        id: string;
        name: string;
        source: string;
        type?: string;
    }>;
    palette?: {
        [key: string]: string;
    };
}
