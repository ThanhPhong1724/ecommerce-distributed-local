// src/pages/HomePage.ts
import { By, WebDriver, WebElement, until } from 'selenium-webdriver'; // Thêm until
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Locator cho nút menu người dùng (button có chứa div với chữ cái đầu)
  // Chúng ta sẽ nhắm vào button vì đó là element tương tác để hover/click
  private userMenuButtonDesktop = By.xpath(
    "//div[contains(@class, 'relative group')]/button[contains(@class, 'flex items-center space-x-2')]"
  );

  // Locator cho panel dropdown KHI NÓ ĐÃ HIỂN THỊ (sau khi hover)
  // Dựa vào class 'opacity-100' và 'visible' mà nó có khi hover
  private dropdownPanelVisible = By.xpath(
    "//div[contains(@class, 'relative group')]//div[contains(@class, 'absolute') and contains(@class, 'opacity-100') and contains(@class, 'visible')]"
  );

  // Locator cho element <p> chứa email BÊN TRONG dropdown đã hiển thị
  private userEmailInVisibleDropdown = By.xpath(
    "//div[contains(@class, 'opacity-100') and contains(@class, 'visible')]//div[contains(@class, 'px-4 py-2 border-b')]//p[contains(@class, 'text-sm text-gray-600') and contains(., '@')]"
  );
  // Thêm contains(., '@') để chắc chắn hơn đó là email
  // Locator cho nút "Đăng xuất" BÊN TRONG dropdown
  // HTML: <button class="menu-item text-red-600 hover:bg-red-50"><FiX ... /><span>Đăng xuất</span></button>
  private logoutButtonInDropdown = By.xpath(
    "//div[contains(@class, 'opacity-100') and contains(@class, 'visible')]//button[contains(@class, 'menu-item') and contains(., 'Đăng xuất')]"
  );

  // (Tùy chọn) Locator cho nút "Đăng nhập" trên Navbar (để xác minh sau khi logout)
  private loginNavButton = By.xpath("//div[@class='hidden md:flex items-center space-x-4']//a[normalize-space()='Đăng nhập']");

  constructor(driver: WebDriver) {
    super(driver, "/"); 
  }

  // Hàm này chờ các yếu tố cơ bản của trang chủ (ví dụ: nút menu người dùng phải có trong DOM)
  public async waitForPageToLoad(timeout: number = 10000): Promise<void> {
    console.log("[HomePage] Waiting for page to load (user menu button presence)...");
    if (!(await this.waitForUrlContains(this.pageUrl, timeout))) {
        const currentUrl = await this.driver.getCurrentUrl();
        const expectedBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0,-1) : this.baseUrl;
        if (currentUrl !== expectedBase && currentUrl !== `${expectedBase}/`) {
             throw new Error(`Timeout or incorrect URL for Home Page. Expected: '${this.getPageUrl()}' or '${expectedBase}', but was: '${currentUrl}'`);
        }
    }
    // Chỉ cần chờ nút menu người dùng có trong DOM, không nhất thiết phải visible ngay
    await this.waitForElementLocated(this.userMenuButtonDesktop, timeout);
    console.log("[HomePage] Page loaded (user menu button is present in DOM).");
  }

  // Hàm này kiểm tra xem nút menu có thực sự hiển thị không (sau khi trang đã load)
  async isUserMenuButtonDisplayed(timeout: number = 10000): Promise<boolean> {
    try {
      // Hàm này chỉ nên kiểm tra visibility của nút, không cần gọi lại waitForPageToLoad
      // vì hàm gọi nó (trong file test) nên đã đảm bảo trang load rồi.
      return await this.isElementDisplayed(this.userMenuButtonDesktop, timeout);
    } catch (e) { 
      console.error("[HomePage] Error checking if user menu button is displayed:", e);
      return false; 
    }
  }

  async getUserEmailFromDropdown(timeout: number = 15000): Promise<string> {
    console.log("[HomePage] getUserEmailFromDropdown: Ensuring HomePage is loaded...");
    await this.waitForPageToLoad(timeout); // Chờ trang chủ load các element cơ bản
    
    console.log("[HomePage] getUserEmailFromDropdown: Finding userMenuButtonDesktop...");
    const userMenuButton = await this.waitForElementVisible(this.userMenuButtonDesktop, timeout);
    console.log("[HomePage] getUserEmailFromDropdown: userMenuButtonDesktop found and visible.");

    console.log("[HomePage] getUserEmailFromDropdown: Performing hover action...");
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: userMenuButton }).perform();
    console.log("[HomePage] getUserEmailFromDropdown: Hover action performed.");

    // QUAN TRỌNG: Chờ cho panel dropdown thực sự TRỞ NÊN VISIBLE
    // Dựa vào class 'opacity-100' và 'visible'
    console.log("[HomePage] getUserEmailFromDropdown: Waiting for dropdown panel to become visible...");
    try {
      await this.waitForElementVisible(this.dropdownPanelVisible, 7000); // Chờ panel có opacity-100 và visible
      console.log("[HomePage] getUserEmailFromDropdown: Dropdown panel is visible.");
    } catch (e) {
      console.error("[HomePage] getUserEmailFromDropdown: Dropdown panel did not become visible after hover.", e);
      // Chụp ảnh màn hình ở đây có thể hữu ích để debug
      // await this.driver.takeScreenshot().then(img => require('fs').writeFileSync(`error_dropdown_not_visible_${Date.now()}.png`, img, 'base64'));
      throw new Error("Dropdown panel did not become visible after hover. " + (e as Error).message);
    }
    
    // Sau khi panel đã visible, lấy text của email
    console.log("[HomePage] getUserEmailFromDropdown: Waiting for userEmailInDropdown to become visible within the panel...");
    const emailText = await this.getText(this.userEmailInVisibleDropdown, 5000); // Timeout ngắn hơn vì panel đã visible
    console.log(`[HomePage] getUserEmailFromDropdown: Email text retrieved: "${emailText}"`);
    return emailText;
  }
  
// === HÀM LOGOUT MỚI ===
  async logout(): Promise<void> {
    console.log("[HomePage] Attempting to logout...");
    const userMenuButton = await this.waitForElementClickable(this.userMenuButtonDesktop, 7000);
    
    // Thực hiện hover để mở dropdown
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: userMenuButton }).perform();
    console.log("[HomePage] Hovered over user menu button.");

    // Chờ panel dropdown hiển thị
    await this.waitForElementVisible(this.dropdownPanelVisible, 5000);
    console.log("[HomePage] Dropdown panel is visible.");

    // Click nút đăng xuất
    const logoutBtn = await this.waitForElementClickable(this.logoutButtonInDropdown, 5000);
    console.log("[HomePage] Clicking logout button...");
    await logoutBtn.click();

    // Sau khi logout, ứng dụng có thể chuyển hướng hoặc reload.
    // Test case (FUNC005) sẽ chịu trách nhiệm xác minh trạng thái sau logout.
    // Ví dụ, chờ URL thay đổi thành /login hoặc chờ nút Login xuất hiện lại.
    console.log("[HomePage] Logout action performed.");
  }

  // (Tùy chọn) Hàm kiểm tra nút Login có hiển thị không (dùng sau khi logout)
  async isLoginButtonDisplayed(timeout: number = 5000): Promise<boolean> {
    return this.isElementDisplayed(this.loginNavButton, timeout);
  }
}