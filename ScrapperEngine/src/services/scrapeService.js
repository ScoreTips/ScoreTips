import { MatchesExtractor } from "../extractMatchDetails/MatchesExtractor.js";
import { PlayerStatsExtractor } from "../extractMatchDetails/PlayerStatsExtractor.js";
import { StatsExtraExtractor } from "../extractMatchDetails/StatsExtraExtractor.js";
import { TeamStatsExtractor } from "../extractMatchDetails/TeamStatsExtractor.js";
import { EventsExtractor } from "../extractMatchDetails/EventsExtractor.js";
import { parseDate } from "../utils/dateParser.js"; // Criamos uma função para parsear a data
import { FetchService } from "./fetchService.js";
import { MongoService } from "./mongoService.js";
import { logMessage } from "../utils/logger.js";
import { sleep } from "../utils/sleep.js";
import * as cheerio from "cheerio";

export class ScrapeService {
  constructor(collection) {
    this.fetchService = new FetchService();
    this.mongoService = new MongoService(collection);
    this.matchesExtractor = new MatchesExtractor();
    this.playerStatsExtractor = new PlayerStatsExtractor();
    this.statsExtraExtractor = new StatsExtraExtractor();
    this.teamStatsExtractor = new TeamStatsExtractor();
    this.eventsExtractor = new EventsExtractor();
  }

  async scrapeAndSaveTeamData(teamUrls) {
    const today = new Date(); // Data de hoje

    for (let i = 0; i < teamUrls.length; i++) {
        const url = teamUrls[i];
        const teamHtml = await this.fetchService.fetchHTML(url);
        const teamName = this.getTeamNameFromUrl(url);

        // Extração de partidas
        const matches = this.matchesExtractor.extractMatches(teamHtml, teamName);
        logMessage(`Starting to scrape matches for: ${teamName}`);

        for (const match of matches) {
            const matchDate = parseDate(match.date); 

            // Verifica se a partida já aconteceu (antes de hoje)
            if (!matchDate || matchDate >= today) {
                logMessage(`Partida ${match.homeTeam} vs ${match.awayTeam} ainda não aconteceu ou data inválida. Ignorando...`);
                continue; // Pula a partida se ela for futura ou se a data estiver inválida
            } else {
                logMessage(`Partida já aconteceu em ${matchDate.toDateString()}, hoje: ${today.toDateString()}`);
            }

            let homeTeam = match.homeTeam;
            let awayTeam = match.awayTeam;

            // Verifica se a partida já foi inserida no banco de dados
            const matchExists = await this.mongoService.checkMatchExists(match);

            if (!matchExists) {
                const matchHtml = await this.fetchService.fetchHTML(match.url);
                const $ = cheerio.load(matchHtml);
                const h1Text = $("h1").text();
                const matchTitle = h1Text.match(/(.+?) vs\.\s(.+?) Relatório da Partida/);

                // if (matchTitle) {
                //     homeTeam = matchTitle[1].trim();
                //     awayTeam = matchTitle[2].trim();
                // } else {
                //     logMessage("Título da partida não encontrado, pulando...");
                //     continue;
                // }

                // Extração de eventos da partida
                const events = this.eventsExtractor.extractEvents(matchHtml, homeTeam, awayTeam);

                // Extração de estatísticas extras e do time
                const statsExtra = this.statsExtraExtractor.extractStatsExtra(matchHtml, homeTeam, awayTeam);
                const teamStats = this.teamStatsExtractor.extractTeamStats(matchHtml, homeTeam, awayTeam);

                // Extração de estatísticas dos jogadores
                const playerStats = this.playerStatsExtractor.extractPlayerStats(matchHtml);

                // Formatação dos dados para o modelo especificado
                const matchData = {
                    match_id: `${match.date}_${homeTeam}_vs_${awayTeam}`,
                    link: match.url,
                    date: match.date,
                    home_team: homeTeam,
                    away_team: awayTeam,
                    events: events,
                    team_stats: teamStats,
                    player_stats: playerStats,
                    stats_extra: statsExtra,
                };

                // Inserir no banco de dados
                await this.mongoService.saveMatchData(matchData);
                logMessage(`Partida ${homeTeam} vs ${awayTeam} salva no banco de dados.`);
                await new Promise((resolve) => setTimeout(resolve, 8100));
            } else {
                logMessage(`Partida ${homeTeam || match.homeTeam} vs ${awayTeam || match.awayTeam} já existente no banco de dados.`);
            }
        }
    }
}



  getTeamNameFromUrl(url) {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];

    // Procurar por diferentes sufixos no URL
    const possibleSuffixes = ["-Resultados", "-Calendarios", "-Stats", "-Estatisticas"];

    let teamNameWithDashes = null;

    // Verificar qual sufixo está presente no URL
    for (const suffix of possibleSuffixes) {
        const endIndex = lastPart.indexOf(suffix);
        if (endIndex !== -1) {
            teamNameWithDashes = lastPart.substring(0, endIndex);
            break;
        }
    }

    if (teamNameWithDashes) {
        // Substituir os hífens por espaços para obter o nome do time
        const teamName = teamNameWithDashes
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        return teamName;
    }

    return "";
}

}
