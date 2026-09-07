// tests/checkin.spec.js - 打卡功能测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/checkin.html';

test.describe('健康打卡功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先设置登录状态
    await page.addInitScript(() => {
      localStorage.setItem('currentUser', JSON.stringify({ username: 'testuser', phone: '13800138000' }));
    });
    await page.goto(BASE_URL);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/健康打卡/);
  });

  test('打卡统计卡片显示', async ({ page }) => {
    await expect(page.locator('#statRing')).toBeVisible();
  });

  test('打卡表单字段显示', async ({ page }) => {
    await expect(page.locator('#bloodSugar')).toBeVisible();
    await expect(page.locator('#bloodSugar2h')).toBeVisible();
    await expect(page.locator('#dietToday')).toBeVisible();
    await expect(page.locator('#exerciseToday')).toBeVisible();
    await expect(page.locator('#weightToday')).toBeVisible();
    await expect(page.locator('#sleepToday')).toBeVisible();
  });

  test('打卡日历显示', async ({ page }) => {
    await expect(page.locator('#checkinCalendar')).toBeVisible();
  });

  test('AI分析按钮存在', async ({ page }) => {
    await expect(page.locator('#analyzeBtn')).toBeVisible();
  });

  test('提交打卡表单', async ({ page }) => {
    await page.locator('#bloodSugar').fill('5.6');
    await page.locator('#bloodSugar2h').fill('7.2');
    await page.locator('#weightToday').fill('68.5');
    await page.locator('#sleepToday').fill('7.5');
    await page.locator('#noteToday').fill('今天感觉良好');
    await page.getByText('完成今日打卡').click();
  });

  test('AI分析功能', async ({ page }) => {
    await page.locator('#analyzeBtn').click();
    await page.waitForTimeout(2500);
    await expect(page.locator('#analysisResult')).toBeVisible();
  });
});
