// src/pages/CheckoutPage.ts
import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  // --- LOCATORS ---
  // **QUAN TRỌNG: Kiểm tra và điều chỉnh các locator này!**
  private pageTitle = By.xpath("//h1[normalize-space()='Thanh toán']");
  
  // Textarea địa chỉ giao hàng
  // <textarea placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" ...>
  private shippingAddressTextarea = By.xpath(
    "//textarea[@placeholder='Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM']"
  );

  // Nút "Đặt hàng và Thanh toán"
  // <button ...> <FiLock /> <span>Đặt hàng và Thanh toán</span> </button>
  private placeOrderAndPayButton = By.xpath(
    "//button[contains(@class, 'bg-gradient-to-r') and .//span[normalize-space()='Đặt hàng và Thanh toán']]"
  );
  // Hoặc nếu có data-testid thì tốt hơn:
  // private placeOrderAndPayButton = By.xpath("//button[@data-testid='place-order-button']");

  // Locator cho thông báo lỗi (nếu có)
  private errorMessageDisplay = By.xpath(
    "//div[contains(@class, 'fixed') and contains(@class, 'bg-red-100')]"
  );


  constructor(driver: WebDriver) {
    super(driver, "/checkout"); 
  }

  async navigateToCheckout(): Promise<void> {
    await this.navigate();
    console.log(`[CheckoutPage] Navigated to ${await this.driver.getCurrentUrl()}. Waiting for page content...`);
    try {
      await this.waitForElementVisible(this.pageTitle, 15000);
      await this.waitForElementVisible(this.shippingAddressTextarea, 10000); // Chờ cả ô địa chỉ
      console.log("[CheckoutPage] Page content (title and address textarea) verified.");
    } catch (e) {
      console.warn("[CheckoutPage] Could not fully verify checkout page load.", e);
    }
  }

  async enterShippingAddress(address: string): Promise<void> {
    console.log(`[CheckoutPage] Entering shipping address: "${address}"`);
    await this.type(this.shippingAddressTextarea, address);
  }

  async clickPlaceOrderAndPay(): Promise<void> {
    console.log("[CheckoutPage] Clicking 'Place Order and Pay' button...");
    const button = await this.waitForElementClickable(this.placeOrderAndPayButton, 10000);
    await this.scrollIntoView(button); // Đảm bảo nút trong tầm nhìn
    await button.click();
    // Sau khi click, trang sẽ chuyển hướng đến VNPAY.
    // Test case sẽ cần chờ URL thay đổi.
  }

  async getErrorMessage(timeout: number = 3000): Promise<string | null> {
    try {
      const errorElement = await this.waitForElementVisible(this.errorMessageDisplay, timeout);
      return errorElement.getText();
    } catch (e) {
      // Không tìm thấy thông báo lỗi, trả về null
      return null;
    }
  }
}