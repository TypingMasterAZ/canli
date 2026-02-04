const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

// Bloklamanı keçmək üçün daha detallı başlıqlar
const SOFA_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "az-AZ,az;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Cache-Control": "no-cache"
};

app.get("/", (req, res) => res.send("Server Aktivdir!"));

app.get("/live-scores", async (req, res) => {
    try {
        // Canlı oyunların siyahısını çəkirik
        const response = await fetch("https://api.sofascore.com/api/v1/sport/football/events/live", { 
            headers: SOFA_HEADERS 
        });
        
        const data = await response.json();
        
        if (!data.events || data.events.length === 0) {
            return res.json([]); // Hazırda canlı oyun yoxdursa boş siyahı qaytarır
        }

        const matches = data.events.map(event => {
            // Dəqiqə hesablanması
            let minute = "";
            if (event.status.type === "finished") minute = "FT";
            else if (event.status.description === "Halftime") minute = "HT";
            else if (event.status.type === "inprogress") {
                minute = event.status.clock?.current !== undefined ? Math.floor(event.status.clock.current / 60) + "'" : "Live";
            } else minute = event.status.description || "Soon";

            return {
                id: event.id,
                displayLeague: `${event.tournament.category.name}: ${event.tournament.name}`,
                leagueId: event.tournament.uniqueTournament?.id || 0,
                home: event.homeTeam.name,
                homeId: event.homeTeam.id,
                away: event.awayTeam.name,
                awayId: event.awayTeam.id,
                score: {
                    home: event.homeScore?.current ?? 0,
                    away: event.awayScore?.current ?? 0
                },
                minute: minute,
                homeGoals: [], // Sürət üçün qol atanları başqa sorğu ilə çəkmək lazımdır, hələlik boş saxlayırıq
                awayGoals: []
            };
        });

        res.json(matches);

    } catch (err) {
        console.error("Sofascore xətası:", err.message);
        // Xəta olarsa, səhifə boş qalmasın deyə boş siyahı göndəririk
        res.json([]); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("🚀 Real Sofascore serveri aktivdir!"));