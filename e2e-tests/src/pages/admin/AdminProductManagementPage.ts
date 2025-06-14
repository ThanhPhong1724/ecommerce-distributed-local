// src/pages/admin/AdminProductManagementPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage'; // Đảm bảo đường dẫn đúng
import { NoSuchAlertError, NoSuchElementError, TimeoutError } from 'selenium-webdriver/lib/error';

export interface ProductBasicInfoAdmin {
    name: string;
    categoryName?: string;
    price?: string; // Giữ là string để khớp với text trên UI trước khi parse
    stockQuantity?: string;
}
// Interface để trả về thông tin sản phẩm (có thể mở rộng)
export interface ProductInfoFromAdminList {
    name: string;
    displayedIdShort?: string; 
    categoryName?: string;
    price: string; 
    stockQuantity?: string; 
}
export class AdminProductManagementPage extends BasePage {
  // --- LOCATORS ---
  // Tiêu đề: <h1 class="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
  private pageTitle = By.xpath("//h1[normalize-space()='Quản lý Sản phẩm']");

  // Nút "Thêm Sản phẩm": <Link to="/admin/products/new" ...> <FiPlus /> Thêm Sản phẩm </Link>
  private addProductButton = By.xpath("//a[contains(@href, '/admin/products/new') and normalize-space()='Thêm Sản phẩm']");
  
  // Bảng sản phẩm: <table class="min-w-full divide-y divide-gray-200">
  private productsTable = By.xpath("//table[contains(@class, 'min-w-full')]");
  
  // Một dòng sản phẩm bất kỳ trong tbody
  private anyProductRowInTable = By.xpath("//table[contains(@class, 'min-w-full')]/tbody/tr");
  
  // Thông báo không có sản phẩm: <h3 class="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm</h3>
  private noProductsMessage = By.xpath("//div[contains(@class, 'text-center')]//h3[normalize-space()='Không có sản phẩm']");

  // Ô tìm kiếm: <input type="text" placeholder="Tìm kiếm sản phẩm..." ... />
  private searchInput = By.xpath("//input[@placeholder='Tìm kiếm sản phẩm...']");


  // --- LOCATORS ĐỘNG TRONG BẢNG ---
  // Hàm tìm dòng sản phẩm dựa vào tên (giả sử tên ở cột thứ 2)
  private productRowByName = (productName: string) => 
    By.xpath(`//table/tbody/tr[./td[2]//div[normalize-space()='${productName}']]`);
    // Tìm tr có td con thứ 2 (chứa tên) có div với text là productName

  // Hàm tìm dòng sản phẩm dựa vào ID (nếu ID được hiển thị hoặc có trong data-testid)
  // Giả sử bạn thêm data-testid={`product-row-${product.id}`} vào thẻ <tr>
  private productRowById = (productId: string) => 
    By.xpath(`//tr[@data-testid='product-row-${productId}']`);
    // HOẶC nếu ID hiển thị ở cột text (ví dụ cột 2, phần text nhỏ):
    // By.xpath(`//table/tbody/tr[.//td[2]//div[contains(@class, 'text-xs') and contains(normalize-space(), '${productId.substring(0,8)}')]]`);

  // Nút Sửa trong một dòng (dựa trên productId nếu có data-testid trên dòng hoặc nút)
  // <Link to={`/admin/products/edit/${product.id}`} ...><FiEdit2 /></Link>
  private editButtonByProductId = (productId: string) => 
    By.xpath(`//a[@data-testid='edit-product-button-${productId}']`);

  // Nút Xóa trong một dòng (dựa trên productId)
  // <button onClick={() => handleDeleteProduct(product.id)} ...><FiTrash2 /></button>
  private deleteButtonByProductId = (productId: string) =>
    By.xpath(`//button[@data-testid='delete-product-button-${productId}']`);
  private productRowByDataTestId = (productId: string) => 
    By.xpath(`//tr[@data-testid='product-row-${productId}']`);

