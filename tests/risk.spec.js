// tests/risk.spec.js - 风险评估测试
const { test, expect } = require('@playwright/test');

const BASE_URL = 'file://' + __dirname.replace(/\\/g, '/').replace('/tests', '') + '/risk.html';

test.describe('糖尿病风险评估测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('页面标题正确', async ({ page }) => {
    await expect(page).toHaveTitle(/糖尿病风险预测/);
  });

  test('步骤指示器显示', async ({ page }) => {
    await expect(page.locator('.step-indicator')).toBeVisible();
    const dots = page.locator('.step-dot');
    await expect(dots).toHaveCount(3);
  });

  test('第一步表单字段显示', async ({ page }) => {
    await expect(page.locator('#age')).toBeVisible();
    await expect(page.locator('#gender')).toBeVisible();
    await expect(page.locator('#height')).toBeVisible();
    await expect(page.locator('#weight')).toBeVisible();
    await expect(page.locator('#familyHistory')).toBeVisible();
  });

  test('未填写必填项点击下一步提示', async ({ page }) => {
    await page.getByText('下一步').first().click();
    // 应该停留在当前页
    await expect(page.locator('#page1')).toBeVisible();
  });

  test('填写第一步后进入第二步', async ({ page }) => {
    await page.locator('#age').fill('45');
    await page.locator('#gender').selectOption('male');
    await page.locator('#height').fill('170');
    await page.locator('#weight').fill('75');
    await page.getByText('下一步').first().click();
    await expect(page.locator('#page2')).toBeVisible();
  });

  test('第二步表单字段显示', async ({ page }) => {
    await page.locator('#age').fill('45');
    await page.locator('#gender').selectOption('male');
    await page.locator('#height').fill('170');
    await page.locator('#weight').fill('75');
    await page.getByText('下一步').first().click();
    await expect(page.locator('#bloodPressure')).toBeVisible();
    await expect(page.locator('#exercise')).toBeVisible();
    await expect(page.locator('#diet')).toBeVisible();
    await expect(page.locator('#smoking')).toBeVisible();
  });

  test('完整流程提交评估', async ({ page }) => {
    // 第一步
    await page.locator('#age').fill('50');
    await page.locator('#gender').selectOption('male');
    await page.locator('#height').fill('172');
    await page.locator('#weight').fill('80');
    await page.getByText('下一步').first().click();
    
    // 第二步
    await page.locator('#bloodPressure').selectOption('high');
    await page.locator('#exercise').selectOption('rare');
    await page.locator('#diet').selectOption('unhealthy');
    await page.locator('#smoking').selectOption('yes');
    await page.getByText('下一步').nth(1).click();
    
    // 第三步确认
    await expect(page.locator('#confirmInfo')).toBeVisible();
    await page.locator('#submitBtn').click();
    
    // 等待结果
    await page.waitForTimeout(2500);
    await expect(page.locator('#resultArea')).toBeVisible();
  });

  test('评估结果显示风险等级', async ({ page }) => {
    await page.locator('#age').fill('50');
    await page.locator('#gender').selectOption('male');
    await page.locator('#height').fill('172');
    await page.locator('#weight').fill('80');
    await page.getByText('下一步').first().click();
    await page.getByText('下一步').nth(1).click();
    await page.locator('#submitBtn').click();
    await page.waitForTimeout(2500);
    await expect(page.locator('#resultLevel')).toBeVisible();
  });
});
