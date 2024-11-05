// src/utils/ElectronAppUtils.ts
import { Page } from 'playwright';

export class ElectronAppUtils {
    // Utility Method to take a screenshot
    static async takeScreenshot(page: Page, path: string) {
        await page.screenshot({ path });
        console.log(`Screenshot taken and saved to: ${path}`);
    }

    // utility method for selecting a microphone
    static async selectMicrophone(page: Page, label: string) {
        const devicesButtons = await page.locator('text="Devices"');
        if (await devicesButtons.count() > 0) {
            await devicesButtons.nth(0).click();
            console.log("Clicked on the 'Devices' button.");

            await page.getByLabel(label).locator('div').filter({ hasText: 'MXA310' }).nth(1).click();
            console.log(`Selected '${label}' in the Microphones section.`);
        } else {
            console.log("No 'Devices' button found.");
        }
    }
}
