// src/pages/BasePage.ts
import { By, Key, WebDriver, WebElement, error as WebDriverError } from 'selenium-webdriver';
// Bỏ `until` và `Condition` nếu chúng ta không dùng chúng nữa
import { NoSuchAlertError, TimeoutError, NoSuchElementError, ElementNotInteractableError, StaleElementReferenceError } from 'selenium-webdriver/lib/error';

export class BasePage {
  protected driver: WebDriver;
  protected baseUrl: string;
  protected pageUrl: string = "";

  constructor(driver: WebDriver, specificPagePath: string = "", baseUrl: string = "http://localhost:5173") {
    this.driver = driver;
    this.baseUrl = baseUrl;
    this.pageUrl = specificPagePath;
  }

  public getPageUrl(): string {
    return `${this.baseUrl}${this.pageUrl}`;
  }

  async navigate(pathSuffix: string = ''): Promise<void> {
    let targetUrl: string;
    if (pathSuffix.startsWith('http://') || pathSuffix.startsWith('https://')) {
        targetUrl = pathSuffix;
    } else {
        targetUrl = `${this.baseUrl}${this.pageUrl}${pathSuffix}`;
    }
    console.log(`[BasePage] Navigating to: ${targetUrl}`);
    await this.driver.get(targetUrl);
  }

  // --- HÀM CHỜ ĐỢI VIẾT LẠI SỬ DỤNG CUSTOM PREDICATE ---
  protected async waitForElementLocated(locator: By, timeout: number = 10000): Promise<WebElement> {
    let lastErrorForMessage: string = "Unknown error or timeout before any specific error was caught.";
    const element = await this.driver.wait(async () => {
      try {
        return await this.driver.findElement(locator);
      } catch (e: any) {
        if (e instanceof NoSuchElementError) {
          lastErrorForMessage = e.message;
          return null; 
        }
        lastErrorForMessage = e.message;
        throw e; 
      }
    }, timeout, `Timeout waiting for element ${locator.toString()} to be located. Last known issue: ${lastErrorForMessage}`);
    
    if (!element) { 
        throw new TimeoutError(`Element ${locator.toString()} was not located within timeout, or wait resolved with a falsy value unexpectedly. Last known issue: ${lastErrorForMessage}`);
    }
    return element;
  }

  protected async waitForElementVisible(locator: By, timeout: number = 10000): Promise<WebElement> {
    const element = await this.waitForElementLocated(locator, timeout);
    let lastErrorForMessage: string = "Element located but visibility check failed or timed out.";
    
    await this.driver.wait(async () => {
      try {
        if (await element.isDisplayed()) {
          return true;
        }
        lastErrorForMessage = `Element ${locator.toString()} is present but not visible.`;
        return false; 
      } catch (e: any) {
        if (e instanceof StaleElementReferenceError) {
          lastErrorForMessage = `StaleElementReferenceError for ${locator.toString()} while waiting for visible.`;
          return false; 
        }
        lastErrorForMessage = e.message;
        throw e; 
      }
    }, timeout, `Timeout waiting for element ${locator.toString()} to become visible. Last known issue: ${lastErrorForMessage}`);
    
    return element; 
  }
  
  // SỬA LẠI waitForElementClickable
  protected async waitForElementClickable(locator: By, timeout: number = 10000): Promise<WebElement> {
      const element = await this.waitForElementVisible(locator, timeout); // Đảm bảo visible trước
      let lastErrorForMessage: string = `Element ${locator.toString()} visible but clickability check failed or timed out.`;

      await this.driver.wait(async () => {
        try {
          if (await element.isEnabled()) { // Kiểm tra isEnabled()
            return true; // Điều kiện cho wait dừng lại
          }
          lastErrorForMessage = `Element ${locator.toString()} is visible but not enabled.`;
          return false; // Chưa enabled, thử lại
        } catch (e: any) {
          // Xử lý các lỗi có thể xảy ra khi gọi isEnabled() (ví dụ: StaleElement)
          if (e instanceof StaleElementReferenceError) {
            lastErrorForMessage = `StaleElementReferenceError for ${locator.toString()} while waiting for clickable.`;
            return false; // Yêu cầu wait thử lại
          }
          lastErrorForMessage = e.message;
          throw e; // Lỗi khác
        }
      }, timeout, `Timeout waiting for element ${locator.toString()} to become clickable. Last known issue: ${lastErrorForMessage}`);
      
      return element; // Trả về element nếu wait thành công
  }

