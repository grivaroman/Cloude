const cityMap = {
    "Астана": "Astana",
    "Алматы": "Almaty",
    "Шымкент": "Shymkent",
    "Павлодар": "Pavlodar",
    "Талдыкорган": "Taldykorgan",
    "Караганда":"Karaganda"
};


// Загружаем прогноз погоды
async function loadWeather() {
    let city = document.getElementById("citySelect").value;

    // переводим русский → английский
    if (cityMap[city]) {
        city = cityMap[city];
    }


    // === 1. Получаем координаты города ===
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results) {
        document.querySelector("#today span").textContent = "Город не найден";
        return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;

    // === 2. Прогноз погоды ===
    const url = `
https://api.open-meteo.com/v1/forecast?
latitude=${lat}&longitude=${lon}
&hourly=temperature_2m
&daily=temperature_2m_max,temperature_2m_min
&timezone=auto
`.replace(/\n/g, "");

    const res = await fetch(url);
    const data = await res.json();

    const hourly = data.hourly.temperature_2m;
    const now = new Date().getHours();

    // --- Сегодня ---
    const todayDay = hourly[now + 4];
    const todayAfter = hourly[now + 8];
    const todayEve = hourly[now + 12];

    document.querySelector("#today span").textContent =
        `${todayDay}°C / ${todayAfter}°C / ${todayEve}°C`;

    // --- Завтра ---
    const tomorrowDay = hourly[24 + 4];
    const tomorrowAfter = hourly[24 + 8];
    const tomorrowEve = hourly[24 + 12];

    document.querySelector("#tomorrow span").textContent =
        `${tomorrowDay}°C / ${tomorrowAfter}°C / ${tomorrowEve}°C`;

    // --- Неделя ---
    const weekSpan = document.querySelector("#week span");
    const days = ["Пн ","Вт "," Ср "," Чт "," Пт "," Сб "," Вс "];
    
    weekSpan.textContent = "";

    data.daily.temperature_2m_max.forEach((max, i) => {
        const min = data.daily.temperature_2m_min[i];
        weekSpan.textContent += `${days[i]}: ${"Днем  "+ max}° / ${"Вечером : " + min}°;  `;
    });
}

// Доп — автоматическое обновление года в футере
document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
