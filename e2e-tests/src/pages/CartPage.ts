// src/pages/CartPage.ts
import { By, WebDriver, WebElement, Key, error as WebDriverError } from 'selenium-webdriver';
import { 
    TimeoutError, 
    NoSuchAlertError,
    NoSuchElementError,
    ElementClickInterceptedError,
    UnexpectedAlertOpenError,
    StaleElementReferenceError
} from 'selenium-webdriver/lib/error';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // --- LOCATORS ---
  private pageTitle = By.xpath("//h1[normalize-space()='Giỏ hàng của bạn' or normalize-space()='Your Cart']");
  
  // Locator cho container cha của MỖI item trong giỏ hàng, dựa vào sự tồn tại của input số lượng với data-testid
  private cartItemContainerByProductId = (productId: string) => By.xpath(
    `//div[contains(@class, 'p-6') and .//input[@data-testid='cart-quantity-input-${productId}']]`
    // Hoặc một class chung ổn định hơn cho mỗi item row nếu có, ví dụ:
    // `//div[@data-testid='cart-item-row-${productId}']`
  );
  // Locator chung để đếm tất cả các item (dựa vào data-testid của input)
  private allCartItemQuantityInputs = By.xpath("//input[starts-with(@data-testid, 'cart-quantity-input-')]");
  
  private emptyCartMessage = By.xpath("//h2[normalize-space()='Giỏ hàng trống' or normalize-space()='Your cart is empty']");
  private checkoutButton = By.xpath("//button[.//span[contains(text(),'Tiến hành đặt hàng')] or contains(text(),'Proceed to Checkout')]");
  private totalAmountDisplay = By.xpath(
  "//div[contains(@class, 'justify-between') and contains(@class, 'text-lg') and ./span[normalize-space()='Tổng cộng']]/span[2]"
  );  

  // --- LOCATORS ĐỘNG (THEO PRODUCT ID) ---
  private quantityInputByProductId(productId: string): By {
    return By.xpath(`//input[@data-testid='cart-quantity-input-${productId}']`);
  }
  private increaseQuantityButtonByProductId(productId: string): By {
    return By.xpath(`//button[@data-testid='cart-increase-quantity-button-${productId}']`);
  }
  private decreaseQuantityButtonByProductId(productId: string): By {
    return By.xpath(`//button[@data-testid='cart-decrease-quantity-button-${productId}']`);
  }
  private removeButtonByProductId(productId: string): By {
    return By.xpath(`//button[@data-testid='remove-cart-item-button-${productId}']`);
  }
  // Hàm này có thể vẫn hữu ích nếu bạn cần tìm item theo tên hiển thị trước, rồi mới lấy ID
  private productContainerByName(productName: string): By {
    return By.xpath(
      `//div[contains(@class, 'p-6') and .//h3[normalize-space()="${productName}"]]`
    );
  }
  
  constructor(driver: WebDriver) {
    super(driver, "/cart"); 
  }

  async navigateToCart(): Promise<void> {
    await this.navigate(); 
    console.log(`[CartPage] Navigated to ${await this.driver.getCurrentUrl()}. Waiting for cart content...`);
    try {
      await this.driver.wait(async () => {
        const titlePresent = await this.isElementDisplayed(this.pageTitle, 1000);
        if (!titlePresent) return false; 
        const itemsPresent = await this.isElementDisplayed(this.allCartItemQuantityInputs, 1000); // Dùng allCartItemInputs để check
        const emptyMsgPresent = await this.isElementDisplayed(this.emptyCartMessage, 1000);
        return itemsPresent || emptyMsgPresent;
      }, 15000, "Cart page did not display title AND (items or empty message).");
      console.log("[CartPage] Cart page content verified (title and items/empty message).");
    } catch (e) {
      console.warn("CartPage: Could not fully verify cart page load.", e);
    }
  }

  async getCartItemsCount(timeout: number = 15000): Promise<number> {
    console.log("[CartPage] Attempting to get cart items count...");
    try {
        await this.driver.wait(async () => {
            const titlePresent = await this.isElementDisplayed(this.pageTitle, 1000);
            if (!titlePresent) return false; 
            const itemsFound = await this.driver.findElements(this.allCartItemQuantityInputs).then(els => els.length > 0).catch(() => false);
            const emptyMsgFound = await this.isElementDisplayed(this.emptyCartMessage, 1000);
            return itemsFound || emptyMsgFound; 
        }, timeout, "Cart page did not show items (based on quantity inputs) or empty message for getCartItemsCount.");

        const elements = await this.driver.findElements(this.allCartItemQuantityInputs).catch(() => []);
        console.log(`[CartPage] Found ${elements.length} cart item quantity inputs (items).`);
        return elements.length;
    } catch (e) {
        console.warn("[CartPage] Error or Timeout in getCartItemsCount, returning 0.", e);
        return 0;
    }
  }

  async isCartEmptyMessageVisible(timeout: number = 7000): Promise<boolean> {
    return this.isElementDisplayed(this.emptyCartMessage, timeout);
  }

  async isCartEmpty(timeout: number = 10000): Promise<boolean> {
    console.log("[CartPage] Checking if cart is empty...");
    if (await this.isCartEmptyMessageVisible(timeout / 2)) {
        console.log("[CartPage] 'Empty cart' message IS visible. Cart is empty.");
        return true;
    }
    const itemsPresent = await this.isElementDisplayed(this.allCartItemQuantityInputs, timeout / 2);
    if (itemsPresent) {
        console.log("[CartPage] Cart items ARE present (based on quantity inputs). Cart is NOT empty.");
        return false;
    }
    console.warn("[CartPage] Neither empty message nor cart items found. Assuming empty but this is ambiguous.");
    return true; 
  }
  
  async isProductInCart(productId: string, timeout: number = 7000): Promise<boolean> { // Thay bằng productId
    return this.isElementDisplayed(this.cartItemContainerByProductId(productId), timeout);
  }

  async getProductQuantityInCart(productId: string, timeout: number = 7000): Promise<number> { // Thay bằng productId
      const inputLocator = this.quantityInputByProductId(productId);
      const inputElement = await this.waitForElementVisible(inputLocator, timeout);
      const value = await inputElement.getAttribute('value');
      return parseInt(value, 10);
  }

  async updateProductQuantityInCart(productId: string, productNameForLog: string, newQuantity: number, timeout: number = 7000): Promise<void> {
    console.log(`[CartPage] Attempting to update quantity for product (ID: ${productId}, Name: "${productNameForLog}") to ${newQuantity} by clicking +/- buttons.`);
    
    let currentQuantity = await this.getProductQuantityInCart(productId, timeout);
    console.log(`[CartPage] Current quantity for "${productNameForLog}" is ${currentQuantity}. Target: ${newQuantity}`);

    if (newQuantity === currentQuantity) {
      console.log(`[CartPage] Quantity is already ${newQuantity}. No update needed.`);
      return;
    }

    const buttonToClickLocator = newQuantity > currentQuantity 
        ? this.increaseQuantityButtonByProductId(productId) 
        : this.decreaseQuantityButtonByProductId(productId);
    
    const clicksNeeded = Math.abs(newQuantity - currentQuantity);
    console.log(`[CartPage] Need to click ${newQuantity > currentQuantity ? 'INCREASE' : 'DECREASE'} button ${clicksNeeded} time(s).`);

    for (let i = 0; i < clicksNeeded; i++) {
      console.log(`[CartPage] Clicking ${newQuantity > currentQuantity ? 'increase' : 'decrease'} button for "${productNameForLog}" (click ${i + 1}/${clicksNeeded})`);
      const buttonElement = await this.waitForElementClickable(buttonToClickLocator, timeout);
      
      const isDisabled = await buttonElement.getAttribute('disabled');
      if (isDisabled) {
        console.warn(`[CartPage] Button for "${productNameForLog}" is disabled. Cannot perform click ${i + 1}.`);
        break; 
      }
      
      await buttonElement.click();
      
      const expectedIntermediateQty = newQuantity > currentQuantity ? currentQuantity + i + 1 : currentQuantity - i - 1;
      try {
        await this.driver.wait(async () => {
            const val = await (await this.findElement(this.quantityInputByProductId(productId))).getAttribute('value');
            return parseInt(val, 10) === expectedIntermediateQty;
        }, 5000, `Quantity input for "${productNameForLog}" did not update to ${expectedIntermediateQty} after click ${i+1}.`);
        console.log(`[CartPage] Quantity for "${productNameForLog}" visually updated to ${expectedIntermediateQty}.`);
      } catch (e) {
          console.warn(`[CartPage] Timeout waiting for quantity for "${productNameForLog}" to update.`, e);
          await this.driver.sleep(1000); 
      }
    }

    const finalQuantity = await this.getProductQuantityInCart(productId, 3000);
    console.log(`[CartPage] Final quantity in input for "${productNameForLog}": ${finalQuantity}`);
    if (finalQuantity !== newQuantity) {
        console.warn(`[CartPage] Could not set quantity for "${productNameForLog}" to ${newQuantity}. Final quantity is ${finalQuantity}.`);
    } else {
        console.log(`[CartPage] Quantity for "${productNameForLog}" successfully updated to ${finalQuantity}.`);
    }
    await this.driver.sleep(1500); // Chờ tổng tiền có thể cập nhật
  }

  async removeProductFromCartById(productId: string, productNameForLog: string): Promise<void> {
    console.log(`[CartPage] Attempting to remove product: "${productNameForLog}" (ID: ${productId})`);
    const removeButtonLocator = this.removeButtonByProductId(productId);
    const productContainerToDisappear = this.cartItemContainerByProductId(productId); 
    
    const removeButton = await this.waitForElementClickable(removeButtonLocator, 10000);
    await this.scrollIntoView(removeButton); 
    await removeButton.click();
    console.log(`[CartPage] Clicked remove button for "${productNameForLog}". Waiting for confirmation alert.`);
    
    try {
      await this.driver.wait(async () => {
          try { await this.driver.switchTo().alert(); return true; } 
          catch (e:any) { if (e instanceof NoSuchAlertError) return null; throw e;}
      }, 7000, `Confirmation alert did not appear after clicking remove for "${productNameForLog}".`);
      
      const alert = this.driver.switchTo().alert();
      await alert.accept();
      console.log(`[CartPage] Accepted confirmation alert for "${productNameForLog}".`);
      
      console.log(`[CartPage] Waiting for product "${productNameForLog}" (its container) to be removed from UI...`);
      await this.driver.wait(async () => {
        return !(await this.isElementDisplayed(productContainerToDisappear, 500)); 
      }, 10000, `Product container for "${productNameForLog}" (ID: ${productId}) was not removed from cart UI after confirming alert.`);
      console.log(`[CartPage] Product "${productNameForLog}" (its container) successfully removed from UI.`);

    } catch (error: any) {
      // ... (xử lý lỗi như trước) ...
    }
  }


  // CartPage.ts
  async getTotalAmountValue(timeout: number = 10000): Promise<number> {
      const element = await this.waitForElementVisible(this.totalAmountDisplay, timeout);
      const text = await element.getText(); // Ví dụ: "460.000₫"
      console.log(`[CartPage getTotalAmountValue] Raw total text: "${text}"`);
      
      // Logic làm sạch: bỏ ký tự ₫, bỏ dấu chấm phân cách hàng nghìn
      const cleanedText = text
          .replace(/₫/g, '')       // Xóa ký tự ₫
          .replace(/\./g, '')      // Xóa TẤT CẢ dấu chấm (vì chúng là phân cách hàng nghìn)
          .replace(/\s/g, '')      // Xóa khoảng trắng (nếu có)
          .trim();                 // Xóa khoảng trắng ở đầu/cuối
                                  // Giả định không có phần thập phân như ,50
      
      console.log(`[CartPage getTotalAmountValue] Cleaned total text for parsing: "${cleanedText}"`);
      if (cleanedText === "" || isNaN(Number(cleanedText))) {
          console.error(`[CartPage getTotalAmountValue] Cleaned text is empty or NaN: "${cleanedText}" (original: "${text}")`);
          return NaN; 
      }
      return parseFloat(cleanedText);
  }

  async clickProceedToCheckout(): Promise<void> {
    const checkoutBtn = await this.waitForElementClickable(this.checkoutButton, 10000);
    await this.scrollIntoView(checkoutBtn);
    await checkoutBtn.click();
  }
}