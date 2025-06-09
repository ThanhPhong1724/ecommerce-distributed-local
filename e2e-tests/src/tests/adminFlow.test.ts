// src/tests/adminFlow.test.ts
import { WebDriver, By, until } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage'; // Dùng chung
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'; // Đường dẫn mới
import { AdminUserManagementPage } from '../pages/admin/AdminUserManagementPage';
import { AdminProductManagementPage } from '../pages/admin/AdminProductManagementPage';
import { AdminProductFormPage, ProductFormData } from '../pages/admin/AdminProductFormPage';
import { AdminCategoryListPage } from '../pages/admin/AdminCategoryListPage'; // Giả sử bạn có trang này
import { AdminCategoryFormPage } from '../pages/admin/AdminCategoryFormPage'; // Giả sử bạn có trang này
import { AdminOrderManagementPage } from '../pages/admin/AdminOrderManagementPage';
import { AdminOrderDetailPage, OrderStatusAdmin } from '../pages/admin/AdminOrderDetailPage';
import { HomePage } from '../pages/HomePage'; // Dùng để logout admin (nếu dùng chung logout)
import { NoSuchAlertError, TimeoutError } from 'selenium-webdriver/lib/error';


/**
 * Chờ và chấp nhận một JavaScript alert nếu nó xuất hiện trong khoảng thời gian timeout.
 * Sẽ không ném lỗi nếu alert không xuất hiện (trừ khi có lỗi khác khi xử lý alert).
 * @param currentDriver Instance của WebDriver.
 * @param expectedTextContent (Tùy chọn) Một phần text mong đợi có trong alert để xác minh.
 * @param timeout (Tùy chọn) Thời gian chờ alert xuất hiện (mili giây). Mặc định 7000ms.
 */
export async function acceptOptionalAlertIfPresent(
    currentDriver: WebDriver, 
    expectedTextContent?: string, 
    timeout: number = 7000 
): Promise<void> {
    try {
        // Sử dụng custom predicate wait cho alert
        await currentDriver.wait(async () => {
            try {
                // Thử chuyển sang alert. Nếu thành công, alert đang hiện.
                await currentDriver.switchTo().alert();
                return true; // Điều kiện cho wait dừng lại: alert is present
            } catch (e: any) {
                // Nếu lỗi là NoSuchAlertError, nghĩa là alert chưa hiện, wait sẽ thử lại.
                if (e instanceof NoSuchAlertError || (e.name && e.name.includes('NoSuchAlertError'))) {
                    return null; // Trả về giá trị falsy để wait tiếp tục thử
                }
                // Nếu là lỗi khác, ném ra để wait dừng lại ngay và báo lỗi đó.
                throw e; 
            }
        }, timeout, `Alert (optional) did not appear within ${timeout}ms.`);
        
        // Nếu wait ở trên thành công (không ném TimeoutError), nghĩa là alert đã xuất hiện.
        const alert = currentDriver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(`[acceptOptionalAlertIfPresent] Alert present: "${alertText}". Accepting.`);

        if (expectedTextContent && !alertText.includes(expectedTextContent)) {
            console.warn(`[acceptOptionalAlertIfPresent] Alert text MISMATCH. Expected to include "${expectedTextContent}", but got "${alertText}". Still accepting.`);
        }
        await alert.accept();
        console.log(`[acceptOptionalAlertIfPresent] Accepted optional alert.`);

    } catch (e: any) {
        // Chỉ xử lý các lỗi liên quan đến việc alert không xuất hiện hoặc đã được xử lý.
        // Các lỗi khác (ví dụ từ predicate của wait) nên đã được throw ra trước đó.
        if (e instanceof TimeoutError || (e.name && e.name.includes('TimeoutError'))) {
            console.log(`[acceptOptionalAlertIfPresent] No optional alert was present or it timed out (after ${timeout}ms). This is acceptable for an optional alert.`);
        } else if (e instanceof NoSuchAlertError || (e.name && e.name.includes('NoSuchAlertError'))) {
            // Trường hợp này ít xảy ra nếu predicate của wait hoạt động đúng,
            // vì predicate nên trả về null thay vì để NoSuchAlertError thoát ra khỏi wait.
            // Tuy nhiên, vẫn bắt để đề phòng.
            console.log("[acceptOptionalAlertIfPresent] Alert not found when trying to switch (possibly already handled or an issue with wait predicate).");
        } else {
            // Log các lỗi không mong muốn khác xảy ra trong quá trình này
            console.warn("[acceptOptionalAlertIfPresent] An unexpected error occurred while trying to handle an optional alert:", e.name, e.message);
            // Bạn có thể quyết định throw e; ở đây nếu muốn test case fail khi có lỗi lạ.
        }
    }
}

