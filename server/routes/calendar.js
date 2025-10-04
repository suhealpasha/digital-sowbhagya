const express = require("express");
const axios = require("axios");
const router = express.Router();
const verifyToken = require("./token-verify");
require("dotenv").config();

const { MhahPanchang } = require("mhah-panchang");

const urduWeekdays = {
  Sunday: "اتوار",
  Monday: "پیر",
  Tuesday: "منگل",
  Wednesday: "بدھ",
  Thursday: "جمعرات",
  Friday: "جمعہ",
  Saturday: "ہفتہ",
};

const urduMonths = {
  Muharram: "محرم",
  Safar: "صفر",
  "Rabi al-awwal": "ربیع الاول",
  "Rabi al-thani": "ربیع الثانی",
  "Jumada al-awwal": "جمادی الاول",
  "Jumada al-thani": "جمادی الثانی",
  Rajab: "رجب",
  "Sha'ban": "شعبان",
  Ramadan: "رمضان",
  Shawwal: "شوال",
  "Dhu al-Qadah": "ذوالقعدہ",
  "Dhu al-Hijjah": "ذوالحجہ",
};

const arabicToUrduWeekdays = {
  الأحد: "اتوار",
  الإثنين: "پیر",
  الثلاثاء: "منگل",
  الأربعاء: "بدھ",
  الخميس: "جمعرات",
  الجمعة: "جمعہ",
  السبت: "ہفتہ",
};

const panchang = new MhahPanchang();
const BANGALORE_LAT = 12.9716;
const BANGALORE_LNG = 77.5946;

function isGoodMarriageDay(calendar) {
  const goodTithis = [
    "Dvitiya",
    "Tritiya",
    "Panchami",
    "Saptami",
    "Dashami",
    "Ekadashi",
    "Dwadashi",
    "Trayodashi",
  ];
  const badYogas = ["Vyatipata", "Vaidhriti"];
  const badNakshatras = ["Ashlesha", "Magha", "Mula", "Jyeshtha", "Revati"];

  const tithi = calendar.Tithi?.name_en_IN;
  const yoga = calendar.Yoga?.name_en_IN;
  const nakshatra = calendar.Nakshatra?.name_en_IN;

  return (
    tithi &&
    goodTithis.includes(tithi) &&
    !badYogas.includes(yoga) &&
    !badNakshatras.includes(nakshatra)
  );
}

router.get("/panchang", (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const calendar = panchang.calendar(date, BANGALORE_LAT, BANGALORE_LNG);

  res.json({
    city: "Bangalore",
    location: {
      latitude: BANGALORE_LAT,
      longitude: BANGALORE_LNG,
    },
    date,
    calendar,
  });
});

