import { translateToCorporate } from './SarvamAIService';

// Mock fetch globally
global.fetch = jest.fn();

// Store original env
const originalEnv = process.env;

describe('SarvamAIService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, REACT_APP_SARVAM_API_KEY: 'test-api-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('translateToCorporate', () => {
        describe('Input Validation', () => {
            it('should reject empty input', async () => {
                const result = await translateToCorporate('');
                expect(result.success).toBe(false);
                expect(result.error).toMatch(/enter some text/i);
            });

            it('should reject whitespace-only input', async () => {
                const result = await translateToCorporate('   ');
                expect(result.success).toBe(false);
                expect(result.error).toMatch(/enter some text/i);
            });

            it('should reject null input', async () => {
                const result = await translateToCorporate(null);
                expect(result.success).toBe(false);
            });

            it('should reject undefined input', async () => {
                const result = await translateToCorporate(undefined);
                expect(result.success).toBe(false);
            });
        });

        describe('API Key Validation', () => {
            it('should fail when API key not set', async () => {
                delete process.env.REACT_APP_SARVAM_API_KEY;

                // Need to re-import to get fresh module
                jest.resetModules();
                const { translateToCorporate: freshTranslate } = require('./SarvamAIService');

                const result = await freshTranslate('test input');
                expect(result.success).toBe(false);
                expect(result.error).toMatch(/API key not configured/i);
            });
        });

        describe('Successful Translation', () => {
            it('should translate text successfully', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Professional output text' } }]
                    })
                });

                const result = await translateToCorporate('yaar help kardo', 'formal', 'email');

                expect(result.success).toBe(true);
                expect(result.result).toBe('Professional output text');
            });

            it('should use correct API endpoint', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                await translateToCorporate('test', 'formal', 'email');

                expect(global.fetch).toHaveBeenCalledWith(
                    'https://api.sarvam.ai/v1/chat/completions',
                    expect.any(Object)
                );
            });

            it('should include API key in headers', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                await translateToCorporate('test', 'formal', 'email');

                const fetchCall = global.fetch.mock.calls[0];
                expect(fetchCall[1].headers['api-subscription-key']).toBe('test-api-key');
            });
        });

        describe('Tone Handling', () => {
            it('should default to formal tone', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                await translateToCorporate('test');

                const fetchCall = global.fetch.mock.calls[0];
                const body = JSON.parse(fetchCall[1].body);
                expect(body.messages[0].content).toContain('Formal');
            });
        });

        describe('Channel Handling', () => {
            it('should default to email channel', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                await translateToCorporate('test');

                const fetchCall = global.fetch.mock.calls[0];
                const body = JSON.parse(fetchCall[1].body);
                expect(body.messages[0].content).toContain('Email');
            });
        });

        describe('Org Slangs Integration', () => {
            it('should include org slangs in prompt', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                const orgSlangs = [
                    { slang: 'ship it', meaning: 'deploy to production' },
                    { slang: 'standup', meaning: 'daily sync meeting' }
                ];

                await translateToCorporate('test', 'formal', 'email', orgSlangs);

                const fetchCall = global.fetch.mock.calls[0];
                const body = JSON.parse(fetchCall[1].body);
                expect(body.messages[0].content).toContain('ship it');
                expect(body.messages[0].content).toContain('deploy to production');
                expect(body.messages[0].content).toContain('Company-specific slangs');
            });

            it('should handle empty org slangs', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Output' } }]
                    })
                });

                await translateToCorporate('test', 'formal', 'email', []);

                expect(global.fetch).toHaveBeenCalled();
            });
        });

        describe('Error Handling', () => {
            it('should handle 403 error', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    json: async () => ({})
                });

                const result = await translateToCorporate('test');

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/Invalid API key/i);
            });

            it('should handle 429 rate limit error', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: false,
                    status: 429,
                    json: async () => ({})
                });

                const result = await translateToCorporate('test');

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/Rate limit/i);
            });

            it('should handle network error', async () => {
                global.fetch.mockRejectedValueOnce(new Error('Network error'));

                const result = await translateToCorporate('test');

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/Network error/i);
            });

            it('should handle malformed API response', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({})
                });

                const result = await translateToCorporate('test');

                expect(result.success).toBe(false);
            });

            it('should handle API error message', async () => {
                global.fetch.mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    json: async () => ({ error: 'Internal server error' })
                });

                const result = await translateToCorporate('test');

                expect(result.success).toBe(false);
                expect(result.error).toMatch(/Internal server error/i);
            });
        });
    });
});
