const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "az-AZ,az;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com"
};

// Render-dəki "GET işlemi yapılamıyor /" xətasını həll etmək üçün:
app.get("/", (req, res) => {
    res.send("Server aktivdir! Məlumatlar üçün /live-scores ünvanına gedin.");
});

app.get("/live-scores", async (req, res) => {
    try {
        const response = await fetch("https://api.sofascore.com/api/v1/sport/football/events/scheduled/2026-02-04", { 
            headers: HEADERS,
            cache: 'no-store'
        });
        const data = await response.json();
        
        if (!data || !data.events) return res.json([]);

        const matches = await Promise.all(data.events.slice(0, 50).map(async (event) => {
            let homeGoals = [], awayGoals = [];
            
            try {
                const incRes = await fetch(`https://api.sofascore.com/api/v1/event/${event.id}/incidents`, { headers: HEADERS });
                const incData = await incRes.json();
                if (incData?.incidents) {
                    incData.incidents.forEach(inc => {
                        if (inc.incidentType === "goal") {
                            const playerName = inc.player ? inc.player.name : (inc.playerName || "Goal");
                            if (inc.isHome) homeGoals.push({ name: playerName, time: inc.time });
                            else awayGoals.push({ name: playerName, time: inc.time });
                        }
                    });
                }
            } catch (e) {}

            let minute = "";
            if (event.status.type === "finished") minute = "FT";
            else if (event.status.description === "Halftime") minute = "HT";
            else if (event.status.type === "inprogress") {
                minute = event.status.clock?.current !== undefined ? Math.floor(event.status.clock.current / 60) + "'" : "Live";
            } else minute = event.status.description || "Soon";

            return {
                id: event.id,
                displayLeague: `${event.tournament?.category?.name}: ${event.tournament?.name}`,
                leagueId: event.tournament?.uniqueTournament?.id || 0,
                home: event.homeTeam.name,
                homeId: event.homeTeam.id,
                away: event.awayTeam.name,
                awayId: event.awayTeam.id,
                score: {
                    home: event.homeScore?.current ?? 0,
                    away: event.awayScore?.current ?? 0
                },
                minute,
                homeGoals,
                awayGoals
            };
        }));

        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Port: ${PORT}`));