async function acceptOptionalAlert(driver: WebDriver, expectedText?: string, timeout: number = 3000) {
    try {
        // Chờ alert xuất hiện
        await driver.wait(async () => {
            try {
                await driver.switchTo().alert(); // Thử chuyển sang alert
                return true; // Nếu thành công, alert đã xuất hiện
            } catch (e) {
                // Nếu NoSuchAlertError, alert chưa xuất hiện, tiếp tục chờ
                if (e instanceof NoSuchAlertError || (e instanceof Error && e.name === 'NoSuchAlertError')) {
                    return false;
                }
                throw e; // Lỗi khác, ném ra để catch bên ngoài xử lý
            }
        }, timeout, `Alert did not appear within ${timeout}ms.`);

        const alert = driver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(`Optional alert present with text: "${alertText}". Accepting it.`);
        if (expectedText && !alertText.includes(expectedText)) {
            console.warn(`Alert text "${alertText}" did not match expected "${expectedText}". Still accepting.`);
        }
        await alert.accept();
        console.log("Accepted optional alert.");
    } catch (e: any) {
        if (e instanceof TimeoutError || e.name === 'TimeoutError' ||
            e instanceof NoSuchAlertError || e.name === 'NoSuchAlertError') {
            console.log("No optional alert was present or it was already handled within the timeout.");
        } else {
            // Ném lại các lỗi không mong muốn khác để test có thể fail nếu cần
            console.error("Unknown error while trying to handle optional alert:", e);
            // throw e; // Cân nhắc có nên throw ở đây không, tùy thuộc vào logic của bạn
        }
    }
}
// --- KẾT THÚC ĐỊNH NGHĨA HÀM ---
let driver: WebDriver;
let loginPage: LoginPage;
let adminDashboardPage: AdminDashboardPage;
let adminUserManagementPage: AdminUserManagementPage;
let adminProductManagementPage: AdminProductManagementPage;
let adminProductFormPage: AdminProductFormPage;
let adminCategoryListPage: AdminCategoryListPage;
let adminCategoryFormPage: AdminCategoryFormPage;
let adminOrderManagementPage: AdminOrderManagementPage;
let adminOrderDetailPage: AdminOrderDetailPage;
// let homePage: HomePage; // Nếu admin logout về trang chủ và dùng logout của HomePage

const adminCredentials = { email: 'admin@gmail.com', password: '123456' };
const generateRandomString = (length: number = 8) => Math.random().toString(36).substring(2, 2 + length);

