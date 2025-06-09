// e2e-tests/src/utils/driverSetup.ts
import { Builder, Browser, WebDriver } from 'selenium-webdriver';
// Tạm thời không cần chrome options hay service
// import chrome from 'selenium-webdriver/chrome';
// require('chromedriver'); // Có thể giữ lại hoặc bỏ đi để test

export async function createDriver(): Promise<WebDriver> {
  console.log('[Jest Environment] Attempting to create driver (minimal)...');
  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .build();
  console.log('[Jest Environment] Driver created (minimal).');
  return driver;
}