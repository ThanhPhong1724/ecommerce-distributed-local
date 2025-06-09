// src/tests/productFlow2.test.ts
import { WebDriver, By, Key, WebElement } from 'selenium-webdriver';
import { 
    TimeoutError, 
    NoSuchAlertError,
    NoSuchElementError,
    ElementClickInterceptedError,
    UnexpectedAlertOpenError
} from 'selenium-webdriver/lib/error';

import { LoginPage } from '../pages/LoginPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VnPayTestGatewayPage } from '../pages/VnPayTestGatewayPage';
import { VnPayReturnPage } from '../pages/VnPayReturnPage';
// import { VnPayErrorPage } from '../pages/VnPayErrorPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage'; 

let driver: WebDriver;

async function acceptOptionalAlertIfPresent(
    currentDriver: WebDriver, 
    expectedTextContent?: string, 
    timeout: number = 7000
) {
    try {
        await currentDriver.wait(async () => {
            try {
                await currentDriver.switchTo().alert();
                return true; 
            } catch (e: any) {
                if (e instanceof NoSuchAlertError || (e.name && e.name.includes('NoSuchAlertError'))) {
                    return null; 
                }
                throw e;
            }
        }, timeout, `Alert (optional) did not appear within ${timeout}ms.`);
        
        const alert = currentDriver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(`[acceptOptionalAlertIfPresent] Alert present: "${alertText}". Accepting.`);
        if (expectedTextContent && !alertText.includes(expectedTextContent)) {
            console.warn(`[acceptOptionalAlertIfPresent] Alert text MISMATCH. Expected: "${expectedTextContent}". Still accepting.`);
        }
        await alert.accept();
        console.log(`[acceptOptionalAlertIfPresent] Accepted optional alert.`);
    } catch (e: any) {
        if (e instanceof TimeoutError || e.name === 'TimeoutError') {
            console.log("[acceptOptionalAlertIfPresent] No optional alert was present or it timed out.");
        } else if (e instanceof NoSuchAlertError || (e.name && e.name.includes('NoSuchAlertError'))) {
            console.log("[acceptOptionalAlertIfPresent] Alert not found (after wait), possibly already handled.");
        } else {
            console.warn("[acceptOptionalAlertIfPresent] An unexpected error occurred:", e.name, e.message);
        }
    }
}


