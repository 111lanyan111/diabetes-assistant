// tests/index.spec.js - 首页测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/index.html';

test.describe('首页功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/糖尿病预治智能助手/);
  });

  test('导航栏显示正确', async ({ page }) => {
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.logo')).toContainText('糖尿病预治智能助手');
  });

  test('轮播图正常显示', async ({ page }) => {
    await expect(page.locator('.carousel')).toBeVisible();
    const slides = page.locator('.carousel-slide');
    await expect(slides).toHaveCount(3);
  });

  test('功能模块入口存在', async ({ page }) => {
    await expect(page.getByText('风险预测')).toBeVisible();
    await expect(page.getByText('生活方案')).toBeVisible();
    await expect(page.getByText('医师咨询')).toBeVisible();
    await expect(page.getByText('智能助手')).toBeVisible();
  });

  test('统计数据卡片显示', async ({ page }) => {
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4);
  });

  test('健康资讯列表显示', async ({ page }) => {
    await expect(page.locator('#newsList')).toBeVisible();
  });

  test('点击风险预测跳转', async ({ page }) => {
    await page.getByText('风险预测').first().click();
    await expect(page).toHaveURL(/risk\.html/);
  });

  test('页脚显示正确', async ({ page }) => {
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('.footer')).toContainText('DeepSeek');
  });
});
