const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());

// LOQO PROXY - Komanda adına görə loqo tapır
app.get("/proxy-logo", async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).send("No name");
    
    try {
        // Komanda adını loqo formatına salırıq (məs: "Real Madrid" -> "real-madrid")
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const url = `https://static.livescore.com/content/team/v2/img/${slug}.png`;
        
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(response.data);
    } catch (e) {
        // Tapılmasa boş qaytar (index.html-də fallback işə düşəcək)
        res.status(404).send("Not found");
    }
});

app.get("/live-scores", async (req, res) => {
    try {
        const response = await fetch("https://prod-public-api.livescore.com/v1/api/app/live/soccer/0");
        const data = await response.json();
        if (!data.Stages) return res.json([]);

        let allMatches = [];
        data.Stages.forEach(stage => {
            stage.Events.forEach(event => {
                allMatches.push({
                    id: event.Eid,
                    league: `${stage.Cnm}: ${stage.Snm}`,
                    home: event.T1[0].Nm,
                    away: event.T2[0].Nm,
                    score: { home: event.Tr1 || 0, away: event.Tr2 || 0 },
                    minute: event.Eps,
                    scorers: event.Incs ? event.Incs.filter(i => i.InType === "Goal").map(i => ({
                        name: i.Pn, time: i.Min, side: i.ScSide
                    })) : []
                });
            });
        });
        res.json(allMatches);
    } catch (err) { res.json([]); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0");