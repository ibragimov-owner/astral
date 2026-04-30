/**
 * FILE: src/constants/zodiac.ts
 * Astrology logic and constants for ASTRAL
 */

export interface ZodiacSign {
  id: string;
  name: string;
  uzName: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  symbol: string;
  dateRange: string;
  traits: string[];
  uzTraits: string[];
  rulingPlanet: string;
  compatibility: string[];
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: "aries",
    name: "Aries",
    uzName: "Qo'y",
    element: "Fire",
    symbol: "♈",
    dateRange: "Mar 21 - Apr 19",
    rulingPlanet: "Mars",
    traits: ["Bold", "Pioneering", "Energetic", "Optimistic"],
    uzTraits: ["Jasur", "Kashfiyotchi", "G'ayratli", "Optimist"],
    compatibility: ["Leo", "Sagittarius", "Gemini"],
  },
  {
    id: "taurus",
    name: "Taurus",
    uzName: "Buzoq",
    element: "Earth",
    symbol: "♉",
    dateRange: "Apr 20 - May 20",
    rulingPlanet: "Venus",
    traits: ["Dependable", "Musical", "Practical", "Strong"],
    uzTraits: ["Ishonchli", "Musiqiy", "Amaliyotchi", "Kuchli"],
    compatibility: ["Virgo", "Capricorn", "Cancer"],
  },
  {
    id: "gemini",
    name: "Gemini",
    uzName: "Egizaklar",
    element: "Air",
    symbol: "♊",
    dateRange: "May 21 - Jun 20",
    rulingPlanet: "Mercury",
    traits: ["Curious", "Adaptable", "Witty", "Social"],
    uzTraits: ["Qiziquvchan", "Moslashuvchan", "Zukkko", "Kirishimli"],
    compatibility: ["Libra", "Aquarius", "Aries"],
  },
  {
    id: "cancer",
    name: "Cancer",
    uzName: "Qisqichbaqa",
    element: "Water",
    symbol: "♋",
    dateRange: "Jun 21 - Jul 22",
    rulingPlanet: "Moon",
    traits: ["Intuitive", "Emotional", "Protective", "Loyal"],
    uzTraits: ["Intuitiv", "Hissiyotli", "Himoyachi", "Sodiq"],
    compatibility: ["Scorpio", "Pisces", "Taurus"],
  },
  {
    id: "leo",
    name: "Leo",
    uzName: "Arslon",
    element: "Fire",
    symbol: "♌",
    dateRange: "Jul 23 - Aug 22",
    rulingPlanet: "Sun",
    traits: ["Confident", "Charismatic", "Generous", "Fierce"],
    uzTraits: ["O'ziga ishongan", "Xarizmatik", "Saxiy", "Shiddatli"],
    compatibility: ["Aries", "Sagittarius", "Libra"],
  },
  {
    id: "virgo",
    name: "Virgo",
    uzName: "Parizod",
    element: "Earth",
    symbol: "♍",
    dateRange: "Aug 23 - Sep 22",
    rulingPlanet: "Mercury",
    traits: ["Analytical", "Modest", "Diligent", "Reliable"],
    uzTraits: ["Analitik", "Kamtar", "Mehnatsevar", "Ishonchli"],
    compatibility: ["Taurus", "Capricorn", "Scorpio"],
  },
  {
    id: "libra",
    name: "Libra",
    uzName: "Tarozi",
    element: "Air",
    symbol: "♎",
    dateRange: "Sep 23 - Oct 22",
    rulingPlanet: "Venus",
    traits: ["Diplomatic", "Fair", "Social", "Gracious"],
    uzTraits: ["Diplomatik", "Adolatli", "Kirishimli", "Xushmuomala"],
    compatibility: ["Gemini", "Aquarius", "Leo"],
  },
  {
    id: "scorpio",
    name: "Scorpio",
    uzName: "Chayon",
    element: "Water",
    symbol: "♏",
    dateRange: "Oct 23 - Nov 21",
    rulingPlanet: "Pluto",
    traits: ["Passionate", "resourceful", "brave", "determined"],
    uzTraits: ["Ehtirosli", "Tadbirkor", "Jasur", "Qat'iyatli"],
    compatibility: ["Cancer", "Pisces", "Virgo"],
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    uzName: "O'qotar",
    element: "Fire",
    symbol: "♐",
    dateRange: "Nov 22 - Dec 21",
    rulingPlanet: "Jupiter",
    traits: ["Generous", "Idealistic", "Funny", "Philosophical"],
    uzTraits: ["Saxiy", "Idealist", "Beg'ubor", "Falsafiy"],
    compatibility: ["Aries", "Leo", "Aquarius"],
  },
  {
    id: "capricorn",
    name: "Capricorn",
    uzName: "Tog' echkisi",
    element: "Earth",
    symbol: "♑",
    dateRange: "Dec 22 - Jan 19",
    rulingPlanet: "Saturn",
    traits: ["Responsible", "Disciplined", "Self-control", "Ambitious"],
    uzTraits: ["Mas'uliyatli", "Intizomli", "O'zini tuta biladigan", "Shuhratparast"],
    compatibility: ["Taurus", "Virgo", "Pisces"],
  },
  {
    id: "aquarius",
    name: "Aquarius",
    uzName: "Qovg'a",
    element: "Air",
    symbol: "♒",
    dateRange: "Jan 20 - Feb 18",
    rulingPlanet: "Uranus",
    traits: ["Progressive", "Original", "Independent", "Humanitarian"],
    uzTraits: ["Progressiv", "O'ziga xos", "Mustaqil", "Gumanitar"],
    compatibility: ["Gemini", "Libra", "Sagittarius"],
  },
  {
    id: "pisces",
    name: "Pisces",
    uzName: "Baliqlar",
    element: "Water",
    symbol: "♓",
    dateRange: "Feb 19 - Mar 20",
    rulingPlanet: "Neptune",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle"],
    uzTraits: ["Rahmdil", "Badiiy", "Intuitiv", "Muloyim"],
    compatibility: ["Scorpio", "Cancer", "Capricorn"],
  },
];

export function getZodiacSign(month: number, day: number): ZodiacSign {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11]; // Pisces
}