describe('ADMFUNC - Luồng Chức Năng Quản Trị Viên', () => {
    jest.setTimeout(220000); 

    beforeAll(async () => {
        const globalDriver = (global as any).e2eWebDriver as WebDriver | undefined;
        if (!globalDriver) throw new Error("WebDriver not initialized.");
        driver = globalDriver;

        loginPage = new LoginPage(driver); 
        adminDashboardPage = new AdminDashboardPage(driver);
        adminUserManagementPage = new AdminUserManagementPage(driver);
        adminProductManagementPage = new AdminProductManagementPage(driver);
        adminProductFormPage = new AdminProductFormPage(driver);
        adminCategoryListPage = new AdminCategoryListPage(driver);
        adminCategoryFormPage = new AdminCategoryFormPage(driver);
        adminOrderManagementPage = new AdminOrderManagementPage(driver);
        adminOrderDetailPage = new AdminOrderDetailPage(driver);
        // homePage = new HomePage(driver); 

        console.log("[AdminTests BeforeAll] Đăng nhập tài khoản Admin...");
        await loginPage.navigateToLogin(); 
        await loginPage.login(adminCredentials.email, adminCredentials.password);
        // Login xong sẽ tự redirect đến /admin/dashboard
        await adminDashboardPage.waitForPageToLoad(20000); // Hàm này đã chờ title
        expect(await adminDashboardPage.isPageTitleVisible(10000)).toBe(true); 
        console.log("[AdminTests BeforeAll] Admin đăng nhập và trang dashboard đã load.");
    });

    beforeEach(async () => {
        console.log(`[AdminTest Starting] ${expect.getState().currentTestName}`);
        // Đảm bảo luôn ở trang dashboard admin trước mỗi nhóm test chính (nếu cần)
        // Hoặc để beforeEach của từng describe con tự navigate
        // await adminDashboardPage.navigateToPage();
        // await adminDashboardPage.waitForPageToLoad(10000);
    });

    afterAll(async () => {
        if (driver) {
            console.log("[AdminTests AfterAll] Đăng xuất tài khoản Admin...");
            await adminDashboardPage.logout(); // Sử dụng hàm logout của AdminDashboardPage
            // Chờ chuyển hướng về trang login
            const loginPageInstance = new LoginPage(driver); // Tạo instance mới để check
            expect(await loginPageInstance.isOnLoginPage(15000)).toBe(true);
            console.log("[AdminTests AfterAll] Admin đã đăng xuất.");
        }
    });

    // --- Admin - Auth ---
    describe('ADMFUNC001 - Xác thực Admin', () => {
        it('ADMFUNC001: Admin đăng nhập thành công với tài khoản đúng', async () => {
            // beforeAll đã thực hiện đăng nhập, ở đây chỉ cần xác minh lại
            console.log("[ADMFUNC001] Xác minh lại trạng thái đăng nhập admin...");
            await adminDashboardPage.navigateToPage(); // Đảm bảo đang ở dashboard
            await adminDashboardPage.waitForPageToLoad(10000);
            expect(await adminDashboardPage.isAdminWelcomeMessageDisplayed(7000)).toBe(true);
            const welcomeMsg = await adminDashboardPage.getAdminWelcomeMessage();
            // Điều chỉnh cho khớp với text trên UI (có thể chỉ có email, hoặc cả tên)
            expect(welcomeMsg).toContain(`Quản trị viên ${adminCredentials.email}`);
        });
    });

    // // --- Admin - User Management ---
    describe('ADMFUNC002 & ADMFUNC003 - Quản lý Người dùng', () => {
        beforeEach(async () => {
            console.log(`[UserMng beforeEach] Navigating to User Management page...`);
            await adminUserManagementPage.navigateToPage(); 
            // waitForPageToLoad đã được gọi trong navigateToPage của AdminUserManagementPage
        });

        it('ADMFUNC002: Admin xem danh sách tất cả người dùng', async () => {
            expect(await adminUserManagementPage.areUsersDisplayed(10000)).toBe(true); // Tăng timeout
            const userCount = await adminUserManagementPage.getDisplayedUserCount();
            expect(userCount).toBeGreaterThanOrEqual(1); // Ít nhất phải có tài khoản admin đang đăng nhập

            // (Tùy chọn) Kiểm tra xem admin hiện tại có trong danh sách không
            expect(await adminUserManagementPage.isUserInList(adminCredentials.email, 7000)).toBe(true);
            // (Tùy chọn) Kiểm tra xem normalUserAccount (từ user flow) có trong danh sách không (nếu nó đã được tạo)
            // expect(await adminUserManagementPage.isUserInList(normalUserAccount.email, 7000)).toBe(true);
        });

        it.skip('ADMFUNC003: Admin cập nhật vai trò của một người dùng từ User sang Admin và ngược lại', async () => {
            // // Sử dụng normalUserAccount (na@gmail.com) để test
            // // Đảm bảo tài khoản này tồn tại và có vai trò ban đầu là "User"
            // const targetUserEmail = normalUserAccount.email;
            // const initialRole = "User"; // Vai trò ban đầu mong đợi
            // const newRoleToSet = "Admin";
            // const roleToRevert = "User";

            // console.log(`[ADMFUNC003] Bắt đầu test thay đổi vai trò cho user: ${targetUserEmail}`);

            // // Bước 1: Xác minh vai trò ban đầu là "User"
            // let currentRole = await adminUserManagementPage.getUserRole(targetUserEmail);
            // // So sánh không phân biệt hoa thường cho vai trò
            // expect(currentRole?.toLowerCase()).toBe(initialRole.toLowerCase());
            // console.log(`[ADMFUNC003] Vai trò ban đầu của ${targetUserEmail} là "${currentRole}".`);

            // // Bước 2: Click nút sửa vai trò và mở form/modal
            // await adminUserManagementPage.clickEditRoleButtonForUser(targetUserEmail);

            // // Bước 3: Chọn vai trò mới là "Admin" trong form/modal
            // await adminUserManagementPage.selectNewRoleInForm(newRoleToSet);

            // // Bước 4: Lưu thay đổi
            // await adminUserManagementPage.saveRoleChanges();
            // console.log(`[ADMFUNC003] Đã lưu thay đổi vai trò thành ${newRoleToSet}.`);

            // // Bước 5: Xác minh vai trò đã được cập nhật thành "Admin"
            // currentRole = await adminUserManagementPage.getUserRole(targetUserEmail);
            // expect(currentRole?.toLowerCase()).toBe(newRoleToSet.toLowerCase());
            // console.log(`[ADMFUNC003] Vai trò của ${targetUserEmail} đã được cập nhật thành "${currentRole}".`);

            // // --- Phần Cleanup: Đổi vai trò lại thành "User" để không ảnh hưởng các test khác ---
            // console.log(`[ADMFUNC003 Cleanup] Đổi vai trò của ${targetUserEmail} trở lại thành ${roleToRevert}...`);
            // await adminUserManagementPage.clickEditRoleButtonForUser(targetUserEmail);
            // await adminUserManagementPage.selectNewRoleInForm(roleToRevert);
            // await adminUserManagementPage.saveRoleChanges();
            
            // currentRole = await adminUserManagementPage.getUserRole(targetUserEmail);
            // expect(currentRole?.toLowerCase()).toBe(roleToRevert.toLowerCase());
            // console.log(`[ADMFUNC003 Cleanup] Vai trò của ${targetUserEmail} đã được khôi phục thành "${currentRole}".`);
        });
    });

    describe('ADMFUNC004 đến ADMFUNC006 - Quản lý Sản phẩm', () => {
        let createdProductIdForCleanup: string | null = null; // Dùng để cleanup sau mỗi test trong nhóm này
        const testProductBaseName = `SP-E2E-${generateRandomString(5)}`; // Tên sản phẩm test cơ sở

        beforeEach(async () => {
            console.log(`[ProductMng beforeEach] Navigating to Product Management page...`);
            await adminProductManagementPage.navigateToPage();
            // waitForPageToLoad đã được gọi trong navigateToPage của AdminProductManagementPage
        });
        
        afterEach(async () => {
            if (createdProductIdForCleanup) {
                console.log(`[ProductMng afterEach] Dọn dẹp sản phẩm ID: ${createdProductIdForCleanup}`);
                await adminProductManagementPage.navigateToPage();
                try {
                    await adminProductManagementPage.deleteProductById(createdProductIdForCleanup);
                    await adminProductManagementPage.waitForProductToDisappear(createdProductIdForCleanup);
                } catch (e) {
                    console.warn(`[ProductMng afterEach] Lỗi khi dọn dẹp sản phẩm ${createdProductIdForCleanup}:`, e);
                }
                createdProductIdForCleanup = null;
            }
        });

        it('ADMFUNC004: Admin thêm sản phẩm mới thành công với thông tin hợp lệ', async () => {
            const productName = `Quan Cạp Liền E2E ${generateRandomString(5)}`; // Tên sản phẩm test
            console.log(`[ADMFUNC004] Bắt đầu test thêm sản phẩm: ${productName}`);
            const productData = {
                name: productName,
                price: 190000,
                description: "Quần cạp liền, chất liệu cotton thoáng mát.",
                categoryId: "b8d1c381-24d9-460b-93ca-781bdcfac3e9", // **CẦN THAY THẾ BẰNG ID DANH MỤC HỢP LỆ**
                stockQuantity: 77,
                images: [{ url: "https://via.placeholder.com/150" }] 
            };

            await adminProductManagementPage.clickAddProductButton();
            await adminProductFormPage.waitForPageToLoad_CreateMode(10000);
            
            await adminProductFormPage.fillProductForm(productData);
            await adminProductFormPage.clickSubmitButton();

            // Chờ chuyển hướng về trang danh sách sản phẩm và xác minh
            await adminProductManagementPage.waitForPageToLoad(15000);
            expect(await adminProductManagementPage.isProductInListByName(productName, 7000)).toBe(true);
            console.log(`[ADMFUNC004] Sản phẩm "${productName}" đã được thêm và tìm thấy trong danh sách.`);
            
            // (Quan trọng) Lấy ID của sản phẩm vừa tạo để có thể xóa nó trong afterEach
            // Điều này đòi hỏi page object của bạn có thể lấy ID từ tên hoặc bạn có cách khác
            // createdProductIdForCleanup = await adminProductManagementPage.getProductIdByName(productName); // Cần implement hàm này
        });

        it('ADMFUNC005: Admin có thể sửa thông tin (ví dụ: giá) của một sản phẩm', async () => {
            const originalProductName = `${testProductBaseName}-CanSua-${generateRandomString(3)}`;
            const initialProductData: ProductFormData = {
                name: originalProductName,
                price: 300000,
                categoryId: "b8d1c381-24d9-460b-93ca-781bdcfac3e9", // **THAY THẾ**
                stockQuantity: 30,
                description: "Sản phẩm gốc.",
                imageUrl: "https://via.placeholder.com/150/orange"
            };

            // Bước 1: Tạo sản phẩm để sửa
            console.log(`[ADMFUNC005] Tạo sản phẩm: ${originalProductName}`);
            await adminProductManagementPage.clickAddProductButton(); 
            await adminProductFormPage.waitForPageToLoad_CreateMode(); 
            await adminProductFormPage.fillProductForm(initialProductData);
            await adminProductFormPage.clickSubmitButton(); // Xử lý alert "Thêm thành công"
            
            await adminProductManagementPage.waitForPageToLoad(15000); // Chờ quay lại trang list
            const productIdToEdit = await adminProductManagementPage.getProductIdByName(originalProductName, 10000);
            expect(productIdToEdit).toBeTruthy();
            if (!productIdToEdit) throw new Error("Không tạo được sản phẩm để sửa cho ADMFUNC005");
            
            createdProductIdForCleanup = productIdToEdit; 
            console.log(`[ADMFUNC005] Sản phẩm được tạo với ID: ${productIdToEdit} để sửa.`);

            // Bước 2: Click nút sửa cho sản phẩm đó
            await adminProductManagementPage.clickEditProductButton(productIdToEdit); // Sử dụng hàm mới với data-testid
            
            // Chờ form sửa load dữ liệu
            await adminProductFormPage.waitForPageToLoad_EditMode(productIdToEdit, 15000); 
            console.log(`[ADMFUNC005] Form sửa cho ID "${productIdToEdit}" đã load.`);

            // Bước 3: Sửa thông tin
            const updatedPriceNumber = 35000000;
            const productUpdates: Partial<ProductFormData> = {
                price: updatedPriceNumber, // Sửa giá
                description: "Mô tả đã được cập nhật ngon lành."
            };
            await adminProductFormPage.fillProductForm(productUpdates);
            await adminProductFormPage.clickSubmitButton(); // Xử lý alert "Cập nhật thành công"
            console.log(`[ADMFUNC005] Đã submit form cập nhật.`);

            // Bước 4: Xác minh
            await adminProductManagementPage.navigateToPage(); // Quay lại trang danh sách
            await adminProductManagementPage.waitForPageToLoad(10000);
            
            const productInfoAfterEdit = await adminProductManagementPage.getProductInfoFromListById(productIdToEdit);
            console.log("[ADMFUNC005] Raw price from list after edit:", productInfoAfterEdit!.price); // << THÊM LOG NÀY
            expect(productInfoAfterEdit).not.toBeNull();

            const rawPriceFromUI = productInfoAfterEdit!.price; // Ví dụ: "35000000.00₫" hoặc "35.000.000₫" hoặc "350.000₫"
            console.log(`[ADMFUNC005] Raw price from list after edit: "${rawPriceFromUI}"`);

            // Bước 1: Loại bỏ ký tự tiền tệ và khoảng trắng
            let cleanedPrice = rawPriceFromUI.replace(/₫/g, '').trim();

            // Bước 2: Xử lý trường hợp có ".00" ở cuối (cho giá trị như 35000000.00)
            if (cleanedPrice.endsWith(".00")) {
                cleanedPrice = cleanedPrice.substring(0, cleanedPrice.length - 3);
            }
            // Bây giờ cleanedPrice có thể là "35000000" (nếu gốc là "35000000.00₫")
            // hoặc "35.000.000" (nếu gốc là "35.000.000₫")
            // hoặc "350.000" (nếu gốc là "350.000₫")


            // Bước 3: Loại bỏ các dấu chấm dùng làm phân cách hàng nghìn (nếu có)
            // Ví dụ: "35.000.000" -> "35000000"
            // "350.000" -> "350000"
            cleanedPrice = cleanedPrice.replace(/\./g, '');

            console.log(`[ADMFUNC005] Cleaned price string for parsing: "${cleanedPrice}"`);

            const priceFromListParsed = parseFloat(cleanedPrice);
            console.log(`[ADMFUNC005] Parsed price from list: ${priceFromListParsed}`);

            expect(priceFromListParsed).toBe(updatedPriceNumber); // updatedPriceNumber là 35000000
            console.log(`[ADMFUNC005] Giá sản phẩm ID ${productIdToEdit} trên danh sách đã cập nhật: ${priceFromListParsed}`);
        });

        it('ADMFUNC006: Admin có thể xóa một sản phẩm thành công', async () => {
            const productNameToDelete = `${testProductBaseName}-DeXoa-${generateRandomString(3)}`;
            const productData: ProductFormData = {
                name: productNameToDelete,
                price: 99000,
                categoryId: "b8d1c381-24d9-460b-93ca-781bdcfac3e9", // **THAY THẾ ID DANH MỤC HỢP LỆ**
                stockQuantity: 15,
                description: "Sản phẩm này sẽ bị xóa.",
                imageUrl: "https://via.placeholder.com/150/red"
            };

            // Bước 1: Tạo sản phẩm để xóa
            console.log(`[ADMFUNC006] Tạo sản phẩm để xóa: ${productNameToDelete}`);
            await adminProductManagementPage.clickAddProductButton();
            await adminProductFormPage.waitForPageToLoad_CreateMode();
            await adminProductFormPage.fillProductForm(productData);
            await adminProductFormPage.clickSubmitButton(); // false vì là tạo mới
            
            await adminProductManagementPage.waitForPageToLoad(15000); // Chờ quay lại trang danh sách
            const productIdToDelete = await adminProductManagementPage.getProductIdByName2(productNameToDelete, 10000);
            expect(productIdToDelete).toBeTruthy();
            if (!productIdToDelete) throw new Error("Không thể tạo hoặc lấy ID sản phẩm để xóa cho ADMFUNC006");
            console.log(`[ADMFUNC006] Sản phẩm được tạo với ID: ${productIdToDelete} để chuẩn bị xóa.`);

            // Bước 2: Xóa sản phẩm
            await adminProductManagementPage.deleteProductById(productIdToDelete);
            
            // Bước 3: Xác minh sản phẩm đã bị xóa
            // Chờ một chút để danh sách có thể cập nhật hoàn toàn sau khi xóa
            await adminProductManagementPage.waitForProductToDisappear(productIdToDelete, 15000); // Chờ element dòng biến mất
            
            // Kiểm tra lại một lần nữa xem nó có còn trong danh sách không
            expect(await adminProductManagementPage.isProductInListById(productIdToDelete, 3000)).toBe(false);
            console.log(`[ADMFUNC006] Sản phẩm ID ${productIdToDelete} đã được xóa thành công.`);
        });
    });

    // --- Admin - Order Management ---
    describe('ADMFUNC007 & ADMFUNC008 - Quản lý Đơn hàng', () => {
        beforeEach(async () => {
            console.log(`[OrderMng beforeEach] Navigating to Order Management page...`);
            await adminOrderManagementPage.navigateToPage();
            // waitForPageToLoad đã được gọi trong navigateToPage của AdminOrderManagementPage
        });

        it('ADMFUNC007: Admin xem danh sách tất cả đơn hàng', async () => {
            expect(await adminOrderManagementPage.areOrdersDisplayed(10000)).toBe(true);
            const orderCount = await adminOrderManagementPage.getDisplayedOrderCount();
            expect(orderCount).toBeGreaterThanOrEqual(0); 
            // Không kiểm tra lastCreatedOrderId ở đây nữa
        });

        // Bỏ .skip để chạy test này
        // it.only('ADMFUNC008: Admin cập nhật trạng thái đơn hàng từ Pending sang Processing', async () => {
        //     console.log("[ADMFUNC008] Tìm kiếm một đơn hàng có trạng thái 'Pending'...");
        //     // Hàm findOrderWithStatus trong AdminOrderManagementPage cần trả về ID đầy đủ
        //     const orderIdToUpdate = await adminOrderManagementPage.findOrderWithStatus(OrderStatusApi.PENDING, 15000);
            
        //     if (!orderIdToUpdate) {
        //         console.warn("ADMFUNC008: Không tìm thấy đơn hàng 'Pending' nào để test. Test này sẽ được coi là pass nhưng có cảnh báo.");
        //         // Hoặc bạn có thể throw lỗi để test fail nếu không tìm thấy đơn hàng Pending là một lỗi nghiêm trọng
        //         // throw new Error("Không có đơn hàng Pending để test ADMFUNC008.");
        //         // Hiện tại, chúng ta sẽ cho qua nếu không tìm thấy để tránh làm fail toàn bộ khi không có data phù hợp
        //         expect(true).toBe(true); // Để test không báo lỗi "no assertions"
        //         return; 
        //     }
        //     console.log(`[ADMFUNC008] Sẽ cập nhật trạng thái cho đơn hàng ID: ${orderIdToUpdate}`);

        //     await adminOrderManagementPage.navigateToOrderDetailPage(orderIdToUpdate); // Navigate đến chi tiết
            
        //     // Khởi tạo AdminOrderDetailPage với ID cụ thể này
        //     const currentOrderDetailPage = new AdminOrderDetailPage(driver, orderIdToUpdate);
        //     await currentOrderDetailPage.waitForPageToLoad(orderIdToUpdate, 15000);

        //     const initialStatus = await currentOrderDetailPage.getCurrentStatus();
        //     console.log(`[ADMFUNC008] Trạng thái ban đầu của đơn hàng ${orderIdToUpdate}: ${initialStatus}`);
        //     // Chúng ta đã tìm đơn hàng Pending, nên có thể expect nó là Pending
        //     // Tuy nhiên, để linh hoạt, chỉ cần log và tiếp tục
        //     // expect(initialStatus?.toUpperCase()).toBe(OrderStatusAdmin.PENDING.toUpperCase());

        //     console.log(`[ADMFUNC008] Cập nhật trạng thái sang ${OrderStatusAdmin.PROCESSING}...`);
        //     await currentOrderDetailPage.updateStatusTo(OrderStatusAdmin.PROCESSING); // Hàm này cần được implement đúng
            
        //     // Xác minh trạng thái mới trên cùng trang chi tiết (nếu UI cập nhật)
        //     // Hoặc navigate lại về danh sách và kiểm tra
        //     console.log(`[ADMFUNC008] Chờ một chút để trạng thái có thể cập nhật trên UI...`);
        //     await driver.sleep(2000); // Chờ ngắn cho UI có thể re-render

        //     const newStatus = await currentOrderDetailPage.getCurrentStatus(7000);
        //     console.log(`[ADMFUNC008] Trạng thái mới của đơn hàng ${orderIdToUpdate}: ${newStatus}`);
        //     expect(newStatus?.toUpperCase()).toBe(OrderStatusAdmin.PROCESSING.toUpperCase());
        // });
        it('ADMFUNC008: Admin cập nhật trạng thái đơn hàng từ Pending sang Processing', async () => {
            const targetInitialStatus = OrderStatusAdmin.PENDING; 
            const newStatusToSet = OrderStatusAdmin.PROCESSING;
            
            console.log(`[ADMFUNC008] Tìm kiếm một đơn hàng có trạng thái '${targetInitialStatus}'...`);
            // Hàm findOrderWithStatus trong AdminOrderManagementPage trả về orderId
            const orderIdToUpdate = await adminOrderManagementPage.findOrderWithStatus(targetInitialStatus, 20000); // Tăng timeout
            
            if (!orderIdToUpdate) {
                // Nếu không có đơn hàng Pending, test này không thể thực hiện.
                // Tùy bạn muốn nó fail hay skip. Hiện tại là throw Error.
                throw new Error(`ADMFUNC008: Không tìm thấy đơn hàng nào có trạng thái "${targetInitialStatus}" để test. Vui lòng tạo một đơn hàng Pending trước hoặc kiểm tra hàm findOrderWithStatus.`);
            }
            console.log(`[ADMFUNC008] Sẽ cập nhật trạng thái cho đơn hàng ID: ${orderIdToUpdate}`);

            // Điều hướng đến trang chi tiết của đơn hàng đó
            await adminOrderManagementPage.navigateToOrderDetailPage(orderIdToUpdate); 
            
            // Khởi tạo AdminOrderDetailPage ở đây với orderId đã biết
            // Hoặc nếu navigateToOrderDetailPage đã làm điều này thì không cần
            const currentOrderDetailPage = new AdminOrderDetailPage(driver, orderIdToUpdate); // Truyền ID vào constructor
            await currentOrderDetailPage.waitForPageToLoad(orderIdToUpdate, 25000); // Chờ trang chi tiết load

            const initialStatus = await currentOrderDetailPage.getCurrentStatus();
            console.log(`[ADMFUNC008] Trạng thái ban đầu của đơn hàng ${orderIdToUpdate}: ${initialStatus}`);
            // Không nhất thiết phải là PENDING nếu findOrderWithStatus có thể tìm thấy đơn hàng cũ
            // Quan trọng là nó thay đổi đúng sau khi cập nhật. 
            // Để an toàn, nếu muốn test chính xác, bạn nên tạo đơn hàng Pending mới trong 1 before hook.
            // Hiện tại, chúng ta chấp nhận đơn hàng tìm được.

            console.log(`[ADMFUNC008] Cập nhật trạng thái sang ${newStatusToSet}...`);
            await currentOrderDetailPage.updateStatusTo(newStatusToSet); 
            // Hàm updateStatusTo trong Page Object sẽ:
            // 1. Click nút "Edit Status" (nếu cần)
            // 2. Chọn giá trị mới trong dropdown
            // 3. Click nút "Save/Update"

            // Xử lý alert XÁC NHẬN của trình duyệt (NẾU frontend của bạn có window.confirm)
            try {
                console.log("[ADMFUNC008] Waiting for browser confirmation alert for status update...");
                await driver.wait(async () => {
                    try { await driver.switchTo().alert(); return true; }
                    catch (e: any) { if (e instanceof NoSuchAlertError) return null; throw e; }
                }, 7000, "Browser confirmation alert for status update did not appear.");
                
                const confirmAlert = driver.switchTo().alert();
                const alertText = await confirmAlert.getText();
                console.log(`[ADMFUNC008] Confirmation alert text: "${alertText}"`);
                // Ví dụ: expect(alertText).toContain("Bạn chắc chắn muốn cập nhật");
                await confirmAlert.accept();
                console.log("[ADMFUNC008] Accepted browser confirmation alert.");
            } catch (e: any) {
                if (e instanceof TimeoutError) {
                    console.warn("[ADMFUNC008] No browser confirmation alert found. Assuming direct update or frontend handles confirm differently.");
                } else { console.error("[ADMFUNC008] Error handling browser confirmation alert:", e); }
            }

            // Chờ alert THÀNH CÔNG từ ứng dụng (NẾU frontend của bạn có alert("Cập nhật thành công!"))
            console.log("[ADMFUNC008] Waiting for application success alert (if any)...");
            await acceptOptionalAlertIfPresent(driver, "Cập nhật thành công", 7000); 
            
            // Xác minh trạng thái đã được cập nhật trên trang chi tiết
            console.log(`[ADMFUNC008] Verifying final status on detail page for order ${orderIdToUpdate}...`);
            // Có thể cần refresh hoặc chờ UI cập nhật sau khi các alert được xử lý
            await driver.sleep(1000); // Chờ ngắn
            // await driver.navigate().refresh(); // Thử refresh nếu trạng thái không tự cập nhật
            // await currentOrderDetailPage.waitForPageToLoad(orderIdToUpdate, 15000);

            const newStatusOnPage = await currentOrderDetailPage.getCurrentStatus(7000);
            console.log(`[ADMFUNC008] Trạng thái mới của đơn hàng ${orderIdToUpdate}: ${newStatusOnPage}`);
            expect(newStatusOnPage).toBe(newStatusToSet); // So sánh enum value
            console.log("[ADMFUNC008] Cập nhật trạng thái đơn hàng thành công!");
        });
    });
});