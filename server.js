function doGet(e) {
  // Əgər matchId varsa hadisələri (qolları), yoxdursa canlı siyahını gətirir
  let url = e.parameter.matchId 
    ? "https://api.sofascore.com/api/v1/event/" + e.parameter.matchId + "/incidents"
    : "https://api.sofascore.com/api/v1/sport/football/events/live";

  try {
    const response = UrlFetchApp.fetch(url, {
      "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    return ContentService.createTextOutput(response.getContentText())
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET");
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"error": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}