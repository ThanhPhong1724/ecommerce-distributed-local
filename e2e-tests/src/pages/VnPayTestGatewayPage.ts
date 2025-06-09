// src/pages/VnPayTestGatewayPage.ts
import { By, WebDriver, Key, WebElement } from 'selenium-webdriver';
import { NoSuchElementError, StaleElementReferenceError, TimeoutError } from 'selenium-webdriver/lib/error';

export class VnPayTestGatewayPage {
  protected driver: WebDriver;

  // --- LOCATORS TRANG CHỌN PHƯƠNG THỨC ---
  private domesticCardAccordionButton = By.xpath(
    "//div[contains(@class, 'list-method-button') and normalize-space(.//div[contains(@class, 'title')])='Thẻ nội địa và tài khoản ngân hàng']"
  );

  // --- LOCATORS TRANG CHỌN NGÂN HÀNG (SAU KHI CLICK THẺ NỘI ĐỊA) ---
  private ncbBankItem = By.xpath("//div[contains(@class, 'list-bank-item-inner') and contains(@style, 'ncb.svg')]");
  private otpErrorMessageLabel = By.id("lb_message_error");

  // --- LOCATORS TRANG NHẬP THÔNG TIN THẺ NCB ---
  private cardNumberInput = By.id("card_number_mask");
  private cardHolderNameInput = By.id("cardHolder");
  private cardIssueDateInput = By.id("cardDate");
  private continueButton = By.id("btnContinue");

  // --- LOCATORS MODAL ĐIỀU KHOẢN SỬ DỤNG ---
  private agreeAndContinueButtonModal = By.id("btnAgree");

