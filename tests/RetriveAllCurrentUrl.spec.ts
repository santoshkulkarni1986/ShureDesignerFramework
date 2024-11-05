// src/tests/ElectronApp.test.ts
import { test, expect } from '@playwright/test';
import ElectronAppController from '../utils/ElectronAppController'; // Adjust the import path as necessary

test.describe('Electron app URL retrieval', () => {
    test.beforeAll(async () => {
        await ElectronAppController.launchApp();
    });

    test.afterAll(async () => {
        await ElectronAppController.closeApp();
    });

    test('should retrieve all window URLs after opening the application', async () => {
        const urls = await ElectronAppController.getAllWindowUrls();
        console.log("Retrieved window URLs:", urls);
        
        // You can add assertions based on expected URLs
        expect(urls).toBeInstanceOf(Array); // Ensure it's an array
        expect(urls.length).toBeGreaterThan(0); // Expect at least one window URL

        // Log or check specific URLs if needed
        // expect(urls).toContain('expected_url_here');
    });
});
