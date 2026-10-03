import { Page } from '@playwright/test';

export class CollectionPage {
    constructor(private page: Page) {}

    async measureLoadTime(url: string): Promise<number> {
        const startTime = Date.now();
        try {
            await this.page.goto(url, { waitUntil: 'load', timeout: 60000 });
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
        }
        const endTime = Date.now();
        return (endTime - startTime) / 1000;
    }
}
