import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4200"

test("user can create a new column", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page.getByText("Create New Column")).toBeVisible();

  await page.getByRole('button', { name: 'Create New Column' }).click()

  await expect(page.getByText("Create Column")).toBeVisible();

  await page.locator('input[matInput]').fill('New Column Test')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText("New Column Test")).toBeVisible();
});

test("user can edit an existing column", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByTestId('edit-column-2').click()

  await expect(page.getByText('Edit Column')).toBeVisible()

  await page.locator('input[matInput]').fill('Modified Column')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText("Modified Column")).toBeVisible();
});

test("user can add a new card", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByTestId('add-card-at-column-2').click()

  await expect(page.getByText('Create Card')).toBeVisible()

  await page.getByTestId('title-input').fill('New Card')

  await page.getByTestId('description-input').fill('Card Description')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText("New Card")).toBeVisible();
});

test("user can edit an existing card", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByTestId('edit-card-3-at-column-2').click()

  await expect(page.getByText('Edit Card')).toBeVisible()

  await page.getByTestId('title-input').fill('Modified Card')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText("Modified Card")).toBeVisible();
});

test("user can delete an existing card", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByTestId('delete-card-3-at-column-2').click()

  await expect(page.getByText("Modified Card")).toBeHidden();
});

test("user can delete an existing column", async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByTestId('delete-column-2').click()

  await expect(page.getByText("Modified Column")).toBeHidden();
});
