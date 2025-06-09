// src/tests/auth.test.ts
import { WebDriver } from 'selenium-webdriver';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

const generateRandomEmail = (prefix: string = 'testuser') => `${prefix}_${Date.now()}@example.com`;

describe('FUNC - Các Kịch Bản Xác Thực Người Dùng', () => { // Đổi tên describe chính
  jest.setTimeout(120000);

  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let homePage: HomePage;
  let adminDashboardPage: AdminDashboardPage;
  let driver: WebDriver;

  const normalUserAccount = { 
    email: 'na@gmail.com', 
    password: '123456', 
    firstName: 'Normal', 
    lastName: 'User' 
  };
  const adminUserAccount = { 
    email: 'admin@gmail.com', 
    password: '123456',
    firstName: 'Admin'
  };
  let newlyRegisteredUser = { 
    email: '', 
    password: '',
    firstName: 'Fresh',
    lastName: 'User'
  };

  beforeAll(async () => {
    const globalDriver = (global as any).e2eWebDriver as WebDriver | undefined;
    if (!globalDriver) {
        throw new Error("WebDriver (global.e2eWebDriver) was not initialized by globalSetup.");
    }
    driver = globalDriver;

    loginPage = new LoginPage(driver); 
    registerPage = new RegisterPage(driver);
    homePage = new HomePage(driver);
    adminDashboardPage = new AdminDashboardPage(driver);
    console.log('Page Objects đã được khởi tạo trong beforeAll.');
  });

  beforeEach(async () => {
    if (!driver) {
        throw new Error("WebDriver không sẵn sàng trong beforeEach.");
    }
    try {
        await driver.get('http://localhost:5173/');
        await driver.executeScript("window.localStorage.clear();");
        await driver.executeScript("window.sessionStorage.clear();");
        await driver.manage().deleteAllCookies();
        console.log('Trạng thái đã được reset trong beforeEach (localStorage, sessionStorage, cookies đã xóa).');
    } catch (error) {
        console.error("Lỗi trong beforeEach khi reset trạng thái:", error);
    }
  });

  // --- FUNC001: Đăng ký tài khoản thành công ---
  it('FUNC001: Cho phép người dùng mới đăng ký thành công với thông tin hợp lệ', async () => {
    newlyRegisteredUser.email = generateRandomEmail('func001');
    newlyRegisteredUser.password = 'validPass123';

    await registerPage.navigateToRegister();
    await registerPage.register(
        newlyRegisteredUser.firstName, 
        newlyRegisteredUser.lastName, 
        newlyRegisteredUser.email, 
        newlyRegisteredUser.password
    );
    
    const successMessage = await registerPage.getSuccessMessage();
    expect(successMessage).toContain('Đăng ký thành công!');
    
    expect(await loginPage.isOnLoginPage(7000)).toBe(true);
  });

  // --- FUNC002: Đăng ký tài khoản thất bại với email đã tồn tại ---
  it('FUNC002: Ngăn chặn đăng ký với email đã tồn tại', async () => {
    await registerPage.navigateToRegister();
    await registerPage.register('Test', 'User', normalUserAccount.email, 'anyPassword123');

    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toBe("Email đã tồn tại"); 
  });

  // --- FUNC003: Đăng nhập thành công với tài khoản hợp lệ ---
  describe('FUNC003 - Các Kịch Bản Đăng Nhập Thành Công', () => {
    it('FUNC003.1 (Admin): Cho phép quản trị viên đăng nhập và chuyển hướng đến trang quản trị', async () => {
        await loginPage.navigateToLogin();
        await loginPage.login(adminUserAccount.email, adminUserAccount.password);
        
        await adminDashboardPage.waitForPageToLoad(15000);
        expect(await driver.getCurrentUrl()).toContain('/admin/dashboard');
        expect(await adminDashboardPage.isAdminWelcomeMessageDisplayed(7000)).toBe(true);
        
        const welcomeMsg = await adminDashboardPage.getAdminWelcomeMessage();
        expect(welcomeMsg).toMatch(new RegExp(`Xin chào, Quản trị viên ${adminUserAccount.email}|Welcome, Admin ${adminUserAccount.email}`, "i"));
    });

    it('FUNC003.2 (Người dùng thường): Cho phép người dùng thường đã có tài khoản đăng nhập và chuyển hướng đến trang chủ', async () => {
        await loginPage.navigateToLogin();
        await loginPage.login(normalUserAccount.email, normalUserAccount.password);

        await homePage.waitForPageToLoad(15000);
        expect(await homePage.isUserMenuButtonDisplayed(10000)).toBe(true);
        const displayedEmail = await homePage.getUserEmailFromDropdown();
        expect(displayedEmail).toContain(normalUserAccount.email);
    });

    it('FUNC003.3 (Người dùng mới đăng ký): Cho phép người dùng vừa đăng ký (từ FUNC001) đăng nhập', async () => {
        if (!newlyRegisteredUser.email) {
            console.log("FUNC003.3: Thông tin người dùng mới (newlyRegisteredUser.email) chưa có từ FUNC001. Đang đăng ký một user mới cho test này.");
            newlyRegisteredUser.email = generateRandomEmail('func003_3_reg');
            newlyRegisteredUser.password = 'newLoginPass123';
            await registerPage.navigateToRegister();
            await registerPage.register(newlyRegisteredUser.firstName, newlyRegisteredUser.lastName, newlyRegisteredUser.email, newlyRegisteredUser.password);
            await loginPage.isOnLoginPage(7000); 
        }
        
        console.log(`FUNC003.3: Thử đăng nhập với người dùng mới đăng ký: ${newlyRegisteredUser.email}`);
        await loginPage.navigateToLogin(); 
        await loginPage.login(newlyRegisteredUser.email, newlyRegisteredUser.password);

        await homePage.waitForPageToLoad(15000);
        expect(await homePage.isUserMenuButtonDisplayed(10000)).toBe(true);
        const displayedEmail = await homePage.getUserEmailFromDropdown();
        expect(displayedEmail).toContain(newlyRegisteredUser.email);
    });
  });

  // --- FUNC004: Đăng nhập thất bại với mật khẩu sai ---
  it('FUNC004: Hiển thị thông báo lỗi khi đăng nhập với mật khẩu không chính xác', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login(normalUserAccount.email, 'wrongInvalidPassword');
    
    const errorMessage = await loginPage.getErrorMessage(5000);
    expect(errorMessage).toBe("Thông tin đăng nhập không chính xác");
    expect(await driver.getCurrentUrl()).toContain('/login');
  });

  // --- FUNC005: Đăng xuất khỏi hệ thống ---
  it('FUNC005: Cho phép người dùng đã đăng nhập thực hiện đăng xuất thành công', async () => {
    // Bước 1: Đăng nhập
    await loginPage.navigateToLogin();
    await loginPage.login(normalUserAccount.email, normalUserAccount.password);
    await homePage.waitForPageToLoad(15000);
    expect(await homePage.isUserMenuButtonDisplayed(7000)).toBe(true);

    // Bước 2: Thực hiện đăng xuất (CẦN IMPLEMENT HomePage.logout())
    await homePage.logout(); 

    // Bước 3: Xác minh đã đăng xuất (ví dụ: chuyển về trang login)
    expect(await loginPage.isOnLoginPage(10000)).toBe(true);
    console.log("[FUNC005] Người dùng đã đăng xuất và được chuyển hướng về trang đăng nhập.");
  });


  // ========= CÁC TEST ĐIỀU HƯỚNG (Giữ lại, đổi tên cho nhất quán) =========
  describe('NAV - Kiểm Tra Điều Hướng', () => {
    it('NAV001: Điều hướng từ trang Đăng nhập sang trang Đăng ký', async () => {
        await loginPage.navigateToLogin();
        await loginPage.clickRegisterLink();
        expect(await registerPage.isOnRegisterPage(7000)).toBe(true);
    });

    it('NAV002: Điều hướng từ trang Đăng ký sang trang Đăng nhập', async () => {
        await registerPage.navigateToRegister();
        await registerPage.clickLoginLink();
        expect(await loginPage.isOnLoginPage(7000)).toBe(true); // Sửa lại: .toBe(true)
    });
  });
});