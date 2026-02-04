const express = require("express");
const cors = require("cors");
const axios = require("axios"); // axios yoxdursa: npm install axios
const app = express();
app.use(cors());

// LOQO PROXY: Livescore-un blokunu aşmaq üçün
app.get("/proxy-logo", async (req, res) => {
    const { imgId } = req.query;
    if (!imgId) return res.status(400).send("No ID");
    
    try {
        const url = `https://static.livescore.com/content/team/v2/img/${imgId}.png`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.setHeader("Content-Type", "image/png");
        res.send(response.data);
    } catch (e) {
        // Əgər loqo tapılmasa, şəffaf 1x1 pixel göndər
        res.status(404).send("");
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
                    // Livescore-un öz rəsmi loqo ID-ləri
                    homeImgId: event.T1[0].Img?.replace('.png', ''),
                    awayImgId: event.T2[0].Img?.replace('.png', ''),
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