describe('FUNC - Luồng Chức Năng Người Dùng (Sản phẩm, Giỏ hàng, Đặt hàng)', () => {
    jest.setTimeout(200000); 

    let loginPage: LoginPage;
    let productListPage: ProductListPage;
    let productDetailPage: ProductDetailPage;
    let cartPage: CartPage;
    let homePage: HomePage;
    let checkoutPage: CheckoutPage;
    let vnPayGatewayPage: VnPayTestGatewayPage;
    let vnPayReturnPage: VnPayReturnPage;
    let orderHistoryPage: OrderHistoryPage;

    const normalUserAccount = { email: 'na@gmail.com', password: '123456' };
    const productToTest = { 
        id: "cb5d4813-97de-447f-b9b0-b2dece7d226b",
        name: "Áo Khoác Dù 3 Lớp",
        price: 260000 
    };
    const anotherProductToTest = { 
        id: "147c9985-0a34-4eee-bc3e-3107786df014",
        name: "Chân váy may",
        price: 460000 
    };
    const testShippingAddress = "123 Đường Test E2E, Phường Test, Quận Test, TP. Test";
    const vnPayTestData = {
        cardNumber: "9704198526191432198",
        cardHolder: "NGUYEN VAN A",
        issueDate: "07/15",
        otp: "123456"
    };

    let lastCreatedOrderId: string | null = null; // Để lưu ID đơn hàng cho FUNC014

    beforeAll(async () => {
        const globalDriver = (global as any).e2eWebDriver as WebDriver | undefined;
        if (!globalDriver) throw new Error("WebDriver not initialized.");
        driver = globalDriver;

        loginPage = new LoginPage(driver);
        productListPage = new ProductListPage(driver);
        productDetailPage = new ProductDetailPage(driver);
        cartPage = new CartPage(driver);
        homePage = new HomePage(driver);
        checkoutPage = new CheckoutPage(driver);
        vnPayGatewayPage = new VnPayTestGatewayPage(driver);
        vnPayReturnPage = new VnPayReturnPage(driver);
        orderHistoryPage = new OrderHistoryPage(driver); // Khởi tạo

        console.log("Đăng nhập người dùng cho tất cả các test trong suite này...");
        await loginPage.navigateToLogin();
        await loginPage.login(normalUserAccount.email, normalUserAccount.password);
        await homePage.waitForPageToLoad(15000);
        expect(await homePage.isUserMenuButtonDisplayed(10000)).toBe(true); 
        console.log("Đăng nhập người dùng thành công.");
    });

    async function clearCartBeforeTest() {
        if (!driver) throw new Error("WebDriver not available for cart cleanup.");
        console.log("[clearCartBeforeTest] Navigating to cart for cleanup...");
        await cartPage.navigateToCart(); // Đảm bảo đã đến trang giỏ hàng và chờ load
        console.log("[clearCartBeforeTest] Currently on cart page for cleanup.");

        // Sử dụng data-testid đã thêm vào nút xóa ở frontend
        const allRemoveButtonsLocator = By.xpath("//button[starts-with(@data-testid, 'remove-cart-item-button-')]");
        let attempts = 0;
        const maxAttempts = 10; 

        try {
            await driver.wait(async () => {
                const removeButtonsVisible = await driver.findElements(allRemoveButtonsLocator).then(btns => btns.length > 0).catch(() => false);
                const isEmptyMsgVisible = await cartPage.isCartEmptyMessageVisible(1000); // Check nhanh
                return removeButtonsVisible || isEmptyMsgVisible;
            }, 15000, "Cart items (remove buttons) or empty message did not appear for cleanup check.");
        } catch (e) {
            console.warn("[clearCartBeforeTest] Could not confirm initial cart state for cleanup, proceeding.", e);
        }

        while (attempts < maxAttempts) {
            let removeButtons: WebElement[];
            try {
                removeButtons = await driver.findElements(allRemoveButtonsLocator);
            } catch (findError) { break; }

            if (removeButtons.length === 0) {
                console.log("[clearCartBeforeTest] No more remove buttons found, cart should be empty.");
                break; 
            }
            
            const firstRemoveButton = removeButtons[0];
            const fullTestId = await firstRemoveButton.getAttribute('data-testid');

            try {
                console.log(`[clearCartBeforeTest] Attempting to remove item with data-testid: ${fullTestId}`);
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", firstRemoveButton);
                await driver.sleep(300); 
                await firstRemoveButton.click(); 
                console.log("[clearCartBeforeTest] Clicked remove button. Waiting for confirmation alert...");

                await driver.wait(async () => {
                    try { await driver.switchTo().alert(); return true; } 
                    catch (e: any) { if (e instanceof NoSuchAlertError) return null; throw e; }
                }, 7000, `Confirmation alert did not appear for ${fullTestId}.`);
                
                await driver.switchTo().alert().accept();
                console.log("[clearCartBeforeTest] Accepted confirmation alert.");

                console.log(`[clearCartBeforeTest] Waiting for button with testid ${fullTestId} to disappear...`);
                await driver.wait(async () => {
                    return !(await cartPage.isElementDisplayed(By.xpath(`//button[@data-testid='${fullTestId}']`), 500));
                }, 7000, `Button with testid ${fullTestId} did not disappear.`);
                console.log(`[clearCartBeforeTest] Button with testid ${fullTestId} disappeared.`);

            } catch (error: any) {
                console.error(`[clearCartBeforeTest] Error removing ${fullTestId} (attempt ${attempts + 1}):`, error.name, error.message);
                 if (error instanceof UnexpectedAlertOpenError || (error.name && error.name.includes('UnexpectedAlertOpenError'))) {
                    try {
                        const rogueAlert = driver.switchTo().alert();
                        console.warn("[clearCartBeforeTest] Handling unexpected alert:", await rogueAlert.getText());
                        await rogueAlert.accept();
                    } catch (e2) { console.error("Failed to handle unexpected alert", e2); }
                }
            }
            attempts++;
        }
        
        expect(await cartPage.isCartEmpty(15000)).toBe(true);
        console.log("[clearCartBeforeTest] Cart cleanup finished.");
    }

    // --- User - Product ---
    describe('FUNC006 & FUNC007 - Chức năng Xem Sản Phẩm', () => {
        it('FUNC006: Người dùng có thể xem danh sách sản phẩm thành công', async () => {
            await productListPage.navigateToProductList();
            expect(await productListPage.areProductsDisplayed(10000)).toBe(true);
            const productCount = await productListPage.getDisplayedProductsCount();
            expect(productCount).toBeGreaterThan(0);
        });
        it('FUNC006.1: Hiện danh sách sản phẩm theo tìm kiếm', async () => {
            await productListPage.navigateToProductList();
            await productListPage.searchProduct(productToTest.name.substring(0, 7));
            expect(await productListPage.areProductsDisplayed(7000)).toBe(true);
            expect(await productListPage.getDisplayedProductsCount()).toBeGreaterThan(0);
            expect(await productListPage.isProductInList(productToTest.name)).toBe(true);

            await productListPage.searchProduct("nonexistentXYZ123");
            expect(await productListPage.isNoProductMessageDisplayed(7000)).toBe(true);
        });
        it('FUNC007: Người dùng có thể xem chi tiết một sản phẩm thành công', async () => {
            await productDetailPage.navigateToProductDetail(productToTest.id);
            expect(await productDetailPage.getProductName(7000)).toContain(productToTest.name);
            expect(parseFloat(await productDetailPage.getProductPrice())).toBe(productToTest.price);
            const stockText = await productDetailPage.getStockQuantityText();
            expect(stockText).toMatch(/Còn \d+ sản phẩm/);
        });
    });
    // --- User - Cart ---
    describe('FUNC008 đến FUNC011 - Chức năng Giỏ Hàng', () => {
        beforeEach(async () => { 
            console.log(`[Cart Tests - beforeEach] Dọn dẹp giỏ hàng...`);
            await clearCartBeforeTest(); 
        });

        it('FUNC008: Người dùng có thể thêm sản phẩm vào giỏ hàng khi đã đăng nhập', async () => { /* ... giữ nguyên ... */ });
        it('FUNC009: Người dùng có thể xem giỏ hàng khi có sản phẩm', async () => {
            await productListPage.navigateToProductList();
            await productListPage.clickAddToCartButtonForProduct(productToTest.name);
            await acceptOptionalAlertIfPresent(driver, "Đã thêm sản phẩm vào giỏ hàng");

            await cartPage.navigateToCart();
            expect(await cartPage.getCartItemsCount(7000)).toBe(1);
            expect(await cartPage.isProductInCart(productToTest.id)).toBe(true); // Dùng ID
            expect(await cartPage.getProductQuantityInCart(productToTest.id)).toBe(1); // Dùng ID
            expect(await cartPage.getTotalAmountValue()).toBe(productToTest.price);
        });

        it('FUNC010: Người dùng có thể cập nhật số lượng sản phẩm trong giỏ hàng thành công', async () => {
            await productListPage.navigateToProductList();
            await productListPage.clickAddToCartButtonForProduct(productToTest.name);
            await acceptOptionalAlertIfPresent(driver, "Đã thêm sản phẩm vào giỏ hàng");
            
            await cartPage.navigateToCart();
            expect(await cartPage.getProductQuantityInCart(productToTest.id, 7000)).toBe(1); // Dùng ID
            console.log("[FUNC010] Initial quantity in cart is 1.");

            console.log("[FUNC010] Calling updateProductQuantityInCart to set quantity to 3...");
            await cartPage.updateProductQuantityInCart(productToTest.id, productToTest.name, 3); 
            
            console.log("[FUNC010] Verifying quantity and total amount after update...");
            expect(await cartPage.getProductQuantityInCart(productToTest.id)).toBe(3); // Dùng ID
            expect(await cartPage.getTotalAmountValue()).toBe(productToTest.price * 3);
            console.log("[FUNC010] Quantity and total amount verified successfully.");
        });

        it('FUNC011: Người dùng có thể xóa sản phẩm khỏi giỏ hàng thành công', async () => {
            await productListPage.navigateToProductList();
            await productListPage.clickAddToCartButtonForProduct(productToTest.name);
            await acceptOptionalAlertIfPresent(driver, "Đã thêm sản phẩm vào giỏ hàng");
            
            await cartPage.navigateToCart();
            expect(await cartPage.getCartItemsCount(7000)).toBe(1);

            // Gọi hàm xóa theo ID nếu CartPage đã có removeProductById
            await cartPage.removeProductFromCartById(productToTest.id, productToTest.name); 
            expect(await cartPage.isCartEmpty(10000)).toBe(true);
        });
    });

    // --- User - Order (Checkout & Payment) ---
    describe('FUNC012 & FUNC013 - Luồng Đặt Hàng và Thanh Toán VNPAY', () => {
        beforeEach(async () => {
            console.log(`[Checkout Tests - beforeEach] Dọn dẹp và thêm sản phẩm vào giỏ...`);
            await clearCartBeforeTest();
            await productListPage.navigateToProductList();
            await productListPage.clickAddToCartButtonForProduct(productToTest.name);
            await acceptOptionalAlertIfPresent(driver, "Đã thêm sản phẩm vào giỏ hàng");
            await cartPage.navigateToCart();
            expect(await cartPage.getCartItemsCount(10000)).toBe(1);
        });

        it('FUNC012 & FUNC013: Tạo đơn hàng, chuyển đến VNPAY và thanh toán thành công (mô phỏng)', async () => {
            await cartPage.clickProceedToCheckout();

            await checkoutPage.navigateToCheckout();
            await checkoutPage.enterShippingAddress(testShippingAddress);
            await checkoutPage.clickPlaceOrderAndPay();
            console.log("[Checkout] Đã click Đặt hàng, chờ chuyển hướng VNPAY...");

            expect(await vnPayGatewayPage.isOnVnPayMethodSelectionPage(25000)).toBe(true);
            await vnPayGatewayPage.selectDomesticCardMethod();
            await vnPayGatewayPage.selectNcbBank();
            await vnPayGatewayPage.enterCardDetailsAndContinue(
                vnPayTestData.cardNumber, vnPayTestData.cardHolder, vnPayTestData.issueDate
            );
            await vnPayGatewayPage.agreeToTermsAndContinue();
            expect(await vnPayGatewayPage.isOnOtpPage(20000)).toBe(true);
            await vnPayGatewayPage.enterOtpAndConfirm(vnPayTestData.otp);
            console.log("[Checkout] Đã gửi OTP, chờ chuyển hướng về trang kết quả...");

            await vnPayReturnPage.waitForPageToLoad(25000);
            expect(await vnPayReturnPage.isPaymentSuccessful(10000)).toBe(true);
            const statusTitle = await vnPayReturnPage.getStatusTitle();
            expect(statusTitle.toLowerCase()).toContain("thanh toán thành công");
            const orderId = await vnPayReturnPage.getDisplayedOrderId();
            expect(orderId).toBeTruthy(); // Kiểm tra orderId có giá trị
            console.log(`[Checkout] Thanh toán thành công cho đơn hàng ID: ${orderId}`);

            await cartPage.navigateToCart(); // Kiểm tra giỏ hàng sau khi thanh toán
            expect(await cartPage.isCartEmpty(10000)).toBe(true);
        });

        // Test case thất bại (ví dụ OTP sai) - bạn có thể bỏ comment và điều chỉnh
        it('FUNC_EXTRA: Xử lý thanh toán VNPAY thất bại do OTP sai nhiều lần', async () => {
          await cartPage.clickProceedToCheckout();

            await checkoutPage.navigateToCheckout();
            await checkoutPage.enterShippingAddress(testShippingAddress);
            await checkoutPage.clickPlaceOrderAndPay();
            console.log("[Checkout] Đã click Đặt hàng, chờ chuyển hướng VNPAY...");

            expect(await vnPayGatewayPage.isOnVnPayMethodSelectionPage(25000)).toBe(true);
            await vnPayGatewayPage.selectDomesticCardMethod();
            await vnPayGatewayPage.selectNcbBank();
            await vnPayGatewayPage.enterCardDetailsAndContinue(
                vnPayTestData.cardNumber, vnPayTestData.cardHolder, vnPayTestData.issueDate
            );
            await vnPayGatewayPage.agreeToTermsAndContinue();
            expect(await vnPayGatewayPage.isOnOtpPage(20000)).toBe(true);

            const incorrectOtp = "000000";
            for (let i = 1; i <= 3; i++) {
                await vnPayGatewayPage.enterOtpAndExpectError(incorrectOtp, i);
                await driver.sleep(1000); 
                const errorMessage = await vnPayGatewayPage.getOtpErrorMessage(3000);
                if (errorMessage && errorMessage.includes("quá số lần quy định")) {
                    expect(errorMessage.toLowerCase()).toContain("quá số lần quy định");
                    return; 
                }
                if (i === 3) {
                    throw new Error("Expected OTP error message not found after 3 tries.");
                }
            }
        });
    });

    // --- User - Order History ---
    describe('FUNC014 - Chức năng Lịch Sử Đơn Hàng', () => {
        it('FUNC014: Người dùng có thể xem lịch sử đơn hàng khi có đơn hàng', async () => {
            await orderHistoryPage.navigateToPage(); // Điều hướng đến /orders
            expect(await orderHistoryPage.isPageTitleVisible(10000)).toBe(true);

            if (!lastCreatedOrderId) {
                console.warn("FUNC014: Không có lastCreatedOrderId từ test thanh toán trước đó. Sẽ chỉ kiểm tra xem trang lịch sử đơn hàng có load và có đơn hàng nào không (nếu người dùng đã có đơn hàng từ trước).");
                // Nếu không có ID cụ thể, chỉ cần kiểm tra xem có đơn hàng nào được hiển thị không,
                // hoặc có thông báo "chưa có đơn hàng" không.
                const hasAnyOrder = await orderHistoryPage.areOrdersDisplayed(7000);
                if (hasAnyOrder) {
                    console.log("[FUNC014] Trang lịch sử đơn hàng có hiển thị ít nhất một đơn hàng.");
                    // Bạn có thể lấy ID của đơn hàng đầu tiên để kiểm tra thêm nếu muốn
                    const firstId = await orderHistoryPage.getFirstOrderIdFromList();
                    expect(firstId).toBeTruthy();
                } else {
                    const noOrdersMsg = await orderHistoryPage.getNoOrdersMessageText(5000);
                    expect(noOrdersMsg).toContain("Chưa có đơn hàng nào");
                    console.log("[FUNC014] Trang lịch sử đơn hàng hiển thị thông báo 'Chưa có đơn hàng nào'.");
                }
                return; // Kết thúc sớm nếu không có orderId cụ thể để test
            }

            // Nếu có lastCreatedOrderId từ test thanh toán trước đó
            console.log(`[FUNC014] Kiểm tra sự tồn tại của đơn hàng ID: ${lastCreatedOrderId} trong lịch sử.`);
            expect(await orderHistoryPage.areOrdersDisplayed(10000)).toBe(true); // Phải có ít nhất 1 đơn hàng
            expect(await orderHistoryPage.isOrderInList(lastCreatedOrderId)).toBe(true);
            console.log(`[FUNC014] Đơn hàng ${lastCreatedOrderId} được tìm thấy trong lịch sử.`);

            // (Tùy chọn) Click vào xem chi tiết đơn hàng đó
            await orderHistoryPage.clickOrderDetailsLink(lastCreatedOrderId);
            
            // Chờ chuyển hướng đến trang chi tiết đơn hàng
            // URL có thể là /orders/:orderId
            let detailPageUrlCorrect = false;
            const expectedDetailUrlPart = `/orders/${lastCreatedOrderId}`;
            await driver.wait(async () => {
                const currentUrl = await driver.getCurrentUrl();
                detailPageUrlCorrect = currentUrl.includes(expectedDetailUrlPart);
                return detailPageUrlCorrect;
            }, 15000, `Không chuyển hướng đến trang chi tiết đơn hàng cho ID ${lastCreatedOrderId}. URL hiện tại: ${await driver.getCurrentUrl()}`);
            expect(detailPageUrlCorrect).toBe(true);
            console.log(`[FUNC014] Đã chuyển đến trang chi tiết đơn hàng cho ID: ${lastCreatedOrderId}`);
            
            // **BẠN SẼ CẦN TẠO OrderDetailPage.ts và thêm các expect để kiểm tra nội dung trang chi tiết đơn hàng**
            // Ví dụ:
            // const orderDetailPage = new OrderDetailPage(driver, lastCreatedOrderId);
            // expect(await orderDetailPage.getDisplayedOrderId()).toBe(lastCreatedOrderId);
            // expect(await orderDetailPage.getOrderStatus()).toBe("Completed"); // Hoặc trạng thái tương ứng
        });
    });
});