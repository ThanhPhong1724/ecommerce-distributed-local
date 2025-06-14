// src/pages/admin/AdminUserManagementPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage'; // Điều chỉnh đường dẫn nếu cần
import { NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';

export class AdminUserManagementPage extends BasePage {
  // --- LOCATORS ---
  // **QUAN TRỌNG: Xác minh và điều chỉnh các locator này dựa trên HTML thực tế!**

  // Tiêu đề trang
  private pageTitle = By.xpath("//h2[normalize-space()='Quản lý Người dùng']");

  // Bảng chứa danh sách người dùng
  private usersTable = By.xpath("//table[thead//th[contains(text(),'Người dùng')]]"); 
  // Hoặc một locator cụ thể hơn cho table, ví dụ: By.xpath("//div[@class='bg-white shadow-sm rounded-lg']//table")

  // Một dòng (tr) bất kỳ trong tbody của bảng người dùng (để kiểm tra có user nào không)
  private anyUserRowInTable = By.xpath("//table[thead//th[contains(text(),'Người dùng')]]/tbody/tr");

  // Ô tìm kiếm người dùng (nếu có)
  private searchUserInput = By.xpath("//input[@placeholder='Tìm kiếm người dùng...']");

  // Nút "Thêm người dùng" (nếu có)
  private addUserButton = By.xpath("//button[contains(., 'Thêm người dùng')]");

  

  // LOCATORS CHO CÁC TÍNH NĂNG QUẢN LÝ NGƯỜI DÙNG*******************
  // --- LOCATORS CỤ THỂ CHO MỘT USER ROW (CẦN HTML ĐỂ XÁC MINH) ---
  // Tìm dòng tr của user dựa vào email
  private userRowByEmail = (email: string) => 
    By.xpath(`//table/tbody/tr[.//td[contains(normalize-space(), '${email}')]]`);

  // Từ một userRow (WebElement), tìm cột hiển thị vai trò
  // Giả sử cột vai trò là cột thứ 2 (index 1) hoặc có class/data-testid cụ thể
  private roleCellInRow = By.xpath("./td[2]//span | ./td[2]"); // Lấy text từ span trong td[2] hoặc trực tiếp từ td[2]
                                                               // **CẬP NHẬT INDEX HOẶC LOCATOR CHO CỘT VAI TRÒ**

  // Từ một userRow, tìm nút "Sửa" hoặc "Actions" rồi "Sửa vai trò"
  private editUserButtonInRow = By.xpath(
    ".//button[contains(@aria-label, 'Sửa') or contains(., 'Sửa') or @data-testid='edit-user-button']"
  ); 
  // **CẬP NHẬT LOCATOR NÀY**

  // --- LOCATORS CHO MODAL/FORM SỬA VAI TRÒ (CẦN HTML ĐỂ XÁC MINH) ---
  private roleModal = By.xpath("//div[@role='dialog' and .//h3[contains(text(), 'Cập nhật vai trò')]]"); // Ví dụ
  private roleSelectDropdownInModal = By.id("user-role-select-in-modal"); // **CẬP NHẬT**
  private roleOptionInModal = (role: 'Admin' | 'User') => By.xpath(`//select[@id='user-role-select-in-modal']/option[@value='${role.toLowerCase()}'] | //div[@role='listbox']//li[normalize-space()='${role}']`); // **CẬP NHẬT**
  private saveRoleButtonInModal = By.xpath("//div[@role='dialog']//button[normalize-space()='Lưu' or normalize-space()='Cập nhật']"); // **CẬP NHẬT**
  private cancelRoleButtonInModal = By.xpath("//div[@role='dialog']//button[normalize-space()='Hủy']"); // **CẬP NHẬT**

  //**************************************************************** */
  constructor(driver: WebDriver) {
    super(driver, "/admin/users"); // Giả sử URL của trang này là /admin/users
  }

  async navigateToPage(): Promise<void> {
    await this.navigate();
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad(timeout: number = 15000): Promise<void> {
    console.log("[AdminUserMngPage] Waiting for User Management page to load...");
    if (!(await this.waitForUrlContains(this.pageUrl, timeout))) { // pageUrl là "/admin/users"
         const currentUrl = await this.driver.getCurrentUrl();
         throw new Error(`Timeout or incorrect URL. Expected to contain '${this.pageUrl}', but was: '${currentUrl}'`);
    }
    console.log("[AdminUserMngPage] URL confirmed. Waiting for page title and users table...");
    await this.waitForElementVisible(this.pageTitle, timeout);
    // Chờ bảng user hoặc thông báo không có user (nếu có)
    // Hiện tại, chúng ta chỉ chờ bảng user, vì test ADMFUNC002 mong đợi thấy user
    await this.waitForElementVisible(this.usersTable, timeout); 
    console.log("[AdminUserMngPage] User Management page loaded (title and table visible).");
  }

  /**
   * Kiểm tra xem có ít nhất một dòng người dùng nào được hiển thị trong bảng không.
   */
  async areUsersDisplayed(timeout: number = 7000): Promise<boolean> {
    console.log("[AdminUserMngPage] Checking if any users are displayed in the table...");
    // Chờ bảng xuất hiện trước
    try {
        await this.waitForElementVisible(this.usersTable, timeout);
        const result = await this.isElementDisplayed(this.anyUserRowInTable, 2000); // Check nhanh có dòng nào không
        console.log(`[AdminUserMngPage] areUsersDisplayed result: ${result}`);
        return result;
    } catch (e) {
        console.warn("[AdminUserMngPage] Error or timeout checking for user rows:", e);
        return false;
    }
  }

  /**
   * Đếm số lượng người dùng đang hiển thị trong bảng.
   */
  async getDisplayedUserCount(timeout: number = 7000): Promise<number> {
    try {
      // Chờ bảng và ít nhất một dòng user xuất hiện
      await this.waitForElementVisible(this.anyUserRowInTable, timeout);
      const userRows = await this.driver.findElements(this.anyUserRowInTable);
      console.log(`[AdminUserMngPage] Found ${userRows.length} user rows.`);
      return userRows.length;
    } catch (e) {
      console.warn("[AdminUserMngPage] Error or timeout getting user count, returning 0.", e);
      return 0;
    }
  }

  /**
   * Kiểm tra xem một người dùng với email cụ thể có trong danh sách không.
   * Cần locator chính xác cho cột email trong bảng.
   */
  async isUserInList(email: string, timeout: number = 7000): Promise<boolean> {
    // Locator này tìm một dòng <tr> chứa một <td> có text là email
    // **CẦN XÁC MINH CẤU TRÚC BẢNG VÀ CỘT EMAIL**
    const userRowByEmailLocator = By.xpath(
      `//table/tbody/tr[.//td[contains(normalize-space(), '${email}')]]`
    );
    console.log(`[AdminUserMngPage] Checking for user with email: ${email}`);
    return this.isElementDisplayed(userRowByEmailLocator, timeout);
  }

  // (Các hàm cho ADMFUNC003 - Cập nhật vai trò - sẽ phức tạp hơn, cần locator cho nút sửa, dropdown vai trò, nút lưu)
  // --- CÁC HÀM MỚI CHO ADMFUNC003 ---
  // private async getUserRow(email: string, timeout: number = 7000): Promise<WebElement> {
  //   const userRowLocator = this.userRowByEmail(email);
  //   return this.waitForElementVisible(userRowLocator, timeout, `User row for email "${email}" not found.`);
  // }

  // async getUserRole(email: string, timeout: number = 7000): Promise<string | null> {
  //   console.log(`[AdminUserMngPage] Getting role for user: ${email}`);
  //   try {
  //     const userRow = await this.getUserRow(email, timeout);
  //     const roleElement = await userRow.findElement(this.roleCellInRow); // Tìm con từ userRow
  //     const roleText = (await roleElement.getText()).trim();
  //     console.log(`[AdminUserMngPage] Role for ${email} is: "${roleText}"`);
  //     return roleText;
  //   } catch (e) {
  //     console.error(`[AdminUserMngPage] Could not get role for user ${email}:`, e);
  //     return null;
  //   }
  // }

  // async clickEditRoleButtonForUser(email: string, timeout: number = 7000): Promise<void> {
  //   console.log(`[AdminUserMngPage] Clicking edit role for user: ${email}`);
  //   const userRow = await this.getUserRow(email, timeout);
  //   const editButton = await this.waitForElementClickableInParent(userRow, this.editUserButtonInRow, timeout);
  //   await editButton.click();
  //   // Chờ modal/form sửa vai trò xuất hiện
  //   await this.waitForElementVisible(this.roleModal, 10000); // Chờ modal
  //   console.log(`[AdminUserMngPage] Edit role modal/form appeared for ${email}.`);
  // }

  async selectNewRoleInForm(newRole: 'Admin' | 'User', timeout: number = 5000): Promise<void> {
    // Logic này phụ thuộc vào UI của bạn là dropdown hay radio buttons
    console.log(`[AdminUserMngPage] Selecting new role: ${newRole}`);
    // Ví dụ với select dropdown:
    const selectElement = await this.waitForElementClickable(this.roleSelectDropdownInModal, timeout);
    await selectElement.click(); // Mở dropdown
    const optionLocator = this.roleOptionInModal(newRole);
    const optionElement = await this.waitForElementClickable(optionLocator, timeout);
    await optionElement.click();
    console.log(`[AdminUserMngPage] Selected role: ${newRole}`);
  }

  async saveRoleChanges(timeout: number = 7000): Promise<void> {
    console.log(`[AdminUserMngPage] Clicking save role changes button...`);
    await this.click(this.saveRoleButtonInModal, timeout);
    // Chờ modal biến mất hoặc một thông báo thành công
    // Ví dụ: chờ modal biến mất
    await this.driver.wait(async () => {
        return !(await this.isElementDisplayed(this.roleModal, 500));
    }, 10000, "Role change modal did not disappear after saving.");
    console.log(`[AdminUserMngPage] Role changes saved, modal closed.`);
    // Có thể cần chờ danh sách user load lại
    await this.waitForPageToLoad(5000); // Gọi lại để chờ bảng refresh
  }
}