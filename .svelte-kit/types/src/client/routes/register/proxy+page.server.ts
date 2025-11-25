// @ts-nocheck
import type { PageServerLoad } from './$types.ts';

export interface Country {
    iso2: string;
    emoji: string;
    name: string;
}

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
    const response = await fetch("/api/countries");

    const countries: Country[] = await response.json();

    return {
        countries: countries
    };
};