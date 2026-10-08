export const fragrances = [
  { name: 'NOIR', family: 'Woody · Amber', mood: 'Mysterious. Magnetic. Unforgettable.', color: 'studio-amber', notes: ['Bergamot', 'Iris', 'Amber'], story: 'The quiet intensity of midnight. Bright bergamot gives way to iris, settling into a warm amber embrace.' },
  { name: 'VELVET', family: 'Floral · Musk', mood: 'Soft. Intimate. Sensual.', color: 'studio-rose', notes: ['Pink Pepper', 'Rose', 'Musk'], story: 'A whisper of rose against skin. Delicate spice meets soft petals and the lingering warmth of musk.' },
  { name: 'AURA', family: 'Fresh · Aromatic', mood: 'Airy. Serene. Effortless.', color: 'studio-green', notes: ['Bergamot', 'Jasmine', 'Sandalwood'], story: 'A breath of stillness. Green brightness and jasmine unfold into a quietly grounding sandalwood trail.' },
  { name: 'ÉCLAT', family: 'Citrus · Floral', mood: 'Bright. Radiant. Alive.', color: 'studio-ivory', notes: ['Bergamot', 'Jasmine', 'Vanilla'], story: 'The golden hour, bottled. Sparkling citrus opens into radiant jasmine and a soft vanilla finish.' },
  { name: 'ABSOLU', family: 'Amber · Spiced', mood: 'Bold. Refined. Extraordinary.', color: 'studio-metal', notes: ['Pink Pepper', 'Iris', 'Vanilla'], story: 'Presence without a word. Pepper and iris meet an enveloping vanilla base in a composition of contrasts.' },
] as const;
export const lightModes = ['Midnight', 'Daylight', 'Sunset', 'Candlelight', 'Moonlight'] as const;
export type LightMode = typeof lightModes[number];
export const quizQuestions = [
  { title: 'What is your mood?', options: ['Mysterious', 'Confident', 'Romantic', 'Energetic', 'Calm'] },
  { title: 'Where does the moment take you?', options: ['Date Night', 'Office', 'Party', 'Everyday', 'Special Occasion'] },
  { title: 'Choose your atmosphere.', options: ['Midnight', 'Rain', 'Sunset', 'Forest', 'Ocean'] },
  { title: 'How much of a statement?', options: ['Soft', 'Balanced', 'Bold'] },
] as const;
export function matchScent(answers: string[]) {
  const scores: [number,number,number,number,number] = [0,0,0,0,0];
  const weights: Record<string, number[]> = {
    Mysterious:[4,1,0,0,2], Confident:[1,0,0,1,4], Romantic:[1,4,0,1,0], Energetic:[0,0,1,4,1], Calm:[0,1,4,1,0],
    'Date Night':[3,3,0,0,1], Office:[0,0,3,2,1], Party:[1,0,0,3,3], Everyday:[0,1,3,2,0], 'Special Occasion':[2,1,0,0,4],
    Midnight:[4,1,0,0,2], Rain:[1,2,3,0,0], Sunset:[1,2,0,4,0], Forest:[1,0,4,0,1], Ocean:[0,0,3,3,0],
    Soft:[0,3,3,1,0], Balanced:[2,1,2,2,1], Bold:[2,0,0,1,4],
  };
  answers.forEach(a => weights[a]?.forEach((n,i) => { if (i >= 0 && i < scores.length) scores[i as 0|1|2|3|4] += n; }));
  return scores.indexOf(Math.max(...scores));
}