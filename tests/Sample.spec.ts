import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';

class ElectronAppController {
    static electronApp: ElectronApplication;
    static mainWindow: Page | undefined; // Main window reference
    static splashWindow: Page | undefined; // Splash window reference

    static async launchApp() {
        try {
            ElectronAppController.electronApp = await electron.launch({
                executablePath: 'C:\\Program Files\\Shure\\Designer 6\\Shure Designer 6.exe',
            });
            console.log("Electron app launched successfully.");

            // Listen for new windows being opened
            ElectronAppController.electronApp.on('window', async (page) => {
                console.log(`New window opened: ${page.url()}`);
                await ElectronAppController.assignWindows(page);
            });

            // Wait for a brief moment to ensure windows are loaded
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Assign existing windows
            const existingWindows: Page[] = await ElectronAppController.electronApp.windows();
            for (const window of existingWindows) {
                await ElectronAppController.assignWindows(window);
            }

            // Check if the main window has been assigned
            if (!ElectronAppController.mainWindow) {
                throw new Error("Main window is undefined. Check window assignment.");
            }

            console.log("Main window assigned successfully.");
        } catch (error) {
            console.error("Error launching Electron app:", error);
            throw error;
        }
    }

    private static async assignWindows(page: Page) {
        const myurl = path.basename(page.url());
        console.log(`Assigning window with URL: ${myurl}`);

        // Assign the main window based on URL and page title
        if (myurl === 'index.html' || myurl.startsWith('startup')) {
            ElectronAppController.mainWindow = page;
            console.log('Main window assigned.');
        } else if (myurl === 'splash-screen.html') {
            ElectronAppController.splashWindow = page;
            console.log('Splash screen assigned.');
        } else {
            console.log(`No match for URL: ${myurl}`);
        }
    }

    static async interactWithMainWindow() {
        if (!ElectronAppController.mainWindow) {
            throw new Error("Main window is undefined. Cannot interact with elements.");
        }
    
        // Take a screenshot of the main window
        await ElectronAppController.mainWindow.screenshot({ path: 'main_window.png' });
        console.log("Screenshot taken of the main window.");
    
        // Example interactions, replace with actual logic
        try {
            // Use a more specific locator or select by index
            const devicesButtons = await ElectronAppController.mainWindow.locator('text="Devices"');
            if (await devicesButtons.count() > 0) {
                await devicesButtons.nth(0).click(); // Clicks the first 'Devices' element
                console.log("Clicked on the first 'Devices' button.");
                
                await ElectronAppController.mainWindow.getByLabel('Microphones')
                    .locator('div')
                    .filter({ hasText: 'MXA310' })
                    .nth(1)
                    .click();
                console.log("Selected 'MXA310' in the Microphones section.");
            } else {
                console.log("No 'Devices' button found.");
            }
        } catch (error) {
            console.error("Error interacting with the main window:", error);
        }
    }
    

    static async closeApp() {
        if (ElectronAppController.electronApp) {
            await ElectronAppController.electronApp.close();
            console.log("Electron app closed.");
        }
    }
}

// Playwright test suite
import { test, expect } from '@playwright/test';

test.describe('Electron app automation', () => {
    test.beforeAll(async () => {
        await ElectronAppController.launchApp();
    });

    test.afterAll(async () => {
        await ElectronAppController.closeApp();
    });

    test('should interact with elements in the Electron app', async () => {
        await ElectronAppController.interactWithMainWindow();
    });
});
