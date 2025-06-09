// src/pages/ProductDetailPage.ts
import { By, WebDriver, WebElement, Key /* Bỏ until, Alert nếu không dùng trực tiếp */ } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { TimeoutError, NoSuchAlertError, NoSuchElementError } from 'selenium-webdriver/lib/error'; // Thêm NoSuchElementError

export class ProductDetailPage extends BasePage {
  // --- LOCATORS CHÍNH TRÊN TRANG CHI TIẾT SẢN PHẨM ---
  // **QUAN TRỌNG: Cập nhật các locator này cho chính xác với trang PDP của bạn!**
  private productNameHeader = By.xpath("//h1[contains(@class,'text-3xl font-bold')]"); // Ví dụ
  private productPriceDisplay = By.xpath( "//h2[contains(@class, 'text-4xl') and contains(@class, 'font-bold') and contains(@class, 'text-purple-600') and contains(., '₫')]" ); // Ví dụ, cần điều chỉnh theo cấu trúc HTML thực tế của trang PDP
  private stockQuantityTextLocator = By.xpath(
    "//span[normalize-space(text())='Kho hàng:']/following-sibling::span[contains(@class, 'font-medium') and (contains(@class, 'text-green-600') or contains(@class, 'text-orange-600'))]"
  );
  // private increaseQuantityButtonOnPdp = By.xpath("//div[contains(@data-testid, 'pdp-quantity-selector')]//button[@aria-label='Tăng số lượng']");
  // private decreaseQuantityButtonOnPdp = By.xpath("//div[contains(@data-testid, 'pdp-quantity-selector')]//button[@aria-label='Giảm số lượng']");
  
  private addToCartButtonOnPdp = By.xpath("//button[contains(., 'Thêm vào giỏ') and not(contains(., 'Hết hàng')) and not(@disabled)]");
  private outOfStockButtonOnPdp = By.xpath("//button[contains(., 'Hết hàng')]");

  // --- LOCATORS CHO PHẦN CHỌN SỐ LƯỢNG TRÊN PDP (SỬ DỤNG DATA-TESTID) ---
  private quantityInputOnPdp = By.xpath("//input[@data-testid='pdp-quantity-input']");
  private decreaseQuantityButtonOnPdp = By.xpath("//button[@data-testid='pdp-decrease-quantity-button']");
  private increaseQuantityButtonOnPdp = By.xpath("//button[@data-testid='pdp-increase-quantity-button']");

  constructor(driver: WebDriver) {
    super(driver, ""); // pagePath sẽ được set động
  }

  async navigateToProductDetail(productId: string): Promise<void> {
    const detailPath = `/products/${productId}`; 
    await this.navigate(detailPath); 
    console.log(`[ProductDetailPage] Navigated to ${await this.driver.getCurrentUrl()}. Waiting for PDP content...`);
    await this.waitForElementVisible(this.productNameHeader, 15000);
    await this.waitForElementVisible(this.productPriceDisplay, 10000); 
    await this.waitForElementVisible(this.stockQuantityTextLocator, 10000); 
    await this.waitForElementVisible(this.quantityInputOnPdp, 10000); // Chờ cả ô input số lượng
    console.log("[ProductDetailPage] PDP content (name, price, stock, quantity input) verified present in DOM.");
  }

  async getProductName(timeout: number = 7000): Promise<string> {
    return this.getText(this.productNameHeader, timeout);
  }

  async getProductPrice(timeout: number = 7000): Promise<string> { // Trả về string
    const priceElement = await this.waitForElementVisible(this.productPriceDisplay, timeout);
    const priceText = await priceElement.getText();
    console.log(`[ProductDetailPage] Raw price text from UI (PDP): "${priceText}"`);
    return priceText; 
  }

  async getStockQuantityText(timeout: number = 7000): Promise<string> {
    const element = await this.waitForElementVisible(this.stockQuantityTextLocator, timeout);
    return element.getText();
  }
  
