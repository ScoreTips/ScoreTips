import { MatchesExtractor } from '../extractMatchDetails/MatchesExtractor.js';
import { PlayerStatsExtractor } from '../extractMatchDetails/PlayerStatsExtractor.js';
import { StatsExtraExtractor } from '../extractMatchDetails/StatsExtraExtractor.js';
import { TeamStatsExtractor } from '../extractMatchDetails/TeamStatsExtractor.js';
import { EventsExtractor } from '../extractMatchDetails/EventsExtractor.js';
import { FetchService } from './fetchService.js';
import { MongoService } from './mongoService.js';
import { logMessage } from '../utils/logger.js';
import { sleep } from '../utils/sleep.js';

export class ScrapeService {
    constructor() {
        this.fetchService = new FetchService();
        this.mongoService = new MongoService();
        this.matchesExtractor = new MatchesExtractor();
        this.playerStatsExtractor = new PlayerStatsExtractor();
        this.statsExtraExtractor = new StatsExtraExtractor();
        this.teamStatsExtractor = new TeamStatsExtractor();
        this.eventsExtractor = new EventsExtractor();
    }

    async scrapeAndSaveTeamData(teamUrls) {
        for (let i = 0; i < teamUrls.length; i++) {
            const url = teamUrls[i];
            const teamHtml = await this.fetchService.fetchHTML(url);
            const teamName = this.getTeamNameFromUrl(url);
    
            // Extração de partidas
            const matches = this.matchesExtractor.extractMatches(teamHtml, teamName);
    
            for (const match of matches) {  
                // Verifica se os dados da partida são válidos
                if (!match.homeTeam || !match.awayTeam || !match.date) {
                    console.log(`Dados inválidos encontrados para a partida:`, match);
                    continue; // Pula essa partida e continua com a próxima
                }
    
                let homeTeam = match.homeTeam;
                let awayTeam = match.awayTeam;

                // Verifica se a partida já foi inserida no banco de dados
                const matchExists = await this.mongoService.checkMatchExists(`${match.date}_${homeTeam}_vs_${awayTeam}`);
    
                if (!matchExists) {
                    const matchHtml = await this.fetchService.fetchHTML(match.url);
    
                    // Extração de eventos da partida
                    const events = this.eventsExtractor.extractEvents(matchHtml, homeTeam, awayTeam);
    
                    // Extração de estatísticas extras e do time
                    const statsExtra = this.statsExtraExtractor.extractStatsExtra(matchHtml, homeTeam, awayTeam);
                    const teamStats = this.teamStatsExtractor.extractTeamStats(matchHtml, homeTeam, awayTeam);
    
                    // Extração de estatísticas dos jogadores
                    const playerStats = this.playerStatsExtractor.extractPlayerStats(matchHtml, homeTeam);
    
                    // Formatação dos dados para o modelo especificado
                    const matchData = {
                        match_id: `${match.date}_${homeTeam}_vs_${awayTeam}`,
                        date: match.date,
                        home_team: homeTeam,
                        away_team: awayTeam,
                        link: match.url,
                        events: events,
                        team_stats: teamStats,
                        player_stats: playerStats,
                        stats_extra: statsExtra,
                    };
    
                    // Inserir no banco de dados
                    await this.mongoService.saveMatchData(matchData);
                    await logMessage(`Partida ${homeTeam} vs ${awayTeam} salva no banco de dados.`);
                } else {
                    logMessage(`Partida ${homeTeam} vs ${awayTeam} já existente no banco de dados.`);
                }
    
                // Pausa após cada 12 requests para evitar sobrecarregar o servidor
                if ((i + 1) % 12 === 0) {
                    logMessage('Aguardando 5 minutos antes de continuar...');
                    await sleep(5 * 60 * 1000); // 5 minutos
                }
            }
        }
    }
    

    getTeamNameFromUrl(url) {
        const parts = url.split('/');
        const teamName = parts[parts.length - 1].split('-')[0];
        return teamName.charAt(0).toUpperCase() + teamName.slice(1);
    }
}