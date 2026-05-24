import type { SlotMachine, SlotManufacturer, SlotMachineType } from '@/types/domain';

const LW_GAMES = [
  'Dragon Link - Eastern Dragon', 'Dragon Link - Golden Century',
  'Dragon Link - Happy & Prosperous', 'Dragon Link - Autumn Moon',
  'Buffalo Gold Revolution', 'Buffalo Gold Collection',
  'Lightning Link - Sahara Gold', 'Lightning Link - Magic Pearl',
  'Lightning Link - Tiki Fire', 'Lock It Link - Diamond Peppers',
  'Lock It Link - Lotsa Loot', 'Lock It Link - Night Life',
  'Jin Ji Bao Xi - Endless Treasure', 'Prosperity Link - Mystic Pearls',
  'Wild Wild Nugget', 'Fu Nan Fu Nu', 'Dragon Cash',
  'Zhen Chan', 'Prosperous Rooster', 'Fortune Stacks',
];

const ARIS_GAMES = [
  'Buffalo', 'Buffalo Extreme', 'Buffalo Diamond',
  'Lightning Dollar Link', 'Dragon Emperor', 'Indian Dreaming',
  'Zorro', "Where's The Gold", 'Miss Kitty', 'Pompeii',
  'Queen of the Nile', 'Timber Wolf Deluxe', 'More Chilli',
  'Dragon Shrine', 'Sun & Moon', 'Arctic Wolf',
  'Cash Express Luxury Line', 'Lightning Cash - On Fire',
  'Wild Stallion', 'Jackpot Gold',
];

const IGT_GAMES = [
  'Wheel of Fortune', 'Wheel of Fortune On Tour',
  'Double Diamond', 'Triple Double Diamond',
  'Cleopatra', 'Cleopatra II', 'Wolf Run', 'Coyote Moon',
  'Da Vinci Diamonds', 'Siberian Storm', 'Red Jewels',
  'Triple Red Hot 7s', 'Kitty Glitter', 'Gold Fish',
  "Pharaoh's Fortune", 'Fortune Coin', 'Mystical Unicorn',
  'Cash Fall', 'Triple Cash Wheel', 'Star Wars',
];

const KON_GAMES = [
  'China Shores', 'Lotus Land', 'Sugarland Sweets',
  'African Diamond', 'Gold Stacks 88', 'China Mystery',
  'Fortune Teller', 'Lucky 88', 'Toro', 'Chili Chili Fire',
  'Boom', "Dragon's Way", 'Bao Zhu Zhao Fu', 'Handpay Heroes',
];

const EVR_GAMES = [
  'Timberwolf', 'Money Burst', 'Lucky Buddha',
  'Happy & Prosperous', 'Cash Spin', 'Black Rhino',
  'Fortune Totem', 'Magic Lamp', 'Gold on the Bayou',
  'Super Times Pay', 'Fu Dao Le', 'Carnival of Coins',
];

type MfrConfig = { name: SlotManufacturer; count: number; games: string[] };
const CONFIGS: MfrConfig[] = [
  { name: 'Light & Wonder', count: 82, games: LW_GAMES },
  { name: 'Aristocrat',     count: 71, games: ARIS_GAMES },
  { name: 'IGT',            count: 58, games: IGT_GAMES },
  { name: 'Konami',         count: 42, games: KON_GAMES },
  { name: 'Everi',          count: 32, games: EVR_GAMES },
];

const EASY_MIN = [0.50, 0.75, 1.00];
const MULTI_MIN = [0.01, 0.02, 0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40];
const EASY_MAX01 = [7.50, 10.00, 15.00, 20.00];
const MULTI_MAX01 = [1.00, 1.50, 2.00, 2.50, 3.00, 4.00, 5.00];

function generateMachines(): SlotMachine[] {
  const result: SlotMachine[] = [];
  let bank = 1;
  let pos = 1;
  let gIdx = 0;

  for (const cfg of CONFIGS) {
    for (let i = 0; i < cfg.count; i++) {
      const isBase5  = gIdx >= 276 && gIdx < 284;
      const isBase25 = gIdx === 284;
      const isMultiDeno = !isBase5 && !isBase25 && gIdx % 7 === 0;
      const deno = isBase5 ? '0.05' : isBase25 ? '0.25' : isMultiDeno ? '01/02/05/10' : '0.01';

      const type: SlotMachineType = gIdx % 2 === 0 ? 'Easy Bet' : 'Multi Line';

      let minBet: number;
      if (isBase25)      minBet = 1.25;
      else if (isBase5)  minBet = type === 'Easy Bet' ? 2.50 : 0.50;
      else if (type === 'Easy Bet') minBet = EASY_MIN[i % EASY_MIN.length];
      else               minBet = MULTI_MIN[i % MULTI_MIN.length];

      let maxBet01: number | null = null;
      let maxBet02: number | null = null;
      let maxBet05: number | null = null;
      let maxBet10: number | null = null;

      if (!isBase25) {
        if (isBase5) {
          maxBet05 = type === 'Easy Bet' ? 12.50 : 5.00;
        } else {
          const primary = type === 'Easy Bet'
            ? EASY_MAX01[i % EASY_MAX01.length]
            : MULTI_MAX01[i % MULTI_MAX01.length];
          maxBet01 = primary;
          if (isMultiDeno) {
            maxBet02 = +(primary * 2).toFixed(2);
            maxBet05 = +(primary * 5).toFixed(2);
            maxBet10 = +(primary * 10).toFixed(2);
          }
        }
      }

      if (pos > 6) { pos = 1; bank++; }
      const location = `${String(bank).padStart(2, '0')}-${String(pos).padStart(2, '0')}`;
      pos++;

      result.push({
        id: String(2001 + gIdx),
        location,
        game: cfg.games[i % cfg.games.length],
        manufacturer: cfg.name,
        type,
        minBet,
        multiDeno: isMultiDeno,
        denomination: deno,
        maxBet01,
        maxBet02,
        maxBet05,
        maxBet10,
        active: true,
      });
      gIdx++;
    }
  }
  return result;
}

export const seedSlotMachines: SlotMachine[] = generateMachines();
