// e2e-tests/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Quan trọng: phải là 'node' khi dùng globalSetup/Teardown kiểu này
  testTimeout: 90000,      // Timeout cho mỗi test case
  globalSetup: './src/config/globalSetup.ts', // Đường dẫn đến file globalSetup.ts
  globalTeardown: './src/config/globalTeardown.ts', // Đường dẫn đến file globalTeardown.ts
  // setupFilesAfterEnv: ['./src/setupTests.ts'], // Vẫn có thể dùng nếu cần setup sau môi trường
  verbose: true, // Bật verbose để xem log chi tiết hơn khi chạy test
  maxWorkers: 1, // <--- THÊM HOẶC SỬA DÒNG NÀY
};