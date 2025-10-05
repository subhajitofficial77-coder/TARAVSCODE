import { buildCarouselPrompt } from '../lib/prompts/content-prompts';

describe('buildCarouselPrompt', () => {
  it('includes emotional context and daily plan in the prompt', () => {
    const req = { contentType: 'carousel', platform: 'instagram', theme: 'test', userPrompt: 'hello' } as any;
    const emotionalContext = { primary_emotions: { joy: 0.7, trust: 0.3 }, mood: { optimism: 0.8 } } as any;
    const dailyPlan = ['Mother-daughter relationships', 'Self improvement'];
    const weather = { condition: 'clear', temp_c: 20 } as any;

    const p = buildCarouselPrompt(req, emotionalContext, dailyPlan, weather, 'A small event');
    expect(p.prompt).toContain('Current emotional context');
    expect(p.prompt).toContain('Daily plan topics');
    expect(p.prompt).toContain('Weather');
  });
});
