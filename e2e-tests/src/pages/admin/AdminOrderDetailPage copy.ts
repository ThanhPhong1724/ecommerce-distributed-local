// src/pages/admin/AdminOrderDetailPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from '../BasePage'; // Điều chỉnh đường dẫn

export enum OrderStatusAdmin { // Giống OrderStatusApi nếu tên giống hệt
    PENDING = 'Pending',
    PROCESSING = 'Processing',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
    FAILED = 'Failed',
}


export class AdminOrderDetailPage extends BasePage {
  // --- LOCATORS (DỰA TRÊN AdminOrderDetailPage.tsx) ---
  // Tiêu đề: <h1 class="text-2xl font-bold text-gray-900">Chi tiết Đơn hàng #{order.id.substring(0, 8)}</h1>
  private pageTitleByIdPart = (orderIdShort: string) => 
    By.xpath(`//h1[normalize-space()='Chi tiết Đơn hàng #${orderIdShort}']`);
  
  // Element hiển thị trạng thái hiện tại (trong phần không chỉnh sửa)
  // <div className={`p-4 rounded-lg bg-gradient-to-r ${statusInfo.bgGradient} ...`}> <span className="font-semibold">...</span> </div>
//   private currentStatusDisplay = By.xpath(
//     "//div[h3[normalize-space()='Trạng thái đơn hàng']]/following-sibling::div[contains(@class, 'p-4') and contains(@class, 'rounded-lg')]//span[@class='font-semibold']"
//   );
private currentStatusDisplay = By.xpath("//span[@data-testid='current-order-status-text']");
  // Nút "Thay đổi" để mở form sửa trạng thái
  // <button onClick={() => setIsEditingStatus(true)} ...><FiEdit3 /> Thay đổi</button>
private editStatusButton = By.xpath("//button[@data-testid='edit-order-status-button']");
  // Select dropdown để chọn trạng thái mới (KHI Ở CHẾ ĐỘ SỬA)
  // <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatusApi)} ...>
private statusSelectWhenEditing = By.xpath("//select[@data-testid='order-status-select']");

  private statusOption = (statusValue: OrderStatusAdmin) => 
    // Giá trị của option trong JSX là "Pending", "Processing", etc.
    By.xpath(`//select[@data-testid='order-status-select']/option[@value='${statusValue}']`);
// private statusTextInOrderRow = (orderId: string) =>
//   By.xpath(`${this.orderRowByDataTestId(orderId).value}/td[5]//span[contains(@class, 'font-medium')]//span[@class='ml-1']`);

  // Nút "Cập nhật" trạng thái (KHI SỬA)
  private saveStatusButton = By.xpath(
      "//div[h3[normalize-space()='Trạng thái đơn hàng']]/following-sibling::div//button[contains(.,'Cập nhật') or contains(.,'Đang lưu')]"
      // HOẶC NẾU CÓ DATA-TESTID: //button[@data-testid='save-order-status-button-admin']
  );



  constructor(driver: WebDriver, orderId?: string) {
    // Path động, sẽ được set bởi navigateToPage
    super(driver, orderId ? `/admin/orders/${orderId}` : "/admin/orders"); 
  }

  async navigateToPage(orderId: string): Promise<void> {
    this.pageUrl = `/admin/orders/${orderId}`; // Cập nhật pagePath
    await this.navigate();
    await this.waitForPageToLoad(orderId);
  }

  async waitForPageToLoad(orderId: string, timeout: number = 15000): Promise<void> {
    const orderIdShort = orderId.substring(0, 8); // Giả sử ID trên tiêu đề là rút gọn
    console.log(`[AdminOrderDetailPage] Waiting for Order Detail page for ID (short) "${orderIdShort}" to load...`);
    if (!(await this.waitForUrlContains(`/admin/orders/${orderId}`, timeout))) {
         throw new Error(`Timeout or incorrect URL. Expected '/admin/orders/${orderId}', Current: '${await this.driver.getCurrentUrl()}'`);
    }
    await this.waitForElementVisible(this.pageTitleByIdPart(orderIdShort), timeout);
    // Chờ hiển thị trạng thái (sử dụng locator đã cập nhật)
    await this.waitForElementVisible(this.currentStatusDisplay, timeout); 
    console.log(`[AdminOrderDetailPage] Order Detail page for ID (short) "${orderIdShort}" loaded and status is visible.`);
  }

  async getCurrentStatus(timeout: number = 7000): Promise<string> {
    const statusElement = await this.waitForElementVisible(this.currentStatusDisplay, timeout);
    return (await statusElement.getText()).trim();
  }

  async clickEditStatusButton(): Promise<void> {
    console.log("[AdminOrderDetailPage] Clicking 'Edit Status' button...");
    await this.click(this.editStatusButton);
    // Chờ select box xuất hiện (sử dụng locator đã cập nhật)
    await this.waitForElementVisible(this.statusSelectWhenEditing, 5000); 
    console.log("[AdminOrderDetailPage] Status select dropdown is now visible.");
  }

  async selectNewStatus(newStatus: OrderStatusAdmin): Promise<void> {
    console.log(`[AdminOrderDetailPage] Selecting new status: ${newStatus}`);
    const selectBox = await this.waitForElementClickable(this.statusSelectWhenEditing);
    await selectBox.click(); 
    await this.driver.sleep(300); // Chờ options render
    const optionToSelect = this.statusOption(newStatus); // Sử dụng locator đã cập nhật
    await this.click(optionToSelect);
    console.log(`[AdminOrderDetailPage] Selected status: ${newStatus} from dropdown.`);
  }

  async clickSaveStatusButton(): Promise<void> {
    console.log("[AdminOrderDetailPage] Clicking 'Save Status' button...");
    await this.click(this.saveStatusButton); // Sử dụng locator đã cập nhật
    // Chờ một dấu hiệu cho thấy việc lưu đã xong, ví dụ nút "Thay đổi" xuất hiện lại
    // hoặc select box biến mất (nếu UI thay đổi sau khi lưu)
    await this.waitForElementVisible(this.editStatusButton, 10000); 
    console.log("[AdminOrderDetailPage] Status changes saved (Edit button is visible again).");
  }
   async updateStatusTo(newStatus: OrderStatusAdmin): Promise<void> {
    await this.clickEditStatusButton(); // Giả sử hàm này mở form/dropdown sửa status
    // Logic chọn newStatus từ dropdown/radio buttons
    // Ví dụ, nếu là select:
    // const selectBox = await this.waitForElementClickable(this.statusSelectWhenEditing);
    // await selectBox.click();
    // const optionToSelect = this.statusOption(newStatus); // statusOption cần nhận OrderStatusAdmin
    // await this.click(optionToSelect);
    await this.selectNewStatus(newStatus); // Giả sử bạn đã có hàm này
    await this.clickSaveStatusButton(); // Giả sử hàm này lưu thay đổi
    console.log(`[AdminOrderDetailPage] Status updated to ${newStatus}.`);
    await this.driver.sleep(1000); // Chờ UI refresh
  }
}