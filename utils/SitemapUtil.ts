import { Page } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';

export class SitemapUtil {
    static async getCollectionUrls(page: Page): Promise<string[]> {
        const sitemapUrl = 'https://www.ourosjewels.com/sitemap_collections_1.xml?from=265542598840&to=512999260464';
        
        try {
            // Using Playwright's page to fetch to bypass some basic bot protections
            // Playwright's context.request shares cookies and some fingerprinting
            const response = await page.request.get(sitemapUrl, {
                headers: {
                    'User-Agent': await page.evaluate(() => navigator.userAgent),
                    'Accept': 'application/xml, text/xml, */*'
                }
            });
            
            if (!response.ok()) {
                console.error(`Sitemap fetch failed with status: ${response.status()}`);
                // fallback to page.content() after navigation if request fails
                await page.goto(sitemapUrl, { waitUntil: 'domcontentloaded' });
                const content = await page.content();
                return SitemapUtil.parseXml(content);
            }

            const data = await response.text();
            return SitemapUtil.parseXml(data);
        } catch (error) {
            console.error('Error fetching sitemap:', error);
            return [];
        }
    }

    private static parseXml(xmlString: string): string[] {
        try {
            // If fallback was used, the string might contain HTML tags like <html><body>...
            // fast-xml-parser can handle simple XML extraction or we can clean it
            const cleanXml = xmlString.includes('<urlset') ? xmlString.substring(xmlString.indexOf('<urlset')) : xmlString;
            
            const parser = new XMLParser();
            const xml = parser.parse(cleanXml);
            
            const urls: string[] = [];
            if (xml.urlset && xml.urlset.url) {
                const urlArray = Array.isArray(xml.urlset.url) ? xml.urlset.url : [xml.urlset.url];
                for (const urlObj of urlArray) {
                    if (urlObj.loc) {
                        urls.push(urlObj.loc);
                    }
                }
            }
            return urls;
        } catch (e) {
            console.error('Error parsing XML', e);
            return [];
        }
    }
}
