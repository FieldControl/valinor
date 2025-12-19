import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should switch to register mode', async ({ page }) => {
    // Find and click the toggle button
    const toggleButton = page.locator('button:has-text("Registrar")').first();
    await toggleButton.click();
    
    // Verify register mode is active
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    // Switch to register mode
    await page.locator('button:has-text("Registrar")').first().click();
    
    // Fill registration form
    await page.fill('input[name="name"]', 'E2E Test User');
    await page.fill('input[name="email"]', `e2e-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should switch back to login mode after successful registration
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    const uniqueEmail = `login-test-${Date.now()}@test.com`;
    
    await page.locator('button:has-text("Registrar")').first().click();
    await page.fill('input[name="name"]', 'Login Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for switch to login mode
    await page.waitForTimeout(1000);
    
    // Now login
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should navigate to board page
    await expect(page).toHaveURL(/.*board/, { timeout: 10000 });
  });
});

test.describe('Board Management', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login first
    await page.goto('/');
    const uniqueEmail = `board-test-${Date.now()}@test.com`;
    
    // Register
    await page.locator('button:has-text("Registrar")').first().click();
    await page.fill('input[name="name"]', 'Board Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Login
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*board/, { timeout: 10000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create a new board', async () => {
    // Click create board button
    const createButton = page.locator('button:has-text("Criar Board")').first();
    await createButton.click();
    
    // Fill board name
    await page.fill('input[placeholder*="board" i]', 'E2E Test Board');
    
    // Submit
    await page.click('button:has-text("Criar")');
    
    // Verify board appears in the list
    await expect(page.locator('text=E2E Test Board')).toBeVisible({ timeout: 5000 });
  });

  test('should select a board', async () => {
    // Click on a board
    const boardItem = page.locator('.board-item').first();
    await boardItem.click();
    
    // Verify board content is displayed
    await expect(page.locator('.board-content')).toBeVisible({ timeout: 5000 });
  });

  test('should create a column', async () => {
    // Ensure a board is selected
    const boardItem = page.locator('.board-item').first();
    await boardItem.click();
    
    // Click create column button
    await page.click('button:has-text("Nova Coluna")');
    
    // Fill column name
    await page.fill('input[placeholder*="coluna" i]', 'To Do');
    
    // Submit
    await page.click('button:has-text("Criar")');
    
    // Verify column appears
    await expect(page.locator('text=To Do')).toBeVisible({ timeout: 5000 });
  });

  test('should create a card in a column', async () => {
    // Find the "Add Card" button in the first column
    const addCardButton = page.locator('button:has-text("Adicionar Card")').first();
    await addCardButton.click();
    
    // Fill card details
    await page.fill('input[name="cardName"]', 'E2E Test Card');
    await page.fill('textarea[name="cardDescription"]', 'This is a test card');
    
    // Submit
    await page.click('button:has-text("Criar")');
    
    // Verify card appears
    await expect(page.locator('text=E2E Test Card')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Card Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login process
    await page.goto('/');
    const uniqueEmail = `card-test-${Date.now()}@test.com`;
    
    await page.locator('button:has-text("Registrar")').first().click();
    await page.fill('input[name="name"]', 'Card Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*board/, { timeout: 10000 });
  });

  test('should edit a card', async ({ page }) => {
    // Create a board and column first
    await page.click('button:has-text("Criar Board")');
    await page.fill('input[placeholder*="board" i]', 'Edit Test Board');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Nova Coluna")');
    await page.fill('input[placeholder*="coluna" i]', 'Test Column');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Create a card
    await page.locator('button:has-text("Adicionar Card")').first().click();
    await page.fill('input[name="cardName"]', 'Original Card Name');
    await page.fill('textarea[name="cardDescription"]', 'Original description');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Edit the card
    await page.locator('.card').first().click();
    await page.click('button:has-text("Editar")');
    
    await page.fill('input[name="editCardName"]', 'Updated Card Name');
    await page.click('button:has-text("Salvar")');
    
    // Verify updated name
    await expect(page.locator('text=Updated Card Name')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a card', async ({ page }) => {
    // Create a board, column, and card
    await page.click('button:has-text("Criar Board")');
    await page.fill('input[placeholder*="board" i]', 'Delete Test Board');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Nova Coluna")');
    await page.fill('input[placeholder*="coluna" i]', 'Test Column');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Adicionar Card")').first().click();
    await page.fill('input[name="cardName"]', 'Card to Delete');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Delete the card
    await page.locator('.card').first().hover();
    await page.click('button:has-text("Deletar")');
    await page.click('button:has-text("Confirmar")');
    
    // Verify card is removed
    await expect(page.locator('text=Card to Delete')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Drag and Drop', () => {
  test('should move card between columns', async ({ page }) => {
    // Login
    await page.goto('/');
    const uniqueEmail = `drag-test-${Date.now()}@test.com`;
    
    await page.locator('button:has-text("Registrar")').first().click();
    await page.fill('input[name="name"]', 'Drag Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*board/, { timeout: 10000 });
    
    // Create board
    await page.click('button:has-text("Criar Board")');
    await page.fill('input[placeholder*="board" i]', 'Drag Test Board');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Create two columns
    await page.click('button:has-text("Nova Coluna")');
    await page.fill('input[placeholder*="coluna" i]', 'Column 1');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Nova Coluna")');
    await page.fill('input[placeholder*="coluna" i]', 'Column 2');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Create a card in first column
    await page.locator('button:has-text("Adicionar Card")').first().click();
    await page.fill('input[name="cardName"]', 'Draggable Card');
    await page.click('button:has-text("Criar")');
    await page.waitForTimeout(1000);
    
    // Drag card to second column
    const card = page.locator('.card:has-text("Draggable Card")');
    const targetColumn = page.locator('.column').nth(1);
    
    await card.dragTo(targetColumn);
    await page.waitForTimeout(2000);
    
    // Verify card moved
    const secondColumn = page.locator('.column').nth(1);
    await expect(secondColumn.locator('text=Draggable Card')).toBeVisible({ timeout: 5000 });
  });
});
