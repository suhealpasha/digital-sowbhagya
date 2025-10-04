export function getHinduLunarDayNumber(tithi, paksha) {
    const tithiMap = {
      Pratipada: 1,
      Dvitiya: 2,
      Tritiya: 3,
      Chaturthi: 4,
      Panchami: 5,
      Shashti: 6,
      Shasti: 6, // alt spelling
      Saptami: 7,
      Ashtami: 8,
      Navami: 9,
      Dashami: 10,
      Ekadashi: 11,
      Dwadashi: 12,
      Trayodashi: 13,
      Chaturdashi: 14,
      Purnima: 15,
      Amavasya: 15
    };
  
    const base = tithiMap[tithi];
    if (!base) return null;
  
    if (paksha.toLowerCase() === "shukla") {
      return base;
    } else if (paksha.toLowerCase() === "krishna") {
      return base + 15;
    } else {
      return null;
    }
  }