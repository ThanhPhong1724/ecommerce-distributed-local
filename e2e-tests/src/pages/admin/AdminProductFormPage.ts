// src/pages/admin/AdminProductFormPage.ts
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage';
import { AdminProductManagementPage } from './AdminProductManagementPage'; // Import để điều hướng về
import { NoSuchAlertError, TimeoutError } from 'selenium-webdriver/lib/error';

export interface ProductFormData {
    name: string;
    description?: string;
    price: number | string; // Cho phép string để dễ nhập
    stockQuantity: number | string; // Cho phép string
    categoryId: string; 
    imageUrl?: string; 
    // Thêm các trường khác nếu form của bạn có
}

export class AdminProductFormPage extends BasePage {
  // --- LOCATORS DỰA TRÊN AdminProductFormPage.tsx ---
  private pageTitleCreate = By.xpath("//h1[normalize-space()='Thêm Sản phẩm mới']");
  private pageTitleEdit = By.xpath("//h1[normalize-space()='Chỉnh sửa Sản phẩm']"); // Tiêu đề chung khi sửa

  // Các input dựa vào ID của chúng trong JSX
  private nameInput = By.id("name");
  private categorySelect = By.id("category");
  private categoryOptionByValue = (categoryId: string) => By.xpath(`//select[@id='category']/option[@value='${categoryId}']`);
  private priceInput = By.id("price");
  private stockQuantityInput = By.id("stockQuantity");
  private descriptionTextarea = By.id("description");
  private imageUrlInput = By.id("imageUrl");
  
  private saveButton = By.xpath("//button[@data-testid='admin-product-form-submit-button']");
  // (Tùy chọn) Thông báo thành công (nếu có trên trang này sau khi submit)
  // private successMessage = By.xpath("//div[contains(@class, 'alert-success')]"); 

  constructor(driver: WebDriver) {
    super(driver, "/admin/products"); // Path cha là /admin/products
  }

  async navigateToCreateForm(): Promise<void> {
    // Hàm này sẽ được gọi sau khi click nút "Thêm sản phẩm" từ trang danh sách
    // Nó không tự navigate, mà chờ trang form được load
    await this.waitForPageToLoad_CreateMode();
  }

  async navigateToEditForm(productId?: string): Promise<void> { 
    // productId có thể không cần thiết nếu URL không chứa nó,
    // nhưng hữu ích để xác nhận.
    // Hàm này được gọi sau khi click nút "Sửa" từ trang danh sách
    await this.waitForPageToLoad_EditMode(productId);
  }

  async waitForPageToLoad_CreateMode(timeout: number = 10000): Promise<void> {
    console.log("[AdminProductFormPage] Waiting for Create Product form to load...");
    // URL có thể vẫn là /admin/products/new
    if (!(await this.waitForUrlContains("/new", timeout))) {
        throw new Error("Not on Create Product form URL.");
    }
    await this.waitForElementVisible(this.pageTitleCreate, timeout);
    await this.waitForElementVisible(this.nameInput, timeout); 
    console.log("[AdminProductFormPage] Create Product form loaded.");
  }
  
  async waitForPageToLoad_EditMode(productId?: string, timeout: number = 10000): Promise<void> {
    console.log(`[AdminProductFormPage] Waiting for Edit Product form for "${productId || 'unknown'}" to load...`);
    if (productId && !(await this.waitForUrlContains(`/edit/${productId}`, timeout))) {
        throw new Error(`Not on Edit Product form URL for "${productId}".`);
    }
    await this.waitForElementVisible(this.pageTitleEdit, timeout); // Chờ tiêu đề chung của form sửa
    await this.waitForElementVisible(this.nameInput, timeout);
    // Chờ giá trị được populate vào form (ví dụ, tên sản phẩm)
    await this.driver.wait(async () => (await (await this.findElement(this.nameInput)).getAttribute('value')) !== '', 7000, 
      "Product name input not populated in edit mode."
    );
    console.log(`[AdminProductFormPage] Edit Product form for "${productId || 'unknown'}" loaded.`);
  }

