// e2e-tests/src/pages/RegisterPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  // Locators từ file RegisterPage.tsx của bạn
  private firstNameInput = By.id('firstName');
  private lastNameInput = By.id('lastName');
  private emailInput = By.id('email-address'); // Trùng ID với login, nhưng context khác
  private passwordInput = By.id('password');   // Trùng ID với login
  private registerButton = By.xpath("//button[normalize-space()='Đăng Ký' and @type='submit']");
  private loginLink = By.linkText('đăng nhập nếu đã có tài khoản');
  // Div chứa thông báo thành công:
  private successAlert = By.xpath("//div[contains(@class, 'bg-green-50')]//p[contains(@class, 'text-green-800')]");
  // Div chứa thông báo lỗi:
  private errorAlert = By.xpath("//div[contains(@class, 'bg-red-50')]//p[contains(@class, 'text-red-700')]");
  private pagePath = '/register'; // Đường dẫn của trang đăng ký

  constructor(driver: WebDriver) {
    super(driver);
  }

  async navigateToRegister(): Promise<void> {
    await this.navigate('/register'); // Giả sử route là /register
  }

  async enterFirstName(firstName: string): Promise<void> {
    await this.type(this.firstNameInput, firstName);
  }

  async enterLastName(lastName: string): Promise<void> {
    await this.type(this.lastNameInput, lastName);
  }

  async enterEmail(email: string): Promise<void> {
    await this.type(this.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async clickRegisterButton(): Promise<void> {
    await this.click(this.registerButton);
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickRegisterButton();
  }

  async getSuccessMessage(): Promise<string> {
    return this.getText(this.successAlert);
  }
  
  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.errorAlert);
    } catch (e) {
      return "";
    }
  }

  async clickLoginLink(): Promise<void> {
    await this.click(this.loginLink);
  }

  async isOnRegisterPage(timeout: number = 7000): Promise<boolean> {
      return this.waitForUrlContains(this.pagePath, timeout); // this.pagePath là "/register"
  }
}