router.get("/marriage-dates", verifyToken, async (req, res) => {
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const results = [];
  const currentDate = new Date(today);

  while (currentDate <= oneYearLater) {
    const calendar = panchang.calendar(
      new Date(currentDate),
      BANGALORE_LAT,
      BANGALORE_LNG
    );

    if (isGoodMarriageDay(calendar)) {
      results.push({
        date: currentDate.toISOString().split("T")[0],
        tithi: calendar.Tithi?.name_en_IN,
        nakshatra: calendar.Nakshatra?.name_en_IN,
        yoga: calendar.Yoga?.name_en_IN,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.json({
    city: "Bangalore",
    total: results.length,
    goodMarriageDates: results,
  });
});

function translateToKannada(panchang) {
  return {
    ದಿನಾಂಕ: new Date().toLocaleDateString("kn-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    ತಿಥಿ: panchang.Tithi?.name_kn_IN || panchang.Tithi?.name_en_IN || "",
    ಪಾಕ್ಷಿಕ: panchang.Paksha?.name_kn_IN || panchang.Paksha?.name_en_IN || "",
    ನಕ್ಷತ್ರ:
      panchang.Nakshatra?.name_kn_IN || panchang.Nakshatra?.name_en_IN || "",
    ಯೋಗ: panchang.Yoga?.name_kn_IN || panchang.Yoga?.name_en_IN || "",
    ಕರ್ಣ: panchang.Karna?.name_kn_IN || panchang.Karna?.name_en_IN || "",
    ಮಾಸ: panchang.Masa?.name_kn_IN || panchang.Masa?.name_en_IN || "",
    ಚಂದ್ರಮಾಸ:
      panchang.MoonMasa?.name_kn_IN || panchang.MoonMasa?.name_en_IN || "",
    ಚಂದ್ರರಾಶಿ: panchang.Raasi?.name_kn_IN || panchang.Raasi?.name_en_IN || "",
    ಋತು: panchang.Ritu?.name_kn_IN || panchang.Ritu?.name_en_IN || "",
    ಗುಣ: panchang.Guna?.name_kn_IN || panchang.Guna?.name_en_IN || "",
    ಗಣ: panchang.Gana?.name_kn_IN || panchang.Gana?.name_en_IN || "",
    ತ್ರಿಮೂರ್ತಿ:
      panchang.Trinity?.name_kn_IN || panchang.Trinity?.name_en_IN || "",
  };
}

router.get("/hindu-calendar", verifyToken, async (req, res) => {
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const yearlyCalendar = [];
  const currentDate = new Date(today);

  while (currentDate <= oneYearLater) {
    try {
      const calendar = panchang.calendar(
        new Date(currentDate),
        BANGALORE_LAT,
        BANGALORE_LNG
      );
      const kannadaCalendar = translateToKannada(calendar);

      yearlyCalendar.push({
        date: currentDate.toISOString().split("T")[0],
        kannada: kannadaCalendar,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    } catch (err) {
      console.error(
        `Error on ${currentDate.toISOString().split("T")[0]}:`,
        err.message
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  res.json({
    city: "ಬೆಂಗಳೂರು",
    from: today.toISOString().split("T")[0],
    to: oneYearLater.toISOString().split("T")[0],
    totalDays: yearlyCalendar.length,
    calendar: yearlyCalendar,
  });
});

router.get("/hijri-calendar", verifyToken, async (req, res) => {
  const latitude = 12.9716;
  const longitude = 77.5946;
  const method = 5;

  const today = new Date();
  const hijriCalendar = [];

  try {
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const response = await axios.get(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`,
        {
          params: {
            latitude,
            longitude,
            method,
          },
        }
      );

      const monthData = response.data?.data?.map((entry) => {
        const weekdayEn = entry.hijri.weekday.en;
        const weekdayAr = entry.hijri.weekday.ar;
        const weekdayUr =
          arabicToUrduWeekdays[weekdayAr] ||
          urduWeekdays[weekdayEn] ||
          weekdayAr;

        const monthEn = entry.hijri.month.en;
        const monthUr = urduMonths[monthEn] || entry.hijri.month.ar;

        return {
          gregorian: entry.gregorian.date,
          hijri: entry.hijri.date,
          weekday_en: weekdayEn,
          weekday_ar: weekdayAr,
          weekday_ur: weekdayUr,
          month_en: monthEn,
          month_ur: monthUr,
          year: entry.hijri.year,
          hijri_day: entry.hijri.day,
          holidays: entry.hijri.holidays,
        };
      });

      hijriCalendar.push(...monthData);
    }

    res.json({
      city: "Bangalore",
      from: today.toISOString().split("T")[0],
      to: new Date(today.getFullYear(), today.getMonth() + 12, 0)
        .toISOString()
        .split("T")[0],
      totalDays: hijriCalendar.length,
      hijriCalendar,
    });
  } catch (error) {
    console.error("Error fetching Hijri calendar:", error.message);
    res.status(500).json({ error: "Failed to fetch Hijri calendar" });
  }
});

router.get("/indian-holidays", verifyToken, async (req, res) => {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = "en.indian%23holiday@group.v.calendar.google.com";
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const timeMin = today.toISOString();
  const timeMax = nextYear.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  try {
    const response = await axios.get(url, {
      params: {
        key: apiKey,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      },
    });

    const holidays = response.data.items.map((event) => ({
      date: event.start.date,
      name: event.summary,
    }));

    res.json({
      country: "India",
      from: timeMin.split("T")[0],
      to: timeMax.split("T")[0],
      total: holidays.length,
      holidays,
    });
  } catch (err) {
    console.error("Google Calendar API error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch holidays from Google Calendar" });
  }
});

module.exports = router;
