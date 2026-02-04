const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

// LİVESCORE-DAN LOQO ÇƏKMƏK ÜÇÜN PROKSİ
app.get("/proxy-logo", async (req, res) => {
    const { img } = req.query;
    if (!img) return res.status(400).send("No image");
    
    try {
        const logoUrl = `https://static.livescore.com/content/team/v2/img/${img}`;
        const response = await fetch(logoUrl);
        const buffer = await response.arrayBuffer();
        
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 günlük yaddaşa vur
        res.send(Buffer.from(buffer));
    } catch (e) {
        res.status(404).send("Not found");
    }
});

app.get("/live-scores", async (req, res) => {
    try {
        const response = await fetch("https://prod-public-api.livescore.com/v1/api/app/live/soccer/0");
        const data = await response.json();
        
        let allMatches = [];
        data.Stages.forEach(stage => {
            stage.Events.forEach(event => {
                allMatches.push({
                    id: event.Eid,
                    displayLeague: `${stage.Cnm}: ${stage.Snm}`,
                    home: event.T1[0].Nm,
                    away: event.T2[0].Nm,
                    // Şəklin adını yadda saxlayırıq (məsələn: 'real-madrid.png')
                    homeImg: event.T1[0].Img,
                    awayImg: event.T2[0].Img,
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