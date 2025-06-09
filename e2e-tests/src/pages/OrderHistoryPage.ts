// src/pages/OrderHistoryPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';

export class OrderHistoryPage extends BasePage {
  // --- LOCATORS ---
  private pageTitle = By.xpath("//h1[normalize-space()='Lịch sử đơn hàng']");
  private noOrdersMessage = By.xpath("//h2[normalize-space()='Chưa có đơn hàng nào']");

  // Locator cho container cha của MỘT item đơn hàng bất kỳ trong danh sách
  // Dựa trên class của motion.div
  private anyOrderItemContainer = By.xpath(
    "//div[contains(@class, 'bg-white') and contains(@class, 'rounded-2xl') and contains(@class, 'shadow-sm') and .//h3[starts-with(normalize-space(.), 'Đơn hàng #')]]"
  );
  // Điều kiện: div có các class đó VÀ chứa <h3> có text bắt đầu bằng "Đơn hàng #"

  // Locator cho container của một đơn hàng CỤ THỂ dựa vào orderId
  // Cách tốt nhất là thêm data-testid=`order-history-item-${order.id}` vào thẻ motion.div ở frontend
  private orderItemContainerByOrderId = (orderId: string) => 
    // By.xpath(`//div[@data-testid='order-history-item-${orderId}']`); // Ưu tiên nếu có data-testid
    // Nếu không có data-testid, tìm dựa vào text của h3
    By.xpath(
      `//div[contains(@class, 'bg-white') and contains(@class, 'rounded-2xl')][.//h3[normalize-space()='Đơn hàng #${orderId}']]`
    );

  // Locator cho link/nút "Xem chi tiết" của một đơn hàng cụ thể
  private viewDetailsLinkByOrderId = (orderId: string) => 
    By.xpath(
      `${this.orderItemContainerByOrderId(orderId).value}//a[normalize-space()='Xem chi tiết']`
      // Hoặc nếu có data-testid:
      // `${this.orderItemContainerByOrderId(orderId).value}//a[@data-testid='view-order-details-link-${orderId}']`
    );
  
  // Locator để lấy ID từ thẻ h3 của đơn hàng đầu tiên (dùng để lấy ví dụ ID)
  private firstOrderInList_IdTextElement = By.xpath(
    `(${this.anyOrderItemContainer.value})[1]//h3[contains(@class, 'text-lg')]`
  );


  constructor(driver: WebDriver) {
    super(driver, "/orders"); // Giả sử URL của trang lịch sử đơn hàng là /orders
  }

  async navigateToPage(): Promise<void> {
    await this.navigate(); 
    console.log(`[OrderHistoryPage] Navigated to ${await this.driver.getCurrentUrl()}. Waiting for page content...`);
    await this.waitForPageToLoad(15000);
  }

  async waitForPageToLoad(timeout: number = 15000): Promise<void> {
    console.log("[OrderHistoryPage] Waiting for Order History page to load (title and orders/empty message)...");
    await this.driver.wait(async () => {
        const titleVisible = await this.isElementDisplayed(this.pageTitle, 1000);
        if (!titleVisible) return false;

        const ordersDisplayed = await this.isElementDisplayed(this.anyOrderItemContainer, 500);
        const noOrdersMsgDisplayed = await this.isElementDisplayed(this.noOrdersMessage, 500);
        return ordersDisplayed || noOrdersMsgDisplayed;
    }, timeout, "Order History page did not load with title AND (orders or no orders message).");
    console.log("[OrderHistoryPage] Page content (title and orders/empty message) verified.");
  }

  async isPageTitleVisible(timeout: number = 7000): Promise<boolean> {
    return this.isElementDisplayed(this.pageTitle, timeout);
  }

  /**
   * Kiểm tra xem có ít nhất một đơn hàng nào được hiển thị trên trang không.
   */
  async areOrdersDisplayed(timeout: number = 10000): Promise<boolean> {
    console.log("[OrderHistoryPage] Checking if any orders are displayed...");
    // Chờ cho đến khi hoặc có item đơn hàng, hoặc có thông báo không có đơn hàng
    try {
        await this.driver.wait(async () => {
            const itemsFound = await this.isElementDisplayed(this.anyOrderItemContainer, 1000);
            const noItemsMsgFound = await this.isElementDisplayed(this.noOrdersMessage, 1000);
            return itemsFound || noItemsMsgFound;
        }, timeout, "Neither order items nor 'no orders' message appeared.");
        
        // Sau khi chờ, kiểm tra lại xem có item nào không
        const result = await this.isElementDisplayed(this.anyOrderItemContainer, 500); // Check nhanh
        console.log(`[OrderHistoryPage] areOrdersDisplayed result: ${result}`);
        return result;
    } catch (e) {
        console.warn("[OrderHistoryPage] Error or timeout in areOrdersDisplayed.", e);
        return false;
    }
  }

  /**
   * Lấy ID của đơn hàng đầu tiên trong danh sách.
   * @returns Order ID string, hoặc null nếu không có đơn hàng.
   */
  async getFirstOrderIdFromList(timeout: number = 7000): Promise<string | null> {
    try {
      const firstOrderElement = await this.waitForElementVisible(this.firstOrderInList_IdTextElement, timeout);
      let orderIdText = await firstOrderElement.getText(); // Ví dụ: "Đơn hàng #abcdef123"
      // Làm sạch text để chỉ lấy ID
      if (orderIdText.includes("#")) {
        orderIdText = orderIdText.split("#")[1];
      }
      orderIdText = orderIdText.trim();
      console.log(`[OrderHistoryPage] Found first order ID in list: ${orderIdText}`);
      return orderIdText || null;
    } catch (e) {
      console.warn("[OrderHistoryPage] Could not get first order ID from list.", e);
      return null;
    }
  }

  /**
   * Kiểm tra xem một đơn hàng với ID cụ thể có trong danh sách hiển thị không.
   */
  async isOrderInList(orderId: string, timeout: number = 7000): Promise<boolean> {
    const isPresent = await this.isElementDisplayed(this.orderItemContainerByOrderId(orderId), timeout);
    console.log(`[OrderHistoryPage] Is order ID ${orderId} in list: ${isPresent}`);
    return isPresent;
  }

  /**
   * Click vào link/nút "Xem chi tiết" của một đơn hàng cụ thể.
   */
  async clickOrderDetailsLink(orderId: string): Promise<void> {
    console.log(`[OrderHistoryPage] Clicking 'View Details' for order ID: ${orderId}`);
    const detailsLinkLocator = this.viewDetailsLinkByOrderId(orderId);
    const linkElement = await this.waitForElementClickable(detailsLinkLocator, 10000);
    await this.scrollIntoView(linkElement);
    await linkElement.click();
    // Chờ URL thay đổi hoặc một element trên trang chi tiết đơn hàng load
    // Ví dụ:
    // await this.driver.wait(async () => (await this.driver.getCurrentUrl()).includes(`/orders/${orderId}`), 10000);
  }

  async getNoOrdersMessageText(timeout: number = 5000): Promise<string | null> {
    try {
      const element = await this.waitForElementVisible(this.noOrdersMessage, timeout);
      return element.getText();
    } catch (e) {
      return null;
    }
  }
}