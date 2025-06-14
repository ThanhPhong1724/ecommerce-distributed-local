// src/pages/admin/AdminDashboardPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from '../BasePage';

export class AdminDashboardPage extends BasePage {
  // Locator cho tiêu đề chính của trang dashboard
  private dashboardTitleLocator = By.xpath("//h1[normalize-space()='Dashboard Quản trị' or normalize-space()='Admin Dashboard']");
  // Lời chào
  private adminWelcomeTextLocator = By.xpath("//p[contains(text(), 'Xin chào, Quản trị viên')]");
  // Nút Logout
  private logoutButtonLocator = By.xpath("//button[@data-testid='admin-logout-button']");
  constructor(driver: WebDriver) {
    super(driver, "/admin/dashboard"); 
  }

  async navigateToPage(): Promise<void> {
    await this.navigate(); // Gọi navigate của BasePage để đến "/admin/dashboard"
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad(timeout: number = 15000): Promise<void> {
    console.log("[AdminDashboardPage] Waiting for Admin Dashboard page to load...");
    // pagePath được kế thừa và có giá trị "/admin/dashboard"
    if (!(await this.waitForUrlContains(this.pageUrl, timeout))) {
         const currentUrl = await this.driver.getCurrentUrl();
         throw new Error(`Timeout or incorrect URL for Admin Dashboard. Expected URL to contain '${this.pageUrl}' (Full: '${this.getPageUrl()}'), but was: '${currentUrl}'`);
    }
    console.log("[AdminDashboardPage] URL confirmed. Waiting for dashboard title...");
    await this.waitForElementVisible(this.dashboardTitleLocator, timeout); // Sử dụng locator đã định nghĩa
    console.log("[AdminDashboardPage] Admin Dashboard page loaded (title visible).");
  }

  // Hàm này kiểm tra tiêu đề trang có hiển thị không (nếu file test cần gọi tường minh)
  async isPageTitleVisible(timeout: number = 7000): Promise<boolean> {
      return this.isElementDisplayed(this.dashboardTitleLocator, timeout);
  }

  async getAdminWelcomeMessage(timeout: number = 7000): Promise<string> {
    // waitForPageToLoad nên được gọi trước bởi hàm trong file test hoặc navigateToPage
    const welcomeElement = await this.waitForElementVisible(this.adminWelcomeTextLocator, timeout);
    return welcomeElement.getText();
  }

  async isAdminWelcomeMessageDisplayed(timeout: number = 7000): Promise<boolean> {
    // waitForPageToLoad nên được gọi trước
    return this.isElementDisplayed(this.adminWelcomeTextLocator, timeout); 
  }

  async logout(): Promise<void> { 
    console.log("[AdminDashboardPage] Attempting admin logout...");
    const logoutBtn = await this.waitForElementClickable(this.logoutButtonLocator, 10000);
    await this.scrollIntoView(logoutBtn); 
    await logoutBtn.click();
    console.log("[AdminDashboardPage] Admin logout button clicked.");
    // Chờ trang login load (ví dụ)
    // const loginPage = new LoginPage(this.driver); // Có thể cần tạo instance nếu không có sẵn
    // await loginPage.waitForPageToLoad(); // Giả sử LoginPage có hàm này
  }

}