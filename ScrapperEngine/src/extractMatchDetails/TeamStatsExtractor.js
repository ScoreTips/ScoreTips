import * as cheerio from 'cheerio';

export class TeamStatsExtractor {
    extractTeamStats(html, homeTeam, awayTeam) {
        const $ = cheerio.load(html);
        const teamStats = [];

        // Função auxiliar para extrair dados de uma linha específica
        function extractStat(selector, statName) {
            const homeValue = $(selector).first().find('td').eq(0).text().trim();
            const awayValue = $(selector).first().find('td').eq(1).text().trim();

            if (homeValue && awayValue) {
                const stat = {
                    description: statName,
                    [homeTeam]: homeValue,
                    [awayTeam]: awayValue
                };
                teamStats.push(stat);
            }
        }

        // Extraindo estatísticas específicas
        extractStat('tr:contains("Posse") + tr', 'Posse de Bola');
        extractStat('tr:contains("Acerto de passes") + tr', 'Acerto de Passes');
        extractStat('tr:contains("Chutes ao gol") + tr', 'Chutes ao Gol');
        extractStat('tr:contains("Defesas") + tr', 'Defesas');

        // Extraindo cartões
        const homeYellowCards = $('#team_stats .cards').eq(0).find('.yellow_card').length;
        const homeYellowRedCards = $('#team_stats .cards').eq(0).find('.yellow_red_card').length;
        const awayYellowCards = $('#team_stats .cards').eq(1).find('.yellow_card').length;
        const awayYellowRedCards = $('#team_stats .cards').eq(1).find('.yellow_red_card').length;

        if (homeYellowCards || awayYellowCards) {
            teamStats.push({
                description: 'Cartões Amarelos',
                [homeTeam]: homeYellowCards.toString(),
                [awayTeam]: awayYellowCards.toString()
            });
        }

        if (homeYellowRedCards || awayYellowRedCards) {
            teamStats.push({
                description: 'Cartões Amarelos + Vermelhos',
                [homeTeam]: homeYellowRedCards.toString(),
                [awayTeam]: awayYellowRedCards.toString()
            });
        }
        return teamStats;
    }
}