  // --- LOCATORS TRANG NHẬP OTP ---
  private otpInput = By.id("otpvalue"); // <input ... id="otpvalue" ...>
  private confirmPaymentButtonOtp = By.id("btnConfirm"); // <button id="btnConfirm" ...>

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // Hàm chờ viết lại (tương tự BasePage)
  async _waitForElementLocated(locator: By, timeout: number = 15000): Promise<WebElement> {
    let lastErrorForMessage: string = "Element not located";
    const element = await this.driver.wait(async () => {
      try { return await this.driver.findElement(locator); } 
      catch (e: any) { if (e instanceof NoSuchElementError) { lastErrorForMessage = e.message; return null; } throw e; }
    }, timeout, `Timeout waiting for element ${locator.toString()} to be located. LastError: ${lastErrorForMessage}`);
    if (!element) throw new TimeoutError(`Element ${locator.toString()} not located. LastError: ${lastErrorForMessage}`);
    return element;
  }
  async _waitForElementVisible(locator: By, timeout: number = 15000): Promise<WebElement> {
    const element = await this._waitForElementLocated(locator, timeout);
    // Thêm try-catch ở đây để xử lý StaleElementReferenceError nếu element bị stale trong lúc chờ visible
    let isDisplayed = false;
    await this.driver.wait(async () => {
        try {
            isDisplayed = await element.isDisplayed();
            return isDisplayed;
        } catch (e: any) {
            if (e instanceof StaleElementReferenceError) {
                 console.warn(`[VnPayGatewayPage] Stale element encountered for ${locator.toString()} while checking visibility. Re-locating might be needed if this fails.`);
                 return false; // Cho phép thử lại, nhưng element có thể cần được tìm lại.
            }
            throw e;
        }
    }, timeout, `Element ${locator} not visible.`);
    return element;
  }
  async _waitForElementClickable(locator: By, timeout: number = 15000): Promise<WebElement> {
    const element = await this._waitForElementVisible(locator, timeout);
     // Thêm try-catch ở đây để xử lý StaleElementReferenceError
    await this.driver.wait(async () => {
        try {
            return await element.isEnabled();
        } catch (e: any) {
            if (e instanceof StaleElementReferenceError) {
                console.warn(`[VnPayGatewayPage] Stale element encountered for ${locator.toString()} while checking enabled state.`);
                return false;
            }
            throw e;
        }
    }, timeout, `Element ${locator} not enabled.`);
    return element;
  }
  async _type(locator: By, text: string, clearFirst: boolean = true): Promise<void> {
    const el = await this._waitForElementClickable(locator);
    if (clearFirst) {
        // Thử nhiều cách clear cho input
        await el.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE); // Ctrl+A, Delete
        if (await el.getAttribute('value') !== '') { // Nếu vẫn chưa trống
            await el.clear(); // Thử clear()
        }
        if (await el.getAttribute('value') !== '') { // Nếu vẫn còn, thử JS
             await this.driver.executeScript("arguments[0].value = '';", el);
        }
    }
    await el.sendKeys(text);
  }
  async _click(locator: By): Promise<void> {
    const el = await this._waitForElementClickable(locator);
    await el.click();
  }

  async isOnVnPayMethodSelectionPage(timeout: number = 20000): Promise<boolean> {
    console.log("[VnPayGatewayPage] Waiting for VNPAY method selection page...");
    try {
      await this.driver.wait(async () => (await this.driver.getCurrentUrl()).includes("vnpayment.vn/paymentv2/Transaction/PaymentMethod.html"), timeout, "URL does not match VNPAY method selection page.");
      await this._waitForElementVisible(this.domesticCardAccordionButton, 5000);
      console.log("[VnPayGatewayPage] Verified on VNPAY method selection page.");
      return true;
    } catch (e) {
      console.error("[VnPayGatewayPage] Failed to verify on VNPAY method selection page.", e);
      return false;
    }
  }

  async selectDomesticCardMethod(): Promise<void> {
    console.log("[VnPayGatewayPage] Selecting 'Thẻ nội địa và tài khoản ngân hàng'...");
    await this._click(this.domesticCardAccordionButton);
    await this._waitForElementVisible(this.ncbBankItem, 10000);
    console.log("[VnPayGatewayPage] Bank selection page loaded.");
  }

  async selectNcbBank(): Promise<void> {
    console.log("[VnPayGatewayPage] Selecting NCB bank...");
    await this._click(this.ncbBankItem);
    await this._waitForElementVisible(this.cardNumberInput, 10000);
    console.log("[VnPayGatewayPage] Card details page loaded.");
  }

  async enterCardDetailsAndContinue(cardNumber: string, cardHolder: string, issueDate: string): Promise<void> {
    console.log("[VnPayGatewayPage] Entering card details...");
    await this._type(this.cardNumberInput, cardNumber, true);
    await this._type(this.cardHolderNameInput, cardHolder, true);
    await this._type(this.cardIssueDateInput, issueDate, true); 
    console.log("[VnPayGatewayPage] Clicking 'Tiếp tục' after card details...");
    await this._click(this.continueButton);
    await this._waitForElementVisible(this.agreeAndContinueButtonModal, 10000);
    console.log("[VnPayGatewayPage] Terms and conditions modal appeared.");
  }

  async agreeToTermsAndContinue(): Promise<void> {
    console.log("[VnPayGatewayPage] Clicking 'Đồng ý & Tiếp tục' on modal...");
    await this._click(this.agreeAndContinueButtonModal);
    // Chờ trang OTP load, sẽ được kiểm tra bởi isOnOtpPage
    // await this._waitForElementVisible(this.otpInput, 15000); // Không cần thiết nếu isOnOtpPage làm việc này
    console.log("[VnPayGatewayPage] Agreed to terms, expecting OTP page.");
  }
  
  // **** BỔ SUNG HÀM NÀY ****
  async isOnOtpPage(timeout: number = 15000): Promise<boolean> { // Tăng timeout
      console.log("[VnPayGatewayPage] Waiting for OTP page to load...");
      try {
          // Chờ URL của trang OTP (nếu bạn biết một phần đặc trưng của nó)
          await this.driver.wait(async () => (await this.driver.getCurrentUrl()).includes("vnpayment.vn/paymentv2") && (await this.driver.getCurrentUrl()).includes("Confirm.html"), timeout, "URL does not match VNPAY OTP confirmation page.");
          // VÀ chờ ô nhập OTP xuất hiện
          await this._waitForElementVisible(this.otpInput, timeout);
          console.log("[VnPayGatewayPage] Verified on OTP page.");
          return true;
      } catch (e) {
          console.error("[VnPayGatewayPage] Failed to verify on OTP page.", e);
          return false;
      }
  }

  async enterOtpAndConfirm(otp: string): Promise<void> {
    console.log(`[VnPayGatewayPage] Entering OTP: ${otp}`);
    await this._type(this.otpInput, otp, true); // Xóa trước khi nhập OTP
    console.log("[VnPayGatewayPage] Clicking 'Thanh toán' on OTP page...");
    await this._click(this.confirmPaymentButtonOtp);
    console.log("[VnPayGatewayPage] Submitted OTP, expecting redirect to merchant return URL.");
  }
  async enterOtpAndExpectError(otp: string, attempt: number): Promise<void> {
    console.log(`[VnPayGatewayPage] Entering incorrect OTP (attempt ${attempt}): ${otp}`);
    await this._type(this.otpInput, otp, true); // Xóa OTP cũ trước khi nhập
    await this._click(this.confirmPaymentButtonOtp);
    // Không chờ chuyển hướng, mà chờ thông báo lỗi
  }

  async getOtpErrorMessage(timeout: number = 5000): Promise<string | null> {
    try {
      const errorElement = await this._waitForElementVisible(this.otpErrorMessageLabel, timeout);
      return errorElement.getText();
    } catch (e) {
      return null;
    }
  }
  
}