  private deleteButtonByFullProductId = (fullProductId: string) => 
  By.xpath(`//button[@data-testid='delete-product-button-${fullProductId}']`);
  // HOẶC nếu data-testid của nút xóa nằm trong dòng có data-testid='product-row-${fullProductId}'
  // By.xpath(`//tr[@data-testid='product-row-${fullProductId}']//button[@data-testid='delete-product-button']`);

  constructor(driver: WebDriver) {
    super(driver, "/admin/products");
  }

  async navigateToPage(): Promise<void> {
    await this.navigate();
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad(timeout: number = 15000): Promise<void> {
    console.log("[AdminProductMngPage] Waiting for Product Management page to load...");
    if (!(await this.waitForUrlContains(this.pageUrl, timeout))) {
         throw new Error(`Timeout or incorrect URL. Expected '${this.getPageUrl()}', but was: '${await this.driver.getCurrentUrl()}'`);
    }
    await this.waitForElementVisible(this.pageTitle, timeout);
    // Chờ hoặc bảng sản phẩm hoặc thông báo không có sản phẩm
    await this.driver.wait(async () => {
        const tableVisible = await this.isElementDisplayed(this.productsTable, 1000);
        const noProductsMsgVisible = await this.isElementDisplayed(this.noProductsMessage, 1000);
        return tableVisible || noProductsMsgVisible;
    }, timeout, "Product table or 'no products' message did not appear.");
    console.log("[AdminProductMngPage] Product Management page loaded.");
  }

  async clickAddProductButton(): Promise<void> {
    console.log("[AdminProductMngPage] Clicking 'Add Product' button...");
    await this.click(this.addProductButton);
  }

  async isProductInListByName(productName: string, timeout: number = 7000): Promise<boolean> {
    console.log(`[AdminProductMngPage] Checking if product "${productName}" is in list by name...`);
    return this.isElementDisplayed(this.productRowByName(productName), timeout);
  }
  
  // Hàm này sẽ hữu ích nếu bạn có ID và muốn kiểm tra sự tồn tại
  async isProductInListById(productId: string, timeout: number = 7000): Promise<boolean> {
    console.log(`[AdminProductMngPage] Checking if product ID "${productId}" is in list...`);
    // **Đảm bảo bạn có cách tìm productRowById ổn định (lý tưởng là data-testid trên <tr>)**
    // Hiện tại, tôi giả sử bạn sẽ thêm data-testid=`product-row-${productId}` vào thẻ <tr> trong JSX
    return this.isElementDisplayed(By.xpath(`//tr[@data-testid='product-row-${productId}']`), timeout);
  }

  // === SỬA LẠI HÀM NÀY ĐỂ DÙNG LOCATOR NÚT XÓA MỚI ===
  async deleteProductById(productId: string): Promise<void> {
    console.log(`[AdminProductMngPage] Attempting to delete product ID: ${productId}`);
    const deleteButtonLocator = this.deleteButtonByProductId(productId); // Sử dụng locator mới
    
    // Scroll đến dòng chứa nút xóa trước, sau đó mới scroll chính nút đó nếu cần
    const productRowToScroll = this.productRowByDataTestId(productId);
    try {
        const rowElement = await this.waitForElementLocated(productRowToScroll, 5000);
        await this.scrollIntoView(rowElement); // Scroll cả dòng vào view
        console.log(`[AdminProductMngPage] Product row for ${productId} scrolled into view.`);
    } catch (scrollError) {
        console.warn(`[AdminProductMngPage] Could not scroll product row ${productId} into view, attempting to click delete button directly.`, scrollError);
    }

    const deleteButton = await this.waitForElementClickable(deleteButtonLocator, 10000); // Chờ nút xóa clickable
    // Không cần scrollIntoView(deleteButton) nữa nếu scroll dòng đã đủ
    await deleteButton.click();
    console.log(`[AdminProductMngPage] Clicked delete button for product ID: ${productId}.`);
    
    // Xử lý alert xác nhận xóa
    console.log("[AdminProductMngPage] Waiting for delete confirmation alert...");
    try {
        await this.driver.wait(async () => {
            try { await this.driver.switchTo().alert(); return true; }
            catch (e:any) { if (e instanceof NoSuchAlertError) return null; throw e; }
        }, 7000, "Delete confirmation alert did not appear.");
        
        const alert = this.driver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(`[AdminProductMngPage] Delete confirmation alert text: "${alertText}". Accepting.`);
        await alert.accept();
        console.log("[AdminProductMngPage] Delete confirmation accepted.");
    } catch (e: any) {
        if (e instanceof TimeoutError) {
            console.log("[AdminProductMngPage] No delete confirmation alert appeared (or timed out).");
        } else {
             console.warn("[AdminProductMngPage] Unexpected error handling delete alert:", e);
        }
    }
  }

    // async waitForProductToDisappear(productId: string, timeout: number = 10000): Promise<void> {
    //     console.log(`[AdminProductMngPage] Waiting for product ID "${productId}" to disappear from list...`);
    //     const productRowLocator = this.productRowByDataTestId(productId); // Dùng data-testid của dòng
    //     await this.driver.wait(async () => {
    //         return !(await this.isElementDisplayed(productRowLocator, 500)); // Chờ cho đến khi element không còn displayed
    //     }, timeout, `Product ID "${productId}" did not disappear from list within timeout.`);
    //     console.log(`[AdminProductMngPage] Product ID "${productId}" has disappeared from list.`);
    // }

    async waitForProductToDisappear(productId: string, timeout: number = 10000): Promise<void> {
        console.log(`[AdminProductMngPage] Waiting for product ID "${productId}" to disappear...`);
        const productRowLocator = By.xpath(`//tr[@data-testid='product-row-${productId}']`); // Giả sử
        await this.driver.wait(async () => {
            return !(await this.isElementDisplayed(productRowLocator, 500));
        }, timeout, `Product ID "${productId}" did not disappear.`);
        console.log(`[AdminProductMngPage] Product ID "${productId}" has disappeared.`);
    }
  
    async getProductIdByName(productName: string, timeout: number = 7000): Promise<string | null> {
        console.log(`[AdminProductMngPage] Attempting to get FULL ID for product name: "${productName}"`);
        try {
        const productRow = await this.waitForElementVisible(this.productRowByName(productName), timeout);
        const fullId = await productRow.getAttribute('data-full-product-id'); // Lấy từ data attribute mới
        if (fullId) {
            console.log(`[AdminProductMngPage] Extracted FULL product ID "${fullId}" for name "${productName}"`);
            return fullId;
        }
        console.warn(`[AdminProductMngPage] data-full-product-id attribute not found for "${productName}"`);
        return null;
        } catch (e) {
        console.warn(`[AdminProductMngPage] Could not find or get full ID for product name "${productName}"`, e);
        return null;
        }
    }
    async getProductIdByName2(productName: string, timeout: number = 7000): Promise<string | null> {
        console.log(`[AdminProductMngPage] Attempting to get FULL ID for product name: "${productName}"`);
        try {
        // Locator tìm dòng tr có chứa tên sản phẩm (giả sử tên ở td[2]//div[contains(@class,'font-medium')])
        const productRowLocator = By.xpath(`//table/tbody/tr[./td[2]//div[normalize-space()='${productName}']]`);
        const productRow = await this.waitForElementVisible(productRowLocator, timeout);
        
        // Lấy ID đầy đủ từ attribute 'data-full-product-id' của thẻ tr
        const fullId = await productRow.getAttribute('data-full-product-id'); 
        
        if (fullId) {
            console.log(`[AdminProductMngPage] Extracted FULL product ID "${fullId}" for name "${productName}" from data-full-product-id.`);
            return fullId;
        }
        console.warn(`[AdminProductMngPage] 'data-full-product-id' attribute not found on product row for "${productName}".`);
        return null;
        } catch (e) {
        console.warn(`[AdminProductMngPage] Could not find or get full ID for product name "${productName}"`, e);
        return null;
        }
    }
  // === SỬA LẠI HÀM NÀY ===
  async clickEditProductButton(productId: string): Promise<void> {
    console.log(`[AdminProductMngPage] Attempting to click 'Edit Product' button for ID: ${productId}`);
    
    // Bước 1: Tìm locator cho dòng sản phẩm chứa nút sửa
    // Điều này giả định bạn đã thêm data-testid=`product-row-${productId}` vào mỗi <tr>
    const productRowLocator = this.productRowByDataTestId(productId);
    
    // Bước 2: Chờ cho dòng đó xuất hiện trong DOM và scroll nó vào view
    console.log(`[AdminProductMngPage] Waiting for product row (ID: ${productId}) to be located and scrolling into view...`);
    const productRowElement = await this.waitForElementLocated(productRowLocator, 10000);
    await this.scrollIntoView(productRowElement); // Scroll dòng vào view
    console.log(`[AdminProductMngPage] Product row (ID: ${productId}) is now in view.`);

    // Bước 3: Bây giờ tìm và click nút sửa bên trong dòng đó (hoặc trực tiếp nếu locator editButtonByProductId đủ)
    const editButtonLocator = this.editButtonByProductId(productId); // Locator này tìm nút sửa trực tiếp
    
    console.log(`[AdminProductMngPage] Waiting for edit button for ID: ${productId} to be clickable...`);
    const buttonElement = await this.waitForElementClickable(editButtonLocator, 7000);
    // Không cần scrollIntoView(buttonElement) nữa nếu productRowElement đã được scroll đúng
    await buttonElement.click();
    console.log(`[AdminProductMngPage] Clicked edit for product ID: ${productId}. Expecting edit form.`);
  }

  // === ĐÂY LÀ HÀM CẦN ĐẢM BẢO CÓ TRONG CLASS ===
  /**
   * Lấy thông tin hiển thị của một sản phẩm từ danh sách dựa vào Product ID.
   * @param productId ID của sản phẩm.
   * @returns Đối tượng chứa thông tin hoặc null nếu không tìm thấy.
   */
  async getProductInfoFromListById(productId: string, timeout: number = 7000): Promise<ProductInfoFromAdminList | null> {
    console.log(`[AdminProductMngPage] Getting info for product ID "${productId}" from list...`);
    try {
      const productRowLocator = this.productRowByDataTestId(productId); // Sử dụng data-testid
      const productRow = await this.waitForElementVisible(productRowLocator, timeout);
      await this.scrollIntoView(productRow); // Scroll dòng vào view TRƯỚC KHI tìm con    
      // **XÁC MINH CÁC XPATH TƯƠNG ĐỐI NÀY DỰA TRÊN CẤU TRÚC <tr> CỦA BẠN**
      // Giả sử thứ tự cột: Ảnh (td[1]), Tên/ID (td[2]), Danh mục (td[3]), Giá (td[4]), Tồn kho (td[5])
      const nameElement = await productRow.findElement(By.xpath("./td[2]//div[contains(@class,'font-medium')]")); // Tên chính
      const idShortElement = await productRow.findElement(By.xpath("./td[2]//div[contains(@class,'text-xs')]")); // ID rút gọn
      const categoryElement = await productRow.findElement(By.xpath("./td[3]//span")); // Danh mục
      const priceElement = await productRow.findElement(By.xpath("./td[4]//span")); // Giá
      const stockElement = await productRow.findElement(By.xpath("./td[5]//span")); // Tồn kho
      
      const name = (await nameElement.getText()).trim();
      const displayedIdShort = (await idShortElement.getText()).replace(/\.\.\.$/, '').trim();
      const categoryName = (await categoryElement.getText()).trim();
      const price = (await priceElement.getText()).trim(); 
      const stockQuantity = (await stockElement.getText()).trim(); 
      
      console.log(`[AdminProductMngPage] Info for ${productId}: Name=${name}, Price=${price}, Stock=${stockQuantity}, Category=${categoryName}`);
      return { name, displayedIdShort, categoryName, price, stockQuantity };
    } catch (e) {
      console.warn(`[AdminProductMngPage] Could not get info for product ID "${productId}" from list.`, e);
      return null;
    }
  }
}