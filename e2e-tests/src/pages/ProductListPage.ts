// src/pages/ProductListPage.ts
import { By, WebDriver, WebElement, Key } from 'selenium-webdriver'; // Bỏ 'until' nếu không dùng nữa
import { BasePage } from './BasePage';
import { NoSuchElementError, TimeoutError, StaleElementReferenceError } from 'selenium-webdriver/lib/error';

export class ProductListPage extends BasePage {
  // --- LOCATORS CHÍNH ---
  private searchInput = By.xpath("//input[@placeholder='Tìm kiếm sản phẩm...']");
  private allProductCardsContainer = By.xpath("//div[contains(@class,'grid')]"); // Container chung cho các card sản phẩm
  private individualProductCard = By.xpath(
    "//div[contains(@class, 'group') and contains(@class, 'relative') and contains(@class, 'bg-white') and .//h3[contains(@class, 'text-gray-900')]]"
  );
  private noProductMessage = By.xpath("//h3[normalize-space(text())='Không tìm thấy sản phẩm' or normalize-space(text())='Không có sản phẩm nào phù hợp']");

  // --- LOCATORS CHO FILTER PANEL ---
  // Nút "Bộ lọc" dựa trên HTML bạn cung cấp
  private filterButton = By.xpath("//button[contains(., 'Bộ lọc') and .//svg[polygon]]"); 
  private categoryButtonByName = (categoryName: string) => 
    By.xpath(`//nav[contains(@aria-label,'Categories')]//a[normalize-space()='${categoryName}'] | //div[contains(@class,'category-tabs')]//button[normalize-space()='${categoryName}']`);
  
  // Bên trong filter panel (CẦN KIỂM TRA KỸ LOCATOR KHI PANEL MỞ)
  private sortSelect = By.id("sort-select"); // Ưu tiên ID
  private priceMinInput = By.xpath("//div[contains(@class,'filter-panel')]//input[@placeholder='Giá từ' or @aria-label='Giá tối thiểu']");
  private priceMaxInput = By.xpath("//div[contains(@class,'filter-panel')]//input[@placeholder='Giá đến' or @aria-label='Giá tối đa']");
  private applyFiltersButtonInPanel = By.xpath("//div[contains(@class,'filter-panel')]//button[normalize-space()='Áp dụng']");
  private closeFilterButtonInPanel = By.xpath("//div[contains(@class,'filter-panel')]//button[normalize-space()='Đóng' or @aria-label='Đóng bộ lọc']");

  // --- LOCATORS ĐỘNG TRONG CARD SẢN PHẨM ---
  private productCardByName(productName: string): By {
    return By.xpath(
      `//div[contains(@class, 'group') and contains(@class, 'relative')][.//h3[normalize-space()="${productName}"]]`
    );
  }
  private addToCartButtonForProduct(productName: string): By {
    return By.xpath(
      `${this.productCardByName(productName).value}//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'thêm vào giỏ') and not(@disabled)]`
    );
  }
  private productNameElementInCard = By.xpath(".//h3[contains(@class, 'text-gray-900')]");
  private productPriceElementInCard = By.xpath(".//span[contains(text(),'₫') and (contains(@class, 'text-blue-600') or contains(@class, 'font-bold'))]");

  constructor(driver: WebDriver) {
    super(driver, "/products");
  }

  async navigateToProductList(): Promise<void> {
    await this.navigate(); 
    console.log(`[ProductListPage] Navigated to ${await this.driver.getCurrentUrl()}. Waiting for product grid to load...`);
    await this.waitForProductGridToReload(15000);
  }

  private async waitForProductGridToReload(timeout: number = 10000): Promise<void> {
    console.log("[ProductListPage] Waiting for product grid to reload/appear...");
    let lastErrorForMessage: string = "Product grid did not show products or empty message.";
    try {
      await this.driver.wait(async () => {
        const productsPresent = await this.isElementDisplayed(this.individualProductCard, 500);
        if (productsPresent) return true;
        const noProductsMsgPresent = await this.isElementDisplayed(this.noProductMessage, 500);
        if (noProductsMsgPresent) return true;
        lastErrorForMessage = "Neither products nor 'no product' message are visible.";
        return false;
      }, timeout, `Product grid did not reload. Last status: ${lastErrorForMessage}`);
      console.log("[ProductListPage] Product grid reloaded (products or empty message visible).");
    } catch (e) {
      console.warn("[ProductListPage] Timeout or error waiting for product grid to reload.", e);
      // Không throw lỗi ở đây để hàm gọi có thể quyết định
    }
  }
  
