import { config } from '@/constants/config';

describe('Config - Legal URLs (Story 7.4)', () => {
  it('has privacy policy URL defined', () => {
    expect(config.privacyPolicyUrl).toBeDefined();
    expect(config.privacyPolicyUrl).toBe('https://safar.app/privacy');
  });

  it('has terms of service URL defined', () => {
    expect(config.termsOfServiceUrl).toBeDefined();
    expect(config.termsOfServiceUrl).toBe('https://safar.app/terms');
  });

  it('has support email defined', () => {
    expect(config.supportEmail).toBeDefined();
    expect(config.supportEmail).toBe('support@safar.app');
  });

  it('legal URLs use HTTPS', () => {
    expect(config.privacyPolicyUrl).toMatch(/^https:\/\//);
    expect(config.termsOfServiceUrl).toMatch(/^https:\/\//);
  });
});
