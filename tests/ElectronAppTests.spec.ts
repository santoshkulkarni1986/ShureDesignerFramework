// tests/ElectronAppTests.ts
import { test, expect } from '@playwright/test';
import ElectronAppController from '../utils/ElectronAppController';

test.describe('Electron app automation', () => {
    test.beforeAll(async () => {
        await ElectronAppController.launchApp();
    });

    test.afterAll(async () => {
        await ElectronAppController.closeApp();
    });

    test('should interact with elements in the Electron app', async () => {
        await ElectronAppController.interactWithMainWindow();
        expect(ElectronAppController.mainWindow).toBeDefined(); // Example assertion
    });
});
