const axios = require("axios");

const SOFA_API = "https://api.sofascore.com/api/v1";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
    "Cache-Control": "no-cache",
    "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
};

async function testFetch() {
    try {
        console.log("Testing fetch from SofaScore...");
        const response = await axios.get(`${SOFA_API}/sport/football/events/live`, { headers: HEADERS });
        console.log("Success! Status:", response.status);
        console.log("Events count:", response.data.events ? response.data.events.length : 0);
    } catch (error) {
        console.error("Fetch failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data).substring(0, 500));
        } else {
            console.error("Error message:", error.message);
        }
    }
}

testFetch();
