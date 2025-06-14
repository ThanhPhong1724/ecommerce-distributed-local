// src/pages/admin/AdminOrderManagementPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage';
import { NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';
import { OrderStatusAdmin } from './AdminOrderDetailPage'; // Import enum

export class AdminOrderManagementPage extends BasePage {
  // --- LOCATORS ---
  private pageTitle = By.xpath("//h1[normalize-space()='Quản lý Đơn hàng']");
  private ordersTable = By.xpath("//table[contains(@class, 'min-w-full') and thead//th[contains(text(), 'ID Đơn hàng')]]");
  private anyOrderRowInTable = By.xpath("//table[contains(@class, 'min-w-full')]/tbody/tr");
  private noOrdersMessage = By.xpath("//h3[normalize-space()='Không có đơn hàng']");

  // Dựa trên HTML của AdminOrderListPage.tsx:
  // Dòng <tr> có data-testid={`order-row-${order.id}`}
  // ID đầy đủ ở cột 1, div con thứ 2: <div class="text-xs text-gray-500">{order.id}</div>
  // Trạng thái ở cột 5, span con thứ 2: <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
  // Link "Xem chi tiết" có data-testid={`view-order-details-${order.id}`}

  private orderRowByDataTestId = (orderId: string) => 
    By.xpath(`//tr[@data-testid='order-row-${orderId}']`);
  
  private statusTextInOrderRow = (orderRowElement: WebElement) => 
    orderRowElement.findElement(By.xpath("./td[5]//span[contains(@class, 'font-medium')]/span[@class='ml-1']")); 
    // Tìm span con thứ 2 trong span trạng thái

  private orderIdTextInOrderRow = (orderRowElement: WebElement) => 
    orderRowElement.findElement(By.xpath("./td[1]//div[contains(@class, 'text-xs text-gray-500')]"));

  private viewDetailsLinkByDataTestId = (orderId: string) => 
    By.xpath(`//a[@data-testid='view-order-details-${orderId}']`);
  
  constructor(driver: WebDriver) {
    super(driver, "/admin/orders");
  }

  async navigateToPage(): Promise<void> {
    await this.navigate();
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad(timeout: number = 15000): Promise<void> {
    console.log("[AdminOrderMngPage] Waiting for Order Management page to load...");
    if (!(await this.waitForUrlContains(this.pageUrl, timeout))) {
         throw new Error(`Timeout or incorrect URL. Expected '${this.getPageUrl()}', Current: '${await this.driver.getCurrentUrl()}'`);
    }
    await this.waitForElementVisible(this.pageTitle, timeout);
    await this.driver.wait(async () => { // Chờ bảng hoặc thông báo không có đơn hàng
        const tableVisible = await this.isElementDisplayed(this.ordersTable, 1000);
        const noOrdersMsgVisible = await this.isElementDisplayed(this.noOrdersMessage, 1000);
        return tableVisible || noOrdersMsgVisible;
    }, timeout, "Orders table or 'no orders' message did not appear.");
    console.log("[AdminOrderMngPage] Order Management page loaded.");
  }

  async areOrdersDisplayed(timeout: number = 7000): Promise<boolean> {
    return this.isElementDisplayed(this.anyOrderRowInTable, timeout);
  }

  async getDisplayedOrderCount(timeout: number = 7000): Promise<number> {
    try {
      await this.waitForElementVisible(this.anyOrderRowInTable, timeout);
      const orderRows = await this.driver.findElements(this.anyOrderRowInTable);
      return orderRows.length;
    } catch (e) { return 0; }
  }
  
  async findOrderWithStatus(statusToFind: OrderStatusAdmin, timeout: number = 10000): Promise<string | null> {
    console.log(`[AdminOrderMngPage] Searching for an order with status: ${statusToFind}`);
    await this.waitForPageToLoad(timeout); 

    const orderRows = await this.driver.findElements(this.anyOrderRowInTable);
    if (orderRows.length === 0) {
      console.log("[AdminOrderMngPage] No orders found in the list to search for status.");
      return null;
    }
    console.log(`[AdminOrderMngPage] Found ${orderRows.length} order rows. Checking statuses...`);

    for (const row of orderRows) {
      try {
        const statusElement = await this.statusTextInOrderRow(row);
        const statusText = (await statusElement.getText()).trim().toLowerCase();
        // console.log(`[AdminOrderMngPage] Row status: "${statusText}"`);
        if (statusText === statusToFind.toLowerCase()) {
          const idElement = await this.orderIdTextInOrderRow(row);
          const fullOrderId = (await idElement.getText()).trim(); // Lấy ID đầy đủ
          if (fullOrderId) {
            console.log(`[AdminOrderMngPage] Found order ${fullOrderId} with status ${statusToFind}`);
            return fullOrderId;
          }
        }
      } catch (e) { /* Bỏ qua lỗi tìm element trong dòng này, tiếp tục dòng khác */ }
    }
    console.log(`[AdminOrderMngPage] No order found with status: ${statusToFind}`);
    return null;
  }
  
  async navigateToOrderDetailPage(orderId: string): Promise<void> {
    console.log(`[AdminOrderMngPage] Clicking 'View Details' link for order ID: ${orderId}`);
    // Sử dụng data-testid cho link "Xem chi tiết"
    const detailsLinkLocator = this.viewDetailsLinkByDataTestId (orderId);
    const linkElement = await this.waitForElementClickable(detailsLinkLocator);
    await this.scrollIntoView(linkElement);
    await linkElement.click();
  }
}