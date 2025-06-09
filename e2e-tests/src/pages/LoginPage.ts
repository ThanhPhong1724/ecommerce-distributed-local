// e2e-tests/src/pages/LoginPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';

export class LoginPage extends BasePage {
  // Locators từ file LoginPage.tsx của bạn
  private emailInput = By.id('email-address');
  private passwordInput = By.id('password');
  // Nút submit có thể là <button type="submit"> hoặc có class/id cụ thể
  // Dựa vào code của bạn, nút "Đăng Nhập" là button type="submit" trong form.
  // Hoặc có thể target button chứa text "Đăng Nhập"
  private loginButton = By.xpath("//button[normalize-space()='Đăng Nhập' and @type='submit']");
  private registerLink = By.linkText('tạo tài khoản mới');
  // Div chứa thông báo lỗi:
  private errorAlert = By.xpath("//div[contains(@class, 'bg-red-50')]//p[contains(@class, 'text-red-700')]");
  private pagePath = '/login'; // Đường dẫn của trang đăng nhập

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToLogin(): Promise<void> {
    await this.navigate('/login'); // Giả sử route là /login
  }

  async enterEmail(email: string): Promise<void> {
    await this.type(this.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  // async getErrorMessage(): Promise<string> {
  //   try {
  //     return await this.getText(this.errorAlert);
  //   } catch (e) {
  //     return ""; // Trả về rỗng nếu không tìm thấy, để test case có thể check
  //   }
  // }
  
  async getErrorMessage(timeout: number = 5000): Promise<string> { // Thêm tham số timeout
    try {
      // Gọi this.getText từ BasePage và truyền timeout vào
      return await this.getText(this.errorAlert, timeout); 
    } catch (e) {
      // Nếu không tìm thấy element sau timeout, getText (hoặc waitForElementVisible bên trong nó) sẽ ném lỗi
      // Lúc đó, chúng ta vẫn muốn trả về chuỗi rỗng để test case có thể so sánh
      if (e instanceof TimeoutError || e instanceof NoSuchElementError) {
          console.log("[LoginPage] No error message element found or timed out waiting for it.");
          return "";
      }
      console.error("[LoginPage] Unexpected error in getErrorMessage:", e);
      return ""; // Hoặc throw e nếu muốn test case fail ngay khi có lỗi lạ
    }
  }
  async clickRegisterLink(): Promise<void> {
    await this.click(this.registerLink);
  }

  async isOnLoginPage(timeout: number = 7000): Promise<boolean> {
      return this.waitForUrlContains(this.pagePath, timeout); // this.pagePath là "/login"
  }
}