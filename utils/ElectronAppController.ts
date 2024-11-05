// src/ElectronAppController.ts
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';
import { config } from './config'; 
import { ElectronAppUtils } from '../utils/ElectronAppUtils'; 

class ElectronAppController {
    static electronApp: ElectronApplication;
    static mainWindow: Page | undefined; // Main window reference
    static splashWindow: Page | undefined; // Splash screen-html

    static async launchApp() {
        try {
            ElectronAppController.electronApp = await electron.launch({
                executablePath: config.executablePath,
            });
            console.log("Electron app launched successfully.");

            // Listen for new windows being opened
            ElectronAppController.electronApp.on('window', async (page) => {
                console.log(`New window opened: ${page.url()}`);
                await ElectronAppController.assignWindows(page);
            });

            // Waiting for some time to ensure windows are loaded
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Assign existing windows from electron app using windows
            const existingWindows: Page[] = await ElectronAppController.electronApp.windows();
            for (const window of existingWindows) {
                await ElectronAppController.assignWindows(window);
            }

            // Retry logic to ensure the main window is assigned to interact with elements
            for (let i = 0; i < 5; i++) {
                if (ElectronAppController.mainWindow) {
                    console.log("Main window assigned successfully.");
                    return; // Exit if the main window is assigned
                }
                console.log(`Main window not assigned yet. Attempt ${i + 1}/5.`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
            }

            throw new Error("Main window is undefined after retries. Check window assignment.");
        } catch (error) {
            console.error("Error launching Electron app:", error);
            throw error;
        }
    }

    static async getAllWindowUrls(): Promise<string[]> {
        const windows = await ElectronAppController.electronApp.windows();
        const urls = windows.map(window => window.url());
        return urls;
    }

    private static async assignWindows(page: Page) {
        const myurl = path.basename(page.url());
        console.log(`Assigning window with URL: ${myurl}`);

        // Assign the main window based on URL and page title currently it works for startUp url
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

        // Taking the screenshot of the main window
        await ElectronAppUtils.takeScreenshot(ElectronAppController.mainWindow, config.screenshotPath);

        //  interactions with start up url elements
        try {
            await ElectronAppUtils.selectMicrophone(ElectronAppController.mainWindow, config.microphoneLabel);
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

export default ElectronAppController;
