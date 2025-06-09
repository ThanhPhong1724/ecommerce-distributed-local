// globalSetup.ts
import { Builder, Browser, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
require('chromedriver');
const os = require('os');
const path = require('path');
const fs = require('fs-extra'); // Cần cài: npm install --save-dev fs-extra

async function initializeGlobalWebDriver(): Promise<void> {
  console.log('[GlobalSetup] Attempting to create and configure WebDriver...');
  
  const options = new chrome.Options();
  
  // Tạo và sử dụng một User Data Directory tạm thời
  const tempProfileDir = path.join(os.tmpdir(), `chrome_profile_e2e_${Date.now()}`);
  try {
    fs.ensureDirSync(tempProfileDir);
    (global as any).e2eTempProfileDir = tempProfileDir; // Lưu để teardown có thể xóa
    console.log(`[GlobalSetup] Using temporary profile directory: ${tempProfileDir}`);
    options.addArguments(`--user-data-dir=${tempProfileDir}`);
  } catch (dirError) {
    console.error("[GlobalSetup] Could not create temporary profile directory:", dirError);
    // Có thể quyết định không chạy nếu không tạo được profile tạm
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--start-maximized',
    '--disable-popup-blocking',
    '--disable-infobars',
    '--disable-notifications',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-features=PasswordLeakDetection,PasswordManager,SyncPasswords,AutofillServerCommunication,InterestFeedContentSuggestions,TranslateUI',
    '--disable-background-networking',
    '--disable-autofill-keyboard-accessory-view',
    '--autofill-server-url=',
    '--incognito',
    '--disable-features=PasswordLeakDetection,PasswordManager,AutofillServerCommunication,SyncPasswords,...'
  );


  // Không dùng enable-automation trong excludeSwitches vì WebDriver cần nó
  const switchesToExclude = ['enable-sync', 'enable-password-manager-sync'];
  options.excludeSwitches(...switchesToExclude); 

  options.setUserPreferences({
    'profile.password_manager_enabled': false,
    'credentials_enable_service': false,
    'profile.default_content_setting_values.notifications': 2,
    'profile.default_content_setting_values.automatic_downloads': 1,
    'profile.default_content_setting_values.popups': 2,
    'autofill.profile_enabled': false,
    'autofill.credit_card_enabled': false,
    'safebrowsing.enabled': false
  });

  let driver: WebDriver | null = null;

  try {
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
    
    if (!driver) {
        throw new Error("[GlobalSetup] WebDriver instance was NULL after build.");
    }
    console.log('[GlobalSetup] WebDriver instance created.');

    await driver.manage().setTimeouts({ implicit: 5000 }); 
    console.log('[GlobalSetup] Implicit wait set.');

    await driver.manage().window().maximize();
    console.log('[GlobalSetup] Window maximized.');
    
    (global as any).e2eWebDriver = driver; // Vẫn dùng (global as any) ở đây cho nhất quán
    console.log('[GlobalSetup] WebDriver configured and assigned to global.e2eWebDriver.');

    // THÊM KIỂM TRA NGAY SAU KHI GÁN
    if ((global as any).e2eWebDriver && typeof (global as any).e2eWebDriver.getTitle === 'function') {
        console.log('[GlobalSetup] CONFIRMED: global.e2eWebDriver has WebDriver methods AFTER assignment.');
    } else {
        const assignedValue = (global as any).e2eWebDriver;
        console.error('[GlobalSetup] CRITICAL CONFIRMATION FAIL: global.e2eWebDriver does NOT look like a WebDriver instance AFTER assignment! Value:', assignedValue, 'Type:', typeof assignedValue);
        // Có thể throw lỗi ở đây nếu việc gán không thành công như mong đợi
        if (!assignedValue) throw new Error("global.e2eWebDriver was not properly assigned or is falsy.");
        if (typeof assignedValue.getTitle !== 'function') throw new Error("global.e2eWebDriver does not have getTitle method.");
    }

  } catch (error) {
    console.error('[GlobalSetup] Error during WebDriver creation or configuration:', error);
    if (driver) {
        try {
            await driver.quit();
            console.log('[GlobalSetup] Attempted to quit partially initialized driver due to error.');
        } catch (quitError) {
            console.error('[GlobalSetup] Error quitting partially initialized driver:', quitError);
        }
    }
    throw error; 
  }
}

module.exports = async () => {
  console.log('\n Jest Global Setup: Initializing WebDriver environment...');
  try {
    await initializeGlobalWebDriver();
    if (!(global as any).e2eWebDriver) { // Kiểm tra lại ở đây
        throw new Error("WebDriver (e2eWebDriver) was not assigned to global scope after initializeGlobalWebDriver completed.");
    }
    console.log(' Jest Global Setup: WebDriver initialization process completed successfully.');
  } catch (error) {
    console.error(' Jest Global Setup: CRITICAL - Failed to initialize WebDriver in module.exports. Tests will not run.', error);
    throw error; 
  }
};