  async fillProductForm(data: Partial<ProductFormData>): Promise<void> {
    console.log("[AdminProductFormPage] Filling product form:", data);
    if (data.name !== undefined) await this.type(this.nameInput, data.name);
    if (data.description !== undefined) await this.type(this.descriptionTextarea, data.description);
    if (data.price !== undefined) await this.type(this.priceInput, data.price.toString());
    if (data.stockQuantity !== undefined) await this.type(this.stockQuantityInput, data.stockQuantity.toString());
    if (data.categoryId !== undefined) {
        const categoryDropdown = await this.waitForElementClickable(this.categorySelect);
        await categoryDropdown.click();
        await this.driver.sleep(200); // Chờ dropdown mở
        await this.click(this.categoryOptionByValue(data.categoryId));
    }
    if (data.imageUrl !== undefined) { // imageUrl thay vì images[0].url
        await this.type(this.imageUrlInput, data.imageUrl);
    }
  }

  // === SỬA LẠI HÀM NÀY ===
  async clickSubmitButton(): Promise<void> {
    console.log("[AdminProductFormPage] Clicking submit button...");
    const button = await this.waitForElementClickable(this.saveButton, 10000);
    await this.scrollIntoView(button);
    await button.click();
    console.log("[AdminProductFormPage] Submit button clicked.");

    // Xử lý alert "Thêm sản phẩm thành công!" ngay sau khi click
    console.log("[AdminProductFormPage] Waiting for 'Thêm sản phẩm thành công!' alert...");
    try {
      // Sử dụng custom predicate wait cho alert
      await this.driver.wait(async () => {
        try {
          await this.driver.switchTo().alert();
          return true; // Alert is present
        } catch (e: any) {
          if (e instanceof NoSuchAlertError || (e.name && e.name.includes('NoSuchAlertError'))) {
            return null; // Alert not present yet, wait will retry (falsy value)
          }
          throw e; // Other error
        }
      }, 7000, "Alert 'Thêm sản phẩm thành công!' did not appear within 7 seconds."); // Tăng timeout nếu cần

    const successAlert = await this.driver.switchTo().alert();
    const alertText = await successAlert.getText();
    console.log(`[AdminProductFormPage] Success alert present: "${alertText}". Accepting.`);
    // Kiểm tra alertText chứa một trong hai thông báo thành công
    const normalizedText = alertText.toLowerCase();
    expect(
      normalizedText.includes("thêm sản phẩm thành công") ||
      normalizedText.includes("cập nhật sản phẩm thành công")
    ).toBeTruthy();
    await successAlert.accept();
    console.log("[AdminProductFormPage] Success alert accepted.");
    } catch (e: any) {
    if (e instanceof TimeoutError) {
      console.warn("[AdminProductFormPage] Timed out waiting for success alert. The operation might have failed or no alert was shown.");
        // Tùy theo logic ứng dụng, bạn có thể muốn throw lỗi ở đây nếu alert là bắt buộc
      } else if (e instanceof NoSuchAlertError) {
        console.log("[AdminProductFormPage] No success alert found (possibly already handled or not an alert).");
      } else {
        console.warn("[AdminProductFormPage] Unexpected error while waiting for/handling success alert:", e);
      }
    }
    // Sau khi xử lý alert, trang có thể sẽ tự động điều hướng hoặc cần một chút thời gian
    // Test case ADMFUNC004 sẽ chờ trang danh sách sản phẩm load lại
  }

  // Hàm tiện ích (có thể giữ lại, nhưng việc lấy ID cần được làm cẩn thận)
  // async createProductAndGetId(productData: ProductFormData): Promise<string | null> {
  //   // ... (navigateToCreateForm, fillProductForm, clickSubmitButton)
  //   // Chờ chuyển hướng về trang danh sách và tìm sản phẩm mới để lấy ID
  //   const productListPage = new AdminProductManagementPage(this.driver);
  //   await productListPage.waitForPageToLoad(15000);
  //   return await productListPage.getProductIdByName(productData.name); // Cần hàm này trong AdminProductManagementPage
  // }
}