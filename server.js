const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());

app.get("/live-scores", async (req, res) => {
    try {
        // Sofascore-u tam brauzer kimi göstərən başlıqlar
        const response = await axios.get("https://api.sofascore.com/api/v1/sport/football/events/live", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Referer": "https://www.sofascore.com/",
                "Origin": "https://www.sofascore.com"
            },
            timeout: 10000 // 10 saniyə gözləmə müddəti
        });

        if (!response.data || !response.data.events || response.data.events.length === 0) {
            console.log("Sofascore-dan boş data gəldi.");
            return res.json([]);
        }

        const matches = response.data.events.map(event => ({
            id: event.id,
            league: event.tournament ? event.tournament.name : "Naməlum Liqa",
            home: event.homeTeam.name,
            away: event.awayTeam.name,
            homeId: event.homeTeam.id,
            awayId: event.awayTeam.id,
            score: {
                home: event.homeScore ? (event.homeScore.current || 0) : 0,
                away: event.awayScore ? (event.awayScore.current || 0) : 0
            },
            minute: event.status.description === "Live" ? (event.lastPeriod || "Canlı") : event.status.description
        }));

        res.json(matches);
    } catch (err) {
        console.error("Sofascore Bağlantı Xətası:", err.message);
        // Əgər 403 xətası alırsansa, bu Render-in bloklandığı deməkdir
        res.status(500).json({ error: "Məlumat alınarkən xəta baş verdi", detail: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ${PORT} portunda işə düşdü.`);
});