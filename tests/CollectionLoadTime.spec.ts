import { test, expect } from '@playwright/test';
import { SitemapUtil } from '../utils/SitemapUtil';
import { CollectionPage } from '../pages/CollectionPage';
import { ExcelUtil, CollectionData } from '../utils/ExcelUtil';

test.describe('Collection Load Times', () => {

    test('Measure load time for all collections and generate report', async ({ page }) => {
        // Increase test timeout to handle potentially many collections
        test.setTimeout(120 * 60 * 1000); // 120 minutes

        console.log('Fetching collection URLs from sitemap...');
        const urls = await SitemapUtil.getCollectionUrls(page);
        
        expect(urls.length, 'Should find at least one collection URL in the sitemap').toBeGreaterThan(0);
        console.log(`Found ${urls.length} collections. Starting load time measurement...`);
        
        const results: CollectionData[] = [];
        const collectionPage = new CollectionPage(page);
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`[${i + 1}/${urls.length}] Loading ${url}...`);
            const loadTime = await collectionPage.measureLoadTime(url);
            console.log(`Load time: ${loadTime} s`);
            
            results.push({ url, loadTime });
        }
        
        console.log('Generating Excel report...');
        await ExcelUtil.generateReport(results, 'Ouros_Collections_LoadTime.xlsx');
        console.log('Test completed successfully!');
    });

});
