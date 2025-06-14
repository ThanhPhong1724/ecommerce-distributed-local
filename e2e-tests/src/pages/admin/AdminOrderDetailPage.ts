// src/pages/admin/AdminOrderDetailPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage';
import { NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';

export enum OrderStatusAdmin { 
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}
export class AdminOrderDetailPage extends BasePage {
  // --- LOCATORS (Sử dụng data-testid đã thống nhất) ---
  private pageTitleByIdPart = (orderIdShort: string) => 
    By.xpath(`//h1[contains(normalize-space(),'Chi tiết Đơn hàng') and contains(normalize-space(),'#${orderIdShort}')]`);
  
  private currentStatusDisplay = By.xpath("//span[@data-testid='current-order-status-text']");
  private editStatusButton = By.xpath("//button[@data-testid='edit-order-status-button']");
  private statusSelectWhenEditing = By.xpath("//select[@data-testid='order-status-select']");
  private statusOptionByValue = (statusValue: OrderStatusAdmin) => 
    By.xpath(`//select[@data-testid='order-status-select']/option[@value='${statusValue}']`);
  private saveStatusButton = By.xpath("//button[@data-testid='confirm-status-update-button']");


  constructor(driver: WebDriver, orderId?: string) {
    super(driver, orderId ? `/admin/orders/${orderId}` : "/admin/orders");
    this.pageUrl = orderId ? `/admin/orders/${orderId}` : "/admin/orders";
  }

  async navigateToPage(orderId: string): Promise<void> {
    this.pageUrl = `/admin/orders/${orderId}`;
    await this.navigate();
  }

  async waitForPageToLoad(orderId: string, timeout: number = 20000): Promise<void> {
    const orderIdShort = orderId.substring(0, 8);
    console.log(`[AdminOrderDetailPage] Waiting for Order Detail page for ID "${orderId}" to load...`);
    
    try {
      await this.driver.wait(async () => (await this.driver.getCurrentUrl()).includes(this.pageUrl), timeout, 
        `URL did not contain '${this.pageUrl}'. Current: ${await this.driver.getCurrentUrl()}`);
      console.log(`[AdminOrderDetailPage] URL confirmed for order ${orderId}.`);
    } catch (e) { /* ... */ throw e; }
    
    await this.waitForElementVisible(this.pageTitleByIdPart(orderIdShort), timeout);
    console.log(`[AdminOrderDetailPage] Page title visible for order ${orderIdShort}.`);

    console.log("[AdminOrderDetailPage] Waiting for status display or edit controls...");
    await this.driver.wait(async () => {
        const editButtonVisible = await this.isElementDisplayed(this.editStatusButton, 1000);
        const selectBoxVisible = await this.isElementDisplayed(this.statusSelectWhenEditing, 1000);
        // console.log(`[ADP waitForPageToLoad] editButtonVisible: ${editButtonVisible}, selectBoxVisible: ${selectBoxVisible}`);
        // Nếu ở chế độ xem, nút Edit phải có. Nếu ở chế độ sửa, select box phải có.
        // Hoặc đơn giản hơn, chờ một trong hai element chính của phần trạng thái
        const statusDisplayVisible = await this.isElementDisplayed(this.currentStatusDisplay, 1000);
        return statusDisplayVisible || selectBoxVisible || editButtonVisible;
    }, timeout, "Neither current status display, nor edit button, nor status select dropdown found.");
    console.log(`[AdminOrderDetailPage] Order Detail page loaded (status display or edit controls are visible).`);
  }

  async getCurrentStatus(timeout: number = 7000): Promise<OrderStatusAdmin | string> {
    console.log("[AdminOrderDetailPage] Attempting to get current status...");
    // Ưu tiên kiểm tra xem có đang ở chế độ edit không (select box hiển thị)
    if (await this.isElementDisplayed(this.statusSelectWhenEditing, 1000)) {
        const selectEl = await this.findElement(this.statusSelectWhenEditing);
        const selectedValue = await selectEl.getAttribute("value");
        console.log(`[AdminOrderDetailPage] In edit mode, status from select value: "${selectedValue}"`);
        const matchedStatusFromSelect = Object.values(OrderStatusAdmin).find(s => s === selectedValue.toLowerCase());
        return matchedStatusFromSelect || selectedValue.toLowerCase();
    } 
    // Nếu không, lấy từ text hiển thị (khi không edit)
    try {
        const statusElement = await this.waitForElementVisible(this.currentStatusDisplay, timeout);
        const statusText = (await statusElement.getText()).trim().toLowerCase();
        console.log(`[AdminOrderDetailPage] In display mode, status text from UI: "${statusText}"`);
        const matchedStatusFromDisplay = Object.values(OrderStatusAdmin).find(s => s === statusText);
        return matchedStatusFromDisplay || statusText;
    } catch (e) {
        console.error(`[AdminOrderDetailPage] Could not get current status. Neither edit select nor display text found.`, e);
        throw new Error(`Could not determine current order status. Error: ${(e as Error).message}`);
    }
  }

  async clickEditStatusButton(): Promise<void> {
    console.log("[AdminOrderDetailPage] Clicking 'Edit Status' button...");
    await this.click(this.editStatusButton, 7000);
    await this.waitForElementVisible(this.statusSelectWhenEditing, 5000); 
    console.log("[AdminOrderDetailPage] Status select dropdown is now visible (edit mode).");
  }

  async selectNewStatus(newStatus: OrderStatusAdmin): Promise<void> {
    console.log(`[AdminOrderDetailPage] Selecting new status: ${newStatus} (value: '${newStatus}')`);
    const selectBoxElement = await this.waitForElementClickable(this.statusSelectWhenEditing);
    // Đối với <select>, cách đáng tin cậy nhất là click vào option có value mong muốn
    const optionToSelectLocator = this.statusOptionByValue(newStatus);
    const optionElement = await this.waitForElementClickable(optionToSelectLocator, 5000);
    await optionElement.click(); 
    console.log(`[AdminOrderDetailPage] Clicked option for status: ${newStatus}.`);
    // Select HTML thường tự cập nhật value, không cần click lại select box
  }

  async clickSaveStatusButton(): Promise<void> {
    console.log("[AdminOrderDetailPage] Clicking 'Save Status' (Update) button...");
    await this.click(this.saveStatusButton, 7000); 
    
    // Chờ một dấu hiệu cho thấy form edit đã đóng, ví dụ nút "Edit Status" xuất hiện lại
    console.log("[AdminOrderDetailPage] Waiting for status save to complete (edit button to reappear)...");
    try {
        await this.waitForElementVisible(this.editStatusButton, 10000); 
        console.log("[AdminOrderDetailPage] Status changes likely saved (Edit button is visible again).");
    } catch (e) {
        console.warn("[AdminOrderDetailPage] Edit button did not reappear after save. UI update unclear.", e);
    }
  }

   async updateStatusTo(newStatus: OrderStatusAdmin): Promise<void> {
    console.log(`[AdminOrderDetailPage] Starting updateStatusTo: ${newStatus}`);
    // Chỉ click Edit nếu dropdown chọn trạng thái chưa hiển thị
    if (!(await this.isElementDisplayed(this.statusSelectWhenEditing, 1000))) {
        await this.clickEditStatusButton();
    } else {
        console.log("[AdminOrderDetailPage] Already in status edit mode (select box visible).");
    }
    await this.selectNewStatus(newStatus);
    await this.clickSaveStatusButton();
    console.log(`[AdminOrderDetailPage] Status update process to ${newStatus} initiated.`);
  }
}