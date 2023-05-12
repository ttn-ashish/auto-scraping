import { Request, Response } from 'express';
import path from 'path';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import puppeteer from 'puppeteer';
import { platformUrls } from '../utils/common-utils';

export class MainController {
    scrapProducts = async (req: any, res: any) => {
        try {
            const platformName: any = req.query.platform || 'amazon';
            const searchTerm: any = req.query.search_key;
            const records: any = req.query.records || 3;
            if (!platformName || !searchTerm) {
                res.status(401).json({message: "Search Key is missing"});
                return;
            }
            const platform = platformUrls[platformName];
            if (!platform) {
                res.json({message: "Platform not supported"});
                return;
            }
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto(platform.url);
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
            //we need first 3 lowest price items
            products.sort((a, b) => a.price > b.price ? 1 : -1);
            const finalList = products.slice(0, records);

            if (!finalList.length) {
                res.json({ message: "No products found" });
                await browser.close();
                return;
            }
            const csvWriter = createCsvWriter({
                path: '../search-result.csv',
                header: [
                    { id: 'title', title: 'Title' },
                    { id: 'price', title: 'Price' },
                    { id: 'link', title: 'Link' },
                    { id: 'search', title: 'Search' }
                ]
            });
            csvWriter.writeRecords(finalList)
                .then(async () => {
                    let filePath = path.join(__dirname, "../../search-result.csv");
                    console.log("🚀 ~ file: main.controller.ts:69 ~ MainController ~ .then ~ filePath:", filePath);
                    res.download(filePath);
                    await browser.close();
                });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}