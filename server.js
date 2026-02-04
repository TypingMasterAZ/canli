const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const API_KEY = "a95f9a1f08ee4d72882ac761861be455"; 

app.get("/", (req, res) => res.send("ProScore API Aktivdir!"));

app.get("/live-scores", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/matches", {
            headers: { "X-Auth-Token": API_KEY }
        });
        const data = await response.json();
        
        if (!data.matches) return res.json([]);

        const matches = data.matches.map(m => ({
            id: m.id,
            displayLeague: m.competition.name,
            home: m.homeTeam.name,
            homeLogo: m.homeTeam.crest,
            away: m.awayTeam.name,
            awayLogo: m.awayTeam.crest,
            score: {
                home: m.score.fullTime.home ?? 0,
                away: m.score.fullTime.away ?? 0
            },
            minute: m.status === "IN_PLAY" ? "LIVE" : (m.status === "FINISHED" ? "FT" : "Soon"),
            // Qol vuranlar API-dən asılıdır, hələlik strukturu hazır saxlayırıq
            homeGoals: m.score.extraTime ? [{name: "Goal", time: ""}] : [], 
            awayGoals: []
        }));

        res.json(matches);
    } catch (err) {
        res.json([]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0");