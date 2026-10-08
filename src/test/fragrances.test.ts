import { describe, expect, it } from 'vitest';
import { matchScent, fragrances } from '@/lib/fragrances';
describe('Fragrance matching',()=>{
  it('matches a mysterious midnight mood to Noir',()=>{expect(matchScent(['Mysterious','Date Night','Midnight','Balanced'])).toBe(0);});
  it('matches calm forest moments to Aura',()=>{expect(matchScent(['Calm','Everyday','Forest','Soft'])).toBe(2);});
  it('matches bold special occasions to Absolu',()=>{expect(matchScent(['Confident','Special Occasion','Midnight','Bold'])).toBe(4);});
  it('always returns a collection index',()=>{expect(fragrances[matchScent([])]).toBeDefined();});
});