  // --- HÀM TƯƠNG TÁC CƠ BẢN (giữ nguyên) ---
  async click(locator: By, timeout: number = 10000): Promise<void> {
      const element = await this.waitForElementClickable(locator, timeout);
      await element.click();
  }

  async type(locator: By, text: string, timeout: number = 10000): Promise<void> {
      const element = await this.waitForElementClickable(locator, timeout);
      await element.clear();
      await element.sendKeys(text);
  }
    
  async getText(locator: By, timeout: number = 10000): Promise<string> {
      const element = await this.waitForElementVisible(locator, timeout);
      return element.getText();
  }

  async getAttribute(locator: By, attributeName: string, timeout: number = 10000): Promise<string> {
      const element = await this.waitForElementVisible(locator, timeout);
      return element.getAttribute(attributeName);
  }

  async isElementDisplayed(locator: By, timeout: number = 5000): Promise<boolean> {
      try {
      const element = await this.waitForElementLocated(locator, timeout); 
      return await element.isDisplayed();
      } catch (error) {
      if (error instanceof TimeoutError || error instanceof NoSuchElementError) {
          return false;
      }
      // console.warn(`[BasePage] isElementDisplayed check for ${locator.toString()} encountered an unexpected issue:`, error);
      return false; 
      }
  }

  // SỬA LẠI waitForUrlContains (đã sửa ở lượt trước, giữ lại)
  async waitForUrlContains(pathFragment: string, timeout: number = 10000): Promise<boolean> {
      let lastUrl = "";
      try {
      await this.driver.wait(async () => {
          lastUrl = await this.driver.getCurrentUrl();
          return lastUrl.includes(pathFragment);
      }, timeout, `URL did not contain "${pathFragment}" within ${timeout}ms. Last URL: ${lastUrl}`);
      return true;
      } catch (e) {
      // console.warn(`Timeout waiting for URL to contain "${pathFragment}". Last URL: ${lastUrl}`, e);
      return false;
      }
  }

  // async scrollIntoView(elementOrLocator: WebElement | By): Promise<void> {
  //     let element: WebElement;
  //     if (elementOrLocator instanceof By) {
  //     element = await this.waitForElementLocated(elementOrLocator);
  //     } else {
  //     element = elementOrLocator;
  //     }
  //     await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", element);
  //     await this.driver.sleep(200); // Chờ một chút để scroll hoàn tất
  // }
  async scrollIntoView(elementOrLocator: WebElement | By): Promise<void> {
      let element: WebElement;
      if (elementOrLocator instanceof By) {
      element = await this.waitForElementLocated(elementOrLocator);
      } else {
      element = elementOrLocator;
      }
      // Scroll element vào giữa màn hình (block: 'center')
      await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'auto', block: 'center', inline: 'center'});", element);
      await this.driver.sleep(500); // Tăng sleep một chút để scroll và UI ổn định
  }
  // SỬA LẠI acceptOptionalAlertIfPresent (đã sửa ở lượt trước, giữ lại)
  async acceptOptionalAlertIfPresent(expectedText?: string, timeout: number = 3000): Promise<void> {
      try {
          await this.driver.wait(async () => {
              try {
                  await this.driver.switchTo().alert();
                  return true; 
              } catch (e) {
                  if (e instanceof NoSuchAlertError) {
                      return false; 
                  }
                  throw e; 
              }
          }, timeout, `Alert did not appear within ${timeout}ms.`);
          
          const alert = this.driver.switchTo().alert();
          const alertText = await alert.getText();
          console.log(`[BasePage] Optional alert present with text: "${alertText}". Accepting it.`);
          if (expectedText && !alertText.includes(expectedText)) {
              console.warn(`[BasePage] Alert text "${alertText}" did not match expected "${expectedText}". Still accepting.`);
          }
          await alert.accept();
      } catch (e: any) {
          if (e instanceof TimeoutError || e.name === 'TimeoutError' ||
              e instanceof NoSuchAlertError || e.name === 'NoSuchAlertError') {
              console.log("[BasePage] No optional alert was present, or it timed out, or it was already handled.");
          } else {
              console.warn("[BasePage] Unknown error handling optional alert:", e);
          }
      }
  }
  
  async findElement(locator: By, timeout: number = 10000): Promise<WebElement> {
      return this.waitForElementLocated(locator, timeout);
  }
}