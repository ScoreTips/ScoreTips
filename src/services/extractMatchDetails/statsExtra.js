import * as cheerio from 'cheerio';
import { extractTeamStats } from './teamStats.js';

export function extractStatsExtra(html, homeTeam, awayTeam) {
    const $ = cheerio.load(html);
    const statsExtra = [];

    // Extração de estatísticas extras
    $('#team_stats_extra > div').each((index, element) => {
        const statsRows = $(element).children('div');

        for (let i = 0; i < statsRows.length; i += 3) {
            const homeValue = $(statsRows[i]).text().trim();
            const statDescription = $(statsRows[i + 1]).text().trim();
            const awayValue = $(statsRows[i + 2]).text().trim();

            if (homeValue && statDescription && awayValue) {
                const stats = {};
                stats[homeTeam] = homeValue;
                stats['description'] = statDescription;
                stats[awayTeam] = awayValue;
                statsExtra.push(stats);
            }
        }
    });

    // Adicionando as estatísticas do time ao objeto statsExtra
    const teamStats = extractTeamStats(html, homeTeam, awayTeam);
    statsExtra.push(...teamStats);

    return statsExtra;
}
