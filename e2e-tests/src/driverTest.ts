// e2e-tests/src/driverTest.ts (tạo file này để test riêng)
import { createDriver } from './utils/driverSetup';
import { WebDriver } from 'selenium-webdriver';

async function testDriverCreation() {
  console.log('Attempting to create driver...');
  let driver: WebDriver | null = null;
  try {
    const startTime = Date.now();
    driver = await createDriver();
    const endTime = Date.now();
    console.log(`Driver created successfully in ${(endTime - startTime) / 1000} seconds.`);
    await driver.get('https://www.google.com');
    console.log('Navigated to Google.');
    await driver.sleep(3000); // Giữ trình duyệt mở 3 giây
  } catch (error) {
    console.error('Failed to create driver or navigate:', error);
  } finally {
    if (driver) {
      console.log('Quitting driver...');
      await driver.quit();
      console.log('Driver quit.');
    }
  }
}

testDriverCreation();