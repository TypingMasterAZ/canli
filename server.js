const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

// Sənin aldığın rəsmi API açarı
const API_KEY = "a95f9a1f08ee4d72882ac761861be455"; 

app.get("/", (req, res) => res.send("ProScore API Aktivdir!"));

app.get("/live-scores", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/matches", {
            headers: { "X-Auth-Token": API_KEY }
        });
        const data = await response.json();
        
        if (!data.matches || data.matches.length === 0) return res.json([]);

        const matches = data.matches.map(m => ({
            id: m.id,
            displayLeague: m.competition.name,
            home: m.homeTeam.name,
            homeLogo: m.homeTeam.crest, // Komandanın loqosu
            away: m.awayTeam.name,
            awayLogo: m.awayTeam.crest, // Komandanın loqosu
            score: {
                home: m.score.fullTime.home ?? 0,
                away: m.score.fullTime.away ?? 0
            },
            // Statusu daha anlaşıqlı edirik
            minute: m.status === "IN_PLAY" ? "LIVE" : (m.status === "FINISHED" ? "FT" : "Soon"),
            homeGoals: [], 
            awayGoals: []
        }));

        res.json(matches);
    } catch (err) {
        console.error("API Xətası:", err.message);
        res.json([]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server ${PORT} portunda aktivdir`));