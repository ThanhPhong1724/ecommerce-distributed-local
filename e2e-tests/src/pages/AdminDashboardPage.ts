// src/pages/AdminDashboardPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { TimeoutError } from 'selenium-webdriver/lib/error';

export class AdminDashboardPage extends BasePage {
  // --- LOCATORS ---
  // **QUAN TRỌNG: Kiểm tra lại các locator này cho phù hợp với HTML của bạn!**
  
  // Locator cho thông báo chào mừng quản trị viên
  // Nên tìm một cách cụ thể hơn nếu có thể, ví dụ data-testid
  private adminWelcomeText = By.xpath("//p[contains(text(), 'Xin chào, Quản trị viên') or contains(text(), 'Welcome, Admin')]");
  
  // Locator cho tiêu đề chính của trang dashboard (ví dụ: "Dashboard", "Bảng điều khiển")
  private dashboardTitle = By.xpath("//h1[normalize-space()='Dashboard Quản trị' or normalize-space()='Admin Dashboard']");

  constructor(driver: WebDriver) {
    // pageUrl là "/admin/dashboard"
    // BasePage constructor sẽ tự động kết hợp với baseUrl
    super(driver, "/admin/dashboard"); 
  }

  // Hàm riêng tư để chờ trang dashboard load hoàn chỉnh
  // Được gọi bởi các hàm public khác trước khi tương tác
  async waitForPageToLoad(timeout: number = 15000): Promise<void> { // Tăng timeout mặc định
    console.log("[AdminDashboardPage] Waiting for page to load...");
    // 1. Chờ URL đúng
    // this.pageUrl là "/admin/dashboard"
    // if (!(await this.waitForUrlContains(this.pageUrl, timeout))) {
    //      const currentUrl = await this.driver.getCurrentUrl();
    //      throw new Error(`Timeout or incorrect URL for Admin Dashboard. Expected URL to contain '${this.pageUrl}', but was: '${currentUrl}'`);
    // }
    const expectedPath = this.pageUrl; // là "/admin/products"
    await this.driver.wait(async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        // Kiểm tra xem URL hiện tại có KẾT THÚC bằng expectedPath không, 
        // hoặc bằng expectedPath + "/" (để xử lý cả hai trường hợp)
        return currentUrl.endsWith(expectedPath) || currentUrl.endsWith(expectedPath + "/");
    }, timeout, `URL did not end with '${expectedPath}'. Current URL: ${await this.driver.getCurrentUrl()}`);
    console.log("[AdminDashboardPage] URL confirmed. Waiting for dashboard title...");
    // 2. Chờ một element đặc trưng của trang này hiển thị
    await this.waitForElementVisible(this.dashboardTitle, timeout); // Sử dụng hàm chờ của BasePage
    console.log("[AdminDashboardPage] Page loaded (dashboard title visible).");
  }

  // Lấy nội dung thông báo chào mừng
  async getAdminWelcomeMessage(timeout: number = 7000): Promise<string> {
    await this.waitForPageToLoad(timeout); // Đảm bảo trang đã load
    return this.getText(this.adminWelcomeText, timeout); // getText từ BasePage đã bao gồm chờ visible
  }

  // Kiểm tra xem thông báo chào mừng có hiển thị không
  async isAdminWelcomeMessageDisplayed(timeout: number = 7000): Promise<boolean> {
    try {
        await this.waitForPageToLoad(timeout); // Đảm bảo trang đã load
        // isElementDisplayed từ BasePage đã bao gồm chờ visible
        return await this.isElementDisplayed(this.adminWelcomeText, timeout); 
    } catch (e) {
        console.error("[AdminDashboardPage] Error checking if admin welcome message is displayed:", e);
        return false; // Trả về false nếu có lỗi khi kiểm tra
    }
  }

  // (Bạn có thể thêm các hàm khác cho trang Admin Dashboard ở đây)
  // Ví dụ:
  // async getTotalUsers(): Promise<number> { ... }
  // async clickManageProductsLink(): Promise<void> { ... }
}