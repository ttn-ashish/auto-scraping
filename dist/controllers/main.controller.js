"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainController = void 0;
const path_1 = __importDefault(require("path"));
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer_1 = __importDefault(require("puppeteer"));
const platformUrls = {
    amazon: {
        url: 'https://amazon.com',
        search_box: '#twotabsearchtextbox',
        search_list: ".s-result-item .s-card-border",
        title: "h2 > a > span",
        price: ".a-price-whole",
        price_fraction: ".a-price-whole",
        link: 'a',
        link_attr: 'href'
    }
};
class MainController {
    constructor() {
        this.scrapProducts = (req, res) => {
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const platformName = req.query.platform || 'amazon';
                    const searchTerm = req.query.search_key;
                    const records = req.query.records || 3;
                    if (!platformName || !searchTerm) {
                        res.json("Search Key is missing");
                        return;
                    }
                    const platform = platformUrls[platformName];
                    if (!platform) {
                        res.json("Incomplete Request");
                        return;
                    }
                    const browser = yield puppeteer_1.default.launch({ headless: false });
                    const page = yield browser.newPage();
                    yield page.goto(platform.url);
                    // Set screen size
                    // await page.setViewport({ width: 1080, height: 1024 });
                    const elementHandle = yield page.$(platform.search_box);
                    yield elementHandle.type(searchTerm);
                    yield elementHandle.press('Enter');
                    yield page.waitForNavigation();
                    const products = yield page.evaluate(({ platform, searchTerm }) => {
                        let results = [];
                        const items = document.querySelectorAll(platform.search_list);
                        for (let i = items.length; i--;) {
                            const item = items[i];
                            const title = item.querySelector(platform.title);
                            const price = item.querySelector(platform.price);
                            const cents = item.querySelector(platform.price_fraction);
                            const link = item.querySelector(platform.link);
                            if (!title || !price || !link)
                                continue;
                            results = [...results, {
                                    title: title.innerText.replace(/,/g, " "),
                                    price: parseFloat(`${parseInt(price.innerText)}.${parseInt(cents.innerText)}`),
                                    link: `${platform.url}${link.getAttribute(platform.link_attr)}`,
                                    search: searchTerm
                                }];
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
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        let filePath = path_1.default.join(__dirname, "../search-result.csv");
                        res.download(filePath);
                        yield browser.close();
                    }));
                }
                catch (error) {
                    res.json({ message: error.message });
                }
            }))();
        };
    }
}
exports.MainController = MainController;