  async getDisplayedProductCards(): Promise<WebElement[]> {
    try {
        await this.waitForElementLocated(this.allProductCardsContainer, 3000);
        return this.driver.findElements(this.individualProductCard);
    } catch (error) {
         if (await this.isElementDisplayed(this.noProductMessage, 1000)) {
            return [];
        }
        return [];
    }
  }

  async getDisplayedProductsCount(): Promise<number> {
    const elements = await this.getDisplayedProductCards();
    return elements.length;
  }
  
  async areProductsDisplayed(timeout: number = 7000): Promise<boolean> {
      return this.isElementDisplayed(this.individualProductCard, timeout);
  }

  async searchProduct(term: string): Promise<void> {
    const searchField = await this.waitForElementClickable(this.searchInput);
    await searchField.clear();
    await searchField.sendKeys(term);
    // await searchField.sendKeys(Key.ENTER); // Nếu cần nhấn Enter

    let oldContainer: WebElement | null = null;
    try {
        oldContainer = await this.findElement(this.allProductCardsContainer, 1500); // Timeout ngắn để tìm
    } catch (e) { /* Bỏ qua nếu không tìm thấy */ }

    if (oldContainer) {
        console.log("[ProductListPage] Waiting for old product container to become stale...");
        try {
            await this.driver.wait(async () => {
                try {
                    await oldContainer!.getTagName(); // Thao tác để kiểm tra staleness
                    return false; // Vẫn còn, chưa stale
                } catch (e: any) {
                    if (e instanceof StaleElementReferenceError || e instanceof NoSuchElementError) {
                        return true; // Đã stale hoặc không còn
                    }
                    throw e; // Lỗi khác
                }
            }, 7000, "Old product container did not become stale.");
            console.log("[ProductListPage] Old product container became stale.");
        } catch (e) {
            console.warn("[ProductListPage] Error or timeout waiting for staleness of old container:", e);
        }
    }
    await this.waitForProductGridToReload();
  }

  async openFilterPanel(): Promise<void> {
    await this.click(this.filterButton);
    await this.waitForElementVisible(this.applyFiltersButtonInPanel, 5000); 
  }

  async selectSortBy(optionText: string): Promise<void> {
    const selectDropdown = await this.waitForElementClickable(this.sortSelect);
    await selectDropdown.click();
    const optionElement = await this.waitForElementClickable(By.xpath(`//select[@id='sort-select']/option[normalize-space()='${optionText}']`));
    await optionElement.click();
    await this.waitForProductGridToReload();
  }
  
  async applyCategoryFilter(categoryName: string): Promise<void> {
    const categoryBtn = await this.waitForElementClickable(this.categoryButtonByName(categoryName));
    await categoryBtn.click();
    await this.waitForProductGridToReload();
  }

  async setPriceRange(min: string, max: string): Promise<void> {
    // Giả sử filter panel đã mở (cần gọi openFilterPanel trước)
    if (min) {
        const minInput = await this.waitForElementClickable(this.priceMinInput);
        await minInput.clear();
        await minInput.sendKeys(min);
    }
    if (max) {
        const maxInput = await this.waitForElementClickable(this.priceMaxInput);
        await maxInput.clear();
        await maxInput.sendKeys(max);
    }
  }

  private async waitForElementToDisappear(locator: By, timeout: number = 5000): Promise<boolean> {
    let disappeared = false;
    try {
        await this.driver.wait(async () => {
            try {
                // Nếu tìm thấy -> chưa biến mất -> trả về false để wait tiếp
                await this.driver.findElement(locator); 
                return false; 
            } catch (e: any) {
                if (e instanceof NoSuchElementError) {
                    disappeared = true;
                    return true; // Không tìm thấy -> đã biến mất
                }
                throw e; // Lỗi khác
            }
        }, timeout, `Element ${locator.toString()} did not disappear within ${timeout}ms.`);
        return disappeared; // Trả về true nếu wait thành công (do predicate trả về true)
    } catch (e) {
        if (e instanceof TimeoutError && disappeared) { // Trường hợp nó biến mất ngay lúc cuối timeout
            return true;
        }
        if (e instanceof TimeoutError && !disappeared) { // Timeout mà vẫn còn thấy
             console.warn(`Timeout waiting for element ${locator.toString()} to disappear, it might still be present.`);
             return false;
        }
        // console.warn(`Error in waitForElementToDisappear for ${locator.toString()}:`, e);
        return false; // Coi như chưa biến mất nếu có lỗi khác
    }
}


