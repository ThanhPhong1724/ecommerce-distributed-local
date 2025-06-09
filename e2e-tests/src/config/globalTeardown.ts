// Import WebDriver để sử dụng kiểu
import { WebDriver } from 'selenium-webdriver';

// Khai báo kiểu cho biến global mà globalSetup đã tạo.
// Đặt ở cấp cao nhất của file.
declare global {
  // eslint-disable-next-line no-var
  var e2eWebDriver: WebDriver | undefined;
}

// module.exports phải là một hàm (thường là async)
module.exports = async () => {
  console.log('\n Jest Global Teardown: Attempting to quit WebDriver...');
  if (global.e2eWebDriver) {
    try {
      await global.e2eWebDriver.quit();
      console.log(' Jest Global Teardown: WebDriver quit successfully.');
    } catch (error) {
      console.error(' Jest Global Teardown: Error occurred while quitting WebDriver:', error);
      // Không nên process.exit(1) ở đây vì có thể che mất kết quả test
    }
  } else {
    console.log(' Jest Global Teardown: No WebDriver instance found in global scope to quit.');
  }
};
// globalTeardown.ts
// import { WebDriver } from 'selenium-webdriver';
// const fs = require('fs-extra'); // Cần fs-extra

// declare global {
//   namespace NodeJS {
//     interface Global {
//       e2eWebDriver: WebDriver | undefined;
//       e2eTempProfileDir: string | undefined; // Thêm khai báo này
//     }
//   }
// }

// module.exports = async () => {
//   console.log('\n Jest Global Teardown: Attempting to quit WebDriver...');
//   const driver = (global as any).e2eWebDriver as WebDriver | undefined; // Hoặc global.e2eWebDriver nếu type đúng
//   const tempProfileDir = (global as any).e2eTempProfileDir as string | undefined; // Hoặc global.e2eTempProfileDir

//   if (driver) {
//     try {
//       await driver.quit();
//       console.log(' Jest Global Teardown: WebDriver quit successfully.');
//     } catch (error) {
//       console.error(' Jest Global Teardown: Error occurred while quitting WebDriver:', error);
//     }
//   } else {
//     console.log(' Jest Global Teardown: No WebDriver instance found in global scope to quit.');
//   }

//   if (tempProfileDir) {
//     try {
//       console.log(`[GlobalTeardown] Removing temporary profile directory: ${tempProfileDir}`);
//       await fs.remove(tempProfileDir); // fs-extra.remove là async
//       console.log('[GlobalTeardown] Temporary profile directory removed.');
//     } catch (err) {
//       console.error('[GlobalTeardown] Error removing temporary profile directory:', err);
//     }
//   }
//   (global as any).e2eWebDriver = undefined;
//   (global as any).e2eTempProfileDir = undefined;
// };