// tests/doctor.spec.js - 医师咨询测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/doctor.html';

test.describe('医师咨询功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/医师咨询/);
  });

  test('医师列表显示', async ({ page }) => {
    await expect(page.locator('#doctorList')).toBeVisible();
    const doctors = page.locator('.doctor-item');
    await expect(doctors).toHaveCount(4);
  });

  test('聊天区域初始状态', async ({ page }) => {
    await expect(page.locator('.chat-container')).toBeVisible();
    await expect(page.getByText('请选择一位医师')).toBeVisible();
  });

  test('选择医师后开始对话', async ({ page }) => {
    await page.locator('.doctor-item').first().click();
    await expect(page.locator('#chatDoctorName')).not.toContainText('请选择医师');
  });

  test('发送消息功能', async ({ page }) => {
    await page.locator('.doctor-item').first().click();
    await page.waitForTimeout(500);
    await page.locator('#chatInput').fill('血糖多少算正常？');
    await page.getByText('发送').click();
    await page.waitForTimeout(2000);
    const messages = page.locator('.message');
    await expect(messages.length).toBeGreaterThan(0);
  });

  test('快捷问题功能', async ({ page }) => {
    await page.locator('.doctor-item').first().click();
    await page.waitForTimeout(800);
    await page.getByText('血糖多少算正常？').first().click();
    await page.waitForTimeout(2000);
  });

  test('咨询提示显示', async ({ page }) => {
    await expect(page.getByText('咨询提示')).toBeVisible();
  });
});