  async clickApplyFiltersInPanel(): Promise<void> {
    await this.click(this.applyFiltersButtonInPanel);
    // Chờ panel đóng lại bằng cách chờ nút "Áp dụng" (hoặc 1 element của panel) biến mất
    const didPanelClose = await this.waitForElementToDisappear(this.applyFiltersButtonInPanel, 7000);
    if (!didPanelClose) {
        console.warn("Filter panel (apply button) did not seem to disappear after applying filters.");
    }
    await this.waitForProductGridToReload();
  }
  
  async clickCloseFiltersInPanel(): Promise<void> {
    await this.click(this.closeFilterButtonInPanel);
    const didPanelClose = await this.waitForElementToDisappear(this.closeFilterButtonInPanel, 7000);
     if (!didPanelClose) {
        console.warn("Filter panel (close button) did not seem to disappear after closing.");
    }
    // Không cần reload grid ở đây vì chỉ đóng panel
  }

  async isNoProductMessageDisplayed(timeout: number = 7000): Promise<boolean> {
      return this.isElementDisplayed(this.noProductMessage, timeout);
  }

  async clickAddToCartButtonForProduct(productName: string): Promise<void> {
    const addToCartLocator = this.addToCartButtonForProduct(productName);
    const buttonElement = await this.waitForElementClickable(addToCartLocator, 10000);
    await this.scrollIntoView(buttonElement);
    await buttonElement.click();
  }

  async getFirstProductNameFromList(): Promise<string | null> {
    try {
        await this.waitForElementVisible(this.individualProductCard, 7000); 
        const productCards = await this.driver.findElements(this.individualProductCard);
        if (productCards.length > 0) {
            const firstCard = productCards[0];
            const nameElement = await firstCard.findElement(this.productNameElementInCard);
            return (await nameElement.getText()).trim();
        }
        return null;
    } catch (e) {
        console.warn("ProductListPage: Error getting first product name:", e);
        return null;
    }
  }

  async getProductInfoFromList(productName: string): Promise<{ name: string, price: string } | null> {
    try {
        const productCardLocator = this.productCardByName(productName);
        const productCard = await this.waitForElementVisible(productCardLocator, 7000);
        
        const nameElement = await productCard.findElement(this.productNameElementInCard);
        const name = (await nameElement.getText()).trim();
        
        const priceElement = await productCard.findElement(this.productPriceElementInCard);
        const priceText = (await priceElement.getText()).trim();
        const cleanedPrice = priceText.replace(/[^\d]/g, ''); 
        
        return { name, price: cleanedPrice };
    } catch (e) {
        if (e instanceof NoSuchElementError || e instanceof TimeoutError) {
            console.log(`ProductListPage: Product "${productName}" not found in list.`);
            return null;
        }
        console.warn(`ProductListPage: Error getting product info for "${productName}":`, e);
        return null;
    }
  }
  
  async isProductInList(productName: string, timeout: number = 7000): Promise<boolean> {
      return this.isElementDisplayed(this.productCardByName(productName), timeout);
  }

  async clickProductInList(productName: string): Promise<void> {
    const productCardLocator = this.productCardByName(productName);
    const productCard = await this.waitForElementClickable(productCardLocator, 10000);
    await this.scrollIntoView(productCard);
    const clickableElementInCard = await productCard.findElement(this.productNameElementInCard); 
    await clickableElementInCard.click();
    // Chờ trang chi tiết sản phẩm load bằng custom predicate
    let lastUrl = "";
    await this.driver.wait(async () => {
        lastUrl = await this.driver.getCurrentUrl();
        return lastUrl.includes('/product/'); // Giả sử URL trang chi tiết chứa /product/
    }, 10000, `URL did not change to product detail page. Last URL: ${lastUrl}`);
  }
}