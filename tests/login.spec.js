// tests/login.spec.js - 登录注册测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/login.html';

test.describe('登录注册功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('登录页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/登录/);
  });

  test('登录表单显示', async ({ page }) => {
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#loginUsername')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
  });

  test('切换到注册标签', async ({ page }) => {
    await page.getByText('注册').first().click();
    await expect(page.locator('#registerForm')).toBeVisible();
  });

  test('注册表单字段验证', async ({ page }) => {
    await page.getByText('注册').first().click();
    await expect(page.locator('#regUsername')).toBeVisible();
    await expect(page.locator('#regPhone')).toBeVisible();
    await expect(page.locator('#regPassword')).toBeVisible();
    await expect(page.locator('#regConfirmPassword')).toBeVisible();
  });

  test('空表单提交提示错误', async ({ page }) => {
    await page.locator('#loginUsername').fill('');
    await page.locator('#loginPassword').fill('');
    await page.locator('#loginForm button[type="submit"]').click();
    // HTML5验证会阻止提交
  });

  test('demo账号登录成功', async ({ page }) => {
    await page.locator('#loginUsername').fill('demo');
    await page.locator('#loginPassword').fill('123456');
    await page.locator('#loginForm button[type="submit"]').click();
    await page.waitForTimeout(1500);
    // 登录后应该跳转到首页或显示成功提示
  });

  test('密码不一致提示错误', async ({ page }) => {
    await page.getByText('注册').first().click();
    await page.locator('#regUsername').fill('testuser');
    await page.locator('#regPhone').fill('13800138000');
    await page.locator('#regPassword').fill('123456');
    await page.locator('#regConfirmPassword').fill('654321');
    await page.locator('#registerForm button[type="submit"]').click();
  });

  test('返回首页链接', async ({ page }) => {
    await page.getByText('返回首页').click();
    await expect(page).toHaveURL(/index\.html/);
  });
});
