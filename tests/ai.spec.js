// tests/ai.spec.js - 智能助手测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/ai.html';

test.describe('AI智能助手测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/智能助手/);
  });

  test('欢迎界面显示', async ({ page }) => {
    await expect(page.locator('#welcomeScreen')).toBeVisible();
    await expect(page.getByText('糖尿病智能助手')).toBeVisible();
  });

  test('功能卡片显示', async ({ page }) => {
    const cards = page.locator('.capability-card');
    await expect(cards).toHaveCount(4);
  });

  test('侧边栏显示', async ({ page }) => {
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.getByText('新建对话')).toBeVisible();
  });

  test('快捷问题按钮', async ({ page }) => {
    const quickActions = page.locator('.quick-action');
    await expect(quickActions).toHaveCount(5);
  });

  test('发送消息功能', async ({ page }) => {
    await page.locator('#chatInput').fill('血糖多少算正常？');
    await page.getByText('发送').click();
    await page.waitForTimeout(2000);
    const messages = page.locator('.message');
    await expect(messages.length).toBeGreaterThan(0);
  });

  test('快捷提问功能', async ({ page }) => {
    await page.getByText('血糖正常值').click();
    await page.waitForTimeout(2000);
  });

  test('功能卡片点击提问', async ({ page }) => {
    await page.getByText('风险评估').first().click();
    await page.waitForTimeout(2000);
  });

  test('智能体能力说明显示', async ({ page }) => {
    await expect(page.getByText('智能体能力')).toBeVisible();
  });
});