  public async getCurrentQuantity(timeout: number = 7000): Promise<number> {
      const element = await this.waitForElementVisible(this.quantityInputOnPdp, timeout);
      const value = await element.getAttribute('value');
      return parseInt(value, 10);
  }
  
  // Hàm setQuantity giờ sẽ click nút +/-
  public async setQuantity(newQuantity: number, timeout: number = 7000): Promise<void> {
    console.log(`[ProductDetailPage] Attempting to set quantity to ${newQuantity}`);
    let currentQuantity = await this.getCurrentQuantity(timeout);
    console.log(`[ProductDetailPage] Current quantity is ${currentQuantity}`);

    if (newQuantity === currentQuantity) {
      console.log(`[ProductDetailPage] Quantity is already ${newQuantity}. No change needed.`);
      return;
    }

    const buttonToClickLocator = newQuantity > currentQuantity 
        ? this.increaseQuantityButtonOnPdp 
        : this.decreaseQuantityButtonOnPdp;
    
    const clicksNeeded = Math.abs(newQuantity - currentQuantity);
    console.log(`[ProductDetailPage] Need to click ${newQuantity > currentQuantity ? 'increase' : 'decrease'} button ${clicksNeeded} time(s).`);

    for (let i = 0; i < clicksNeeded; i++) {
      const buttonElement = await this.waitForElementClickable(buttonToClickLocator, timeout);
      // Kiểm tra xem nút có bị disabled không TRƯỚC KHI CLICK
      // (Hàm waitForElementClickable đã bao gồm kiểm tra isEnabled())
      // const isDisabled = await buttonElement.getAttribute('disabled');
      // if (isDisabled) {
      //   console.warn(`[ProductDetailPage] Button to change quantity is disabled. Cannot click. (Attempt ${i+1})`);
      //   break; // Thoát vòng lặp nếu nút bị disabled (ví dụ: đạt min/max số lượng)
      // }
      await buttonElement.click();
      console.log(`[ProductDetailPage] Clicked ${newQuantity > currentQuantity ? 'increase' : 'decrease'} button (click ${i+1}/${clicksNeeded})`);
      
      // Chờ giá trị trong input thực sự thay đổi
      const expectedIntermediateQty = newQuantity > currentQuantity ? currentQuantity + i + 1 : currentQuantity - i - 1;
      try {
        await this.driver.wait(async () => {
            const val = await (await this.findElement(this.quantityInputOnPdp)).getAttribute('value');
            return parseInt(val, 10) === expectedIntermediateQty;
        }, 3000, `Quantity input did not update to ${expectedIntermediateQty} after click ${i+1}.`);
        console.log(`[ProductDetailPage] Quantity visually updated to ${expectedIntermediateQty}.`);
      } catch (e) {
          console.warn(`[ProductDetailPage] Timeout/Error waiting for quantity input to visually update to ${expectedIntermediateQty}. Proceeding...`, e);
          await this.driver.sleep(500); // Fallback sleep ngắn
      }
    }
    const finalQuantity = await this.getCurrentQuantity(1000);
    console.log(`[ProductDetailPage] Final quantity in input: ${finalQuantity}`);
    if (finalQuantity !== newQuantity) {
        console.warn(`[ProductDetailPage] Could not set quantity to ${newQuantity}. Final quantity is ${finalQuantity}. Check max stock or button disabled states.`);
    }
  }

  async clickAddToCart(): Promise<void> {
    await this.click(this.addToCartButtonOnPdp, 10000); // Tăng timeout
    // Việc xử lý alert "Đã thêm vào giỏ hàng" sẽ do file test gọi acceptOptionalAlertIfPresent
  }

  async isOutOfStock(timeout: number = 3000): Promise<boolean> {
    return this.isElementDisplayed(this.outOfStockButtonOnPdp, timeout);
  }
}

