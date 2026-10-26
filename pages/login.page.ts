import { expect, Locator, Page, test } from '@playwright/test';
import BasePage from './basePage.page';

export default class LoginPage extends BasePage {
  private loginForm: {
    emailInput: Locator;
    passwordInput: Locator;
    submitButton: Locator;
    loginError: Locator;
    emailError: Locator;
    passwordError: Locator;
  };

  constructor(page: Page) {
    super(page);
    this.loginForm = {
      emailInput: page.getByTestId('email'),
      passwordInput: page.getByTestId('password'),
      submitButton: page.getByTestId('login-submit'),
      loginError: page.getByTestId('login-error'),
      emailError: page.getByTestId('email-error'),
      passwordError: page.getByTestId('password-error'),
    };
  }

  async navigate(): Promise<void> {
    await this.open('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await test.step(`Log in as "${email || '<empty>'}"`, async () => {
      await this.loginForm.emailInput.fill(email);
      await this.loginForm.passwordInput.fill(password);
      await this.loginForm.submitButton.click();
    });
  }

  async verifyLoginError(text: string): Promise<void> {
    await test.step(`Verify login error "${text}"`, async () => {
      await expect(this.loginForm.loginError).toContainText(text);
      await expect(this.page).toHaveURL(/\/auth\/login/);
    });
  }

  async verifyRequiredFieldErrors(): Promise<void> {
    await test.step('Verify email and password are required', async () => {
      await expect(this.loginForm.emailError).toContainText('Email is required');
      await expect(this.loginForm.passwordError).toContainText('Password is required');
    });
  }

  async verifyLoginFormVisible(): Promise<void> {
    await test.step('Verify the login form is shown', async () => {
      await expect(this.page).toHaveURL(/\/auth\/login/);
      await expect(this.loginForm.submitButton).toBeVisible();
    });
  }
}
