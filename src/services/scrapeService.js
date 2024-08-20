import { fetchHTML } from './fetchService.js';
import { saveMatchToJSON, saveAllMatchesToJSON } from './jsonService.js';
import { logMessage } from '../utils/logger.js';
import { extractMatches } from './extractMatches.js';
import { extractEventDetails } from './extractMatchDetails/events.js';
import { extractStatsExtra } from './extractMatchDetails/statsExtra.js';
import { extractPlayerStats } from './extractMatchDetails/playerStats.js'; // Importa a função criada

export async function scrapeAndSave(url) {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    const homeTeam = extractTeamFromURL(url);

    try {
        const html = await fetchHTML(url, userAgent);
        const matchesData = extractMatches(html, homeTeam);
        const matchDetails = matchesData.map(match => ({
            homeOrAway: match.homeOrAway,
            opponent: match.opponent,
            url: match.url,
            location: match.location,
            date: match.date
        }));

        saveAllMatchesToJSON(homeTeam.replace(/\s+/g, '_').toUpperCase(), `${homeTeam}Matches2024.json`, matchDetails);

        for (const match of matchesData) {
            if (match.url && match.opponent) {
                const matchHtml = await fetchHTML(match.url, userAgent);
                const events = extractEventDetails(matchHtml, match.homeTeam, match.awayTeam);
                const statsExtra = extractStatsExtra(matchHtml, match.homeTeam, match.awayTeam);
                
                // Chama a função para extrair as estatísticas dos jogadores
                const playerStats = extractPlayerStats(matchHtml);

                const finalData = {
                    events,
                    statsExtra,
                    players: playerStats // Adiciona as estatísticas dos jogadores no JSON final
                };

                saveMatchToJSON(homeTeam.replace(/\s+/g, '_').toUpperCase(), `${match.homeTeam}vs${match.awayTeam}.json`, finalData);
                await sleep(2000); // Delay para evitar sobrecarga do servidor
            }
        }

        logMessage('All data saved successfully.');
    } catch (error) {
        logMessage(`Error during scraping and saving: ${error.message}`);
    }
}

function extractTeamFromURL(url) {
    const parts = url.split('/');
    const teamName = parts[parts.length - 1].split('-')[0];
    return teamName.charAt(0).toUpperCase() + teamName.slice(1);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
