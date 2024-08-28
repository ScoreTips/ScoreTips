import * as cheerio from "cheerio";

export class MatchesExtractor {
  constructor() {
    this.teamNameMapping = {
      "Ath Paranaense": "Athletico Paranaense",
      "Atl Goianiense": "Atlético Goianiense",
    };
  }

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

  normalizeName(name) {
    const normalized = name.trim();
    return this.teamNameMapping[normalized] || name;
  }

  extractEventData(event, homeTeam) {
    const description = event.description || "";
    
    // Verificar se a descrição tem o formato esperado
    if (!description.includes(" vs ")) {
      console.error(`Descrição não está no formato esperado: ${description}`);
      return null; // Ignora este evento se o formato não estiver correto
    }

    const [team1, team2] = description.split(" vs ");
    const normalizedTeam1 = this.normalizeName(team1);
    const normalizedTeam2 = this.normalizeName(team2.split(" on ")[0]);

    const normalizedHomeTeam = this.normalizeName(homeTeam);

    // Validando que o primeiro time é o mandante
    const home = normalizedTeam1;
    const away = normalizedTeam2;

    const homeOrAway = normalizedHomeTeam === home ? "Casa" : "Fora";

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
