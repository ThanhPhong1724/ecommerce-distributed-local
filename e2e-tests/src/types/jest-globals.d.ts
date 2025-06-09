// src/types/jest-globals.d.ts
import { WebDriver } from 'selenium-webdriver'; // Import này vẫn cần nếu bạn định nghĩa e2eWebDriver

declare global {
  interface globalThis { // Hoặc chỉ là globalThis mà không có interface nếu cách trên không được
    myTestVarFromSetup: string | undefined;
    // Bạn sẽ thêm các biến global khác vào đây sau
    e2eWebDriver: WebDriver | undefined;
    myCustomGlobalVar: string | undefined; // Có thể bạn sẽ dùng biến này sau
    timestampFromGlobalSetup: number | undefined; // Có thể bạn sẽ dùng biến này sau
  }
}
export {}; // Quan trọng để file này được coi là module