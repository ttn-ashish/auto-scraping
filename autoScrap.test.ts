import { describe, expect } from '@jest/globals';

const mockRequest = () => {
    const req: any = {}
    req.body = jest.fn().mockReturnValue(req)
    req.params = jest.fn().mockReturnValue(req)
    req.query = jest.fn().mockReturnValue(req)
    return req
};

const mockResponse = () => {
    const res: any = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.download = jest.fn().mockReturnValue(res)
    return res
};

import { MainController } from './src/controllers/main.controller';
const mainController = new MainController();
describe('Main Controller => scrapProducts', () => {

    it('should print Search Key is missing if search_key is empty or missing', async () => {
        const req = mockRequest();
        req.query = { search_key: '' };
        const res = mockResponse();
        await mainController.scrapProducts(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Search Key is missing" });
    });

    it('should print Platform not supported in case of any platform except amazon', async () => {
        const req = mockRequest();
        req.query = { search_key: 'Hard Disk', platform: "flipkart" };
        const res = mockResponse();
        await mainController.scrapProducts(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: "Platform not supported" });
    });

    // it('should print No products found if search_key is not matching any product', async () => {
    //     const req = mockRequest();
    //     req.query = {
    //         search_key: Date.now() + 'zzzzz' + Date.now() + 'zzzzzztttt' + Date.now() +'tttttttttttttcccccccccccccccccckkkkkkkkkkkk', platform: "amazon" };
    //     const res = mockResponse();
    //     await mainController.scrapProducts(req, res);
    //     expect(res.json).toHaveBeenCalledWith({ message: "No products found" });
    // }, 30000);
}); 