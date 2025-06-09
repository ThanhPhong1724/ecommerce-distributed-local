// src/pages/VnPayReturnPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage'; // Giữ lại kế thừa BasePage để dùng các hàm chờ

export class VnPayReturnPage extends BasePage {
  // --- LOCATORS ---
  // <h2 class="mt-6 text-2xl font-bold text-gray-900">Thanh toán thành công</h2>
  private statusTitle = By.xpath("//h2[contains(@class, 'text-2xl font-bold text-gray-900')]");
  
  // <p class="mt-2 text-gray-600 text-center">{message}</p>
  private statusMessage = By.xpath("//div[contains(@class, 'bg-white')]//p[contains(@class, 'text-gray-600 text-center')]");

  // <p className="text-sm text-gray-600">Mã đơn hàng: <span className="font-medium text-gray-900">{displayOrderId}</span></p>
  private orderIdDisplay = By.xpath("//p[contains(text(), 'Mã đơn hàng:')]/span[@class='font-medium text-gray-900']");

  private successIcon = By.xpath("//div[contains(@class, 'text-green-500')]/*[self::svg or self::FiCheckCircle]");
  private failureIcon = By.xpath("//div[contains(@class, 'text-red-500')]/*[self::svg or self::FiXCircle]");

  constructor(driver: WebDriver) {
    // URL của trang này thường có dạng /payment/result?query_params...
    // Chúng ta sẽ không dùng pagePath cố định mà sẽ chờ URL chứa một phần đặc trưng.
    // BaseUrl vẫn được kế thừa.
    super(driver, ""); // pagePath có thể để trống vì URL return rất động
  }

  // Hàm này sẽ được gọi SAU KHI đã chuyển hướng từ VNPAY về trang của bạn
  async waitForPageToLoad(timeout: number = 25000): Promise<void> { // Tăng timeout
    console.log("[VnPayReturnPage] Waiting for VNPAY return page to load...");
    // Chờ URL chứa "payment/result" (dựa trên URL bạn cung cấp) VÀ một trong các element trạng thái
    let onCorrectPage = false;
    try {
        await this.driver.wait(async () => {
            const currentUrl = await this.driver.getCurrentUrl();
            return currentUrl.includes("/payment/result"); // Kiểm tra phần đặc trưng của URL return
        }, timeout, "Did not land on VNPAY return page (URL mismatch).");
        onCorrectPage = true;
        console.log("[VnPayReturnPage] URL confirmed to be return page.");

        // Sau khi URL đúng, chờ title hoặc message hoặc icon
        await this.driver.wait(async () => {
            const titleVisible = await this.isElementDisplayed(this.statusTitle, 1000);
            // const messageVisible = await this.isElementDisplayed(this.statusMessage, 1000);
            // const successIconVisible = await this.isElementDisplayed(this.successIcon, 1000);
            // const failureIconVisible = await this.isElementDisplayed(this.failureIcon, 1000);
            return titleVisible; // || messageVisible || successIconVisible || failureIconVisible;
        }, timeout, "Status title (or other key elements) not visible on VNPAY return page.");
        console.log("[VnPayReturnPage] VNPAY return page loaded and status title is visible.");

    } catch (e) {
        console.error("[VnPayReturnPage] Error waiting for page load:", e);
        if (onCorrectPage) { // Nếu URL đúng nhưng element không thấy
             console.error("[VnPayReturnPage] URL is correct but content did not load as expected.");
        }
        throw e; // Ném lại lỗi để test case biết
    }
  }

  async getStatusTitle(timeout: number = 7000): Promise<string> {
    return this.getText(this.statusTitle, timeout);
  }

  async getStatusMessage(timeout: number = 7000): Promise<string> {
    return this.getText(this.statusMessage, timeout);
  }

  async getDisplayedOrderId(timeout: number = 7000): Promise<string | null> {
    try {
      const element = await this.waitForElementVisible(this.orderIdDisplay, timeout);
      return element.getText();
    } catch (e) {
      console.warn("[VnPayReturnPage] Could not find Order ID display.", e);
      return null;
    }
  }

  async isPaymentSuccessful(timeout: number = 7000): Promise<boolean> {
    try {
        // Kiểm tra dựa trên sự hiện diện của successIcon HOẶC text của statusTitle
        const iconVisible = await this.isElementDisplayed(this.successIcon, timeout / 2);
        if (iconVisible) return true;
        
        const title = await this.getStatusTitle(timeout / 2);
        return title.toLowerCase().includes("thanh toán thành công");
    } catch (e) {
        return false;
    }
  }
}