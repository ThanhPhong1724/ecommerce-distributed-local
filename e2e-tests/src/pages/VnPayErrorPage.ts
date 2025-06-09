// src/pages/VnPayErrorPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { NoSuchElementError, StaleElementReferenceError, TimeoutError } from 'selenium-webdriver/lib/error';
// Không cần BasePage vì là trang ngoài

export class VnPayErrorPage {
  protected driver: WebDriver;

  // Locator cho thông báo lỗi chính
  // HTML: <div class="fz-h3">Giao dịch đã quá thời gian chờ thanh toán...</div>
  private errorMessageText = By.xpath("//div[contains(@class, 'fz-h3') and (contains(., 'Giao dịch đã quá thời gian') or contains(., 'Transaction has expired'))]");
  // Locator cho một element đặc trưng của trang lỗi này
  private errorPageIndicator = By.xpath("//div[contains(@class, 'fz-h3')]"); // Hoặc logo VNPAY trên trang lỗi

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async _waitForElementLocated(locator: By, timeout: number = 10000): Promise<WebElement> {
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

  async _waitForElementVisible(locator: By, timeout: number = 10000): Promise<WebElement> {
    const element = await this._waitForElementLocated(locator, timeout); // Đảm bảo có trong DOM trước
    let lastErrorForMessage: string = "Element located but visibility check failed or timed out.";
    
    await this.driver.wait(async () => {
      try {
        if (await element.isDisplayed()) {
          return true; // Điều kiện cho wait dừng lại
        }
        lastErrorForMessage = `Element ${locator.toString()} is present but not visible.`;
        return false; // Chưa visible, thử lại
      } catch (e: any) {
        if (e instanceof StaleElementReferenceError) {
          // Nếu element stale, predicate này sẽ fail, và wait sẽ tiếp tục thử.
          // Nếu element không bao giờ trở lại valid, wait sẽ timeout.
          // Hoặc, bạn có thể thử tìm lại element ở đây, nhưng sẽ làm predicate phức tạp hơn.
          lastErrorForMessage = `StaleElementReferenceError for ${locator.toString()} while waiting for visible.`;
          return false; 
        }
        lastErrorForMessage = e.message;
        throw e; // Lỗi khác, ném ra
      }
    }, timeout, `Timeout waiting for element ${locator.toString()} to become visible. Last known issue: ${lastErrorForMessage}`);
    
    // Nếu wait thành công, element (đã lấy từ _waitForElementLocated) giờ đã visible
    return element; 
  }

  async _getText(locator: By, timeout: number = 10000): Promise<string> {
    const element = await this._waitForElementVisible(locator, timeout); // Đảm bảo element visible trước khi lấy text
    return element.getText();
  }

  async isOnErrorPage(timeout: number = 15000): Promise<boolean> {
    console.log("[VnPayErrorPage] Waiting for VNPAY Error page...");
    try {
      await this.driver.wait(async () => (await this.driver.getCurrentUrl()).includes("vnpayment.vn/paymentv2/Payment/Error.html"), timeout, "URL does not match VNPAY Error page.");
      await this._waitForElementVisible(this.errorPageIndicator, 5000);
      console.log("[VnPayErrorPage] Verified on VNPAY Error page.");
      return true;
    } catch (e) {
      console.error("[VnPayErrorPage] Failed to verify on VNPAY Error page.", e);
      return false;
    }
  }

  async getErrorMessage(timeout: number = 5000): Promise<string> {
    return this._getText(this.errorMessageText, timeout);
  }
}