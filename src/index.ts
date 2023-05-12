import express, { Request, Response, Application } from 'express';
const app: Application = express();
const PORT = process.env.PORT || 8000;
import path from 'path';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import puppeteer from 'puppeteer';

const platformUrls = {
    amazon:{
        url: 'https://amazon.com',
        search_box: '#twotabsearchtextbox',
        search_list: ".s-result-item .s-card-border",
        title: "h2 > a > span",
        price: ".a-price-whole",
        price_fraction: ".a-price-whole",
        link: 'a',
        link_attr: 'href'
    }
}

app.get('/', async (req: Request, res: Response) => {
    (async () => {
        try {
            const platformName: any = req.query.platform;
            const searchTerm: any = req.query.search_key;
            const records: any = req.query.records || 3;
            if (!platformName || !searchTerm) {
                res.json("Incomplete Request");
                return;
            }
            const platform = platformUrls[platformName];
            if (!platform) {
                res.json("Incomplete Request");
                return;
            }

            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto(platform.url);

            // Set screen size
            // await page.setViewport({ width: 1080, height: 1024 });

            const elementHandle = await page.$(platform.search_box);
            await elementHandle.type(searchTerm);
            await elementHandle.press('Enter');
            await page.waitForNavigation();
            const products = await page.evaluate(({ platform, searchTerm }) => {
                let results = [];
                const items = document.querySelectorAll(platform.search_list);
                for (let i = items.length; i--;) {
                    const item = items[i];
                    const title: any = item.querySelector(platform.title);
                    const price: any = item.querySelector(platform.price);
                    const cents: any = item.querySelector(platform.price_fraction);
                    const link = item.querySelector(platform.link);
                    if (!title || !price || !link) continue;
                    results = [...results, {
                        title: title.innerText.replace(/,/g, " "),
                        price: parseFloat(`${parseInt(price.innerText)}.${parseInt(cents.innerText)}`),
                        link: `${platform.url}${link.getAttribute(platform.link_attr)}`,
                        search: searchTerm
                    }]
                }
                return results;
            }, { platform, searchTerm });
            products.sort((a, b) => a.price > b.price ? 1 : -1);
            const finalList = products.slice(0, records);
            if (!finalList.length) {
                res.json({ message: "No Records foung" });
                return;
            }
            const csvWriter = createCsvWriter({
                path: 'search-result.csv',
                header: [
                    { id: 'title', title: 'Title' },
                    { id: 'price', title: 'Price' },
                    { id: 'link', title: 'Link' },
                    { id: 'search', title: 'Search' }
                ]
            });

            csvWriter.writeRecords(finalList)  
                .then(async () => {
                    let filePath = path.join(__dirname, "../search-result.csv");
                    res.download(filePath);
                    await browser.close();
                });
        } catch (error) {
            res.json({ message: error.message });
        }
    })();
})

app.listen(PORT, (): void => {
    console.log(`Server Running at http://localhost:${PORT}`);
});