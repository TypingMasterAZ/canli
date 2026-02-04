const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();
app.use(cors());

app.get("/live-scores", async (req, res) => {
    let browser;
    try {
        // Gizli brauzeri başladırıq
        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        
        // Livescore-un canlı oyunlar səhifəsinə gedirik
        await page.goto("https://www.livescore.com/en/football/live/", {
            waitUntil: "networkidle2"
        });

        // Saytdakı məlumatları seçib götürürük (Scraping)
        const matches = await page.evaluate(() => {
            const results = [];
            const matchElements = document.querySelectorAll(".MatchRow_matchRowWrapper__2S69Z"); // Bu klasslar tez-tez dəyişir
            
            matchElements.forEach(el => {
                const homeTeam = el.querySelector(".MatchRow_homeName__19Vf5")?.innerText;
                const awayTeam = el.querySelector(".MatchRow_awayName__3fN4W")?.innerText;
                const score = el.querySelector(".MatchRow_score__3-4-8")?.innerText;
                const time = el.querySelector(".MatchRow_status__3-4-8")?.innerText;

                if(homeTeam && awayTeam) {
                    results.push({
                        home: homeTeam,
                        away: awayTeam,
                        score: score,
                        minute: time,
                        displayLeague: "LiveScore Scraping"
                    });
                }
            });
            return results;
        });

        await browser.close();
        res.json(matches);

    } catch (err) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Livescore blokladı və ya xəta baş verdi" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0");