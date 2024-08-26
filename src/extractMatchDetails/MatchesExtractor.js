import * as cheerio from "cheerio";

export class MatchesExtractor {
  extractMatches(html, homeTeam) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    const matchesData = [];
    scripts.each((index, script) => {
      const jsonData = JSON.parse($(script).html() || "{}");
      if (Array.isArray(jsonData)) {
        jsonData.forEach((event) => {
          const matchData = this.extractEventData(event, homeTeam);
          if (matchData) {
            matchesData.push(matchData);
          }
        });
      } else {
        const matchData = this.extractEventData(jsonData, homeTeam);
        if (matchData) {
          matchesData.push(matchData);
        }
      }
    });

    return matchesData;
  }

  extractEventData(event, homeTeam) {
    const description = event.description || "";
    const team1 = event.competitor?.[0]?.name || "";
    const team2 = event.competitor?.[1]?.name || "";

    const isHomeTeam = team1 === homeTeam;

    const home = isHomeTeam ? team1 : team2;
    const away = isHomeTeam ? team2 : team1;
    const homeOrAway = isHomeTeam ? "Casa" : "Fora";

    return {
      homeOrAway: homeOrAway,
      homeTeam: home,
      awayTeam: away,
      opponent: homeOrAway === "Casa" ? away : home,
      url: event.url || "",
      location: event.location?.name || "",
      date: event.startDate || "",
    };
  }
}
