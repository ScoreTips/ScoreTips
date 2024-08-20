import * as cheerio from 'cheerio';

export function extractPlayerStats(html, teamName) {
    const $ = cheerio.load(html);
    const playersStats = {};

    // Itera sobre todas as tabelas de jogadores de linha
    $('div[id^="all_player_stats"] table.stats_table').each((tableIndex, table) => {
        $(table).find('tbody tr').each((index, row) => {
            const playerName = $(row).find('[data-stat="player"]').text().trim();
            const position = $(row).find('[data-stat="position"]').text().trim();

            if (!playerName) return;

            // Inicializa o jogador no objeto playersStats se ainda não existir
            if (!playersStats[playerName]) {
                playersStats[playerName] = {
                    name: playerName,
                    team: teamName,
                    shirtNumber: $(row).find('[data-stat="shirtnumber"]').text().trim() || "N/A",
                    nationality: $(row).find('[data-stat="nationality"]').text().trim().slice(-3, -1) || "N/A",
                    position: position,
                    age: $(row).find('[data-stat="age"]').text().trim().slice(0, 2) || "N/A",
                    minutes: $(row).find('[data-stat="minutes"]').text().trim() || "0"
                };
            }

            if (position !== "GK") {
                // Mapeia os campos de jogadores de linha
                playersStats[playerName] = {
                    ...playersStats[playerName],
                    goals: $(row).find('[data-stat="goals"]').text().trim() || "0",
                    assists: $(row).find('[data-stat="assists"]').text().trim() || "0",
                    penaltiesMade: $(row).find('[data-stat="pens_made"]').text().trim() || "0",
                    penaltiesAttempted: $(row).find('[data-stat="pens_att"]').text().trim() || "0",
                    totalShots: $(row).find('[data-stat="shots"]').text().trim() || "0",
                    shotsOnTarget: $(row).find('[data-stat="shots_on_target"]').text().trim() || "0",
                    yellowCards: $(row).find('[data-stat="cards_yellow"]').text().trim() || "0",
                    redCards: $(row).find('[data-stat="cards_red"]').text().trim() || "0",
                    touches: $(row).find('[data-stat="touches"]').text().trim() || "0",
                    tackles: $(row).find('[data-stat="tackles"]').text().trim() || "0",
                    interceptions: $(row).find('[data-stat="interceptions"]').text().trim() || "0",
                    blocks: $(row).find('[data-stat="blocks"]').text().trim() || "0",
                    xG: $(row).find('[data-stat="xg"]').text().trim() || "0.0",
                    npxG: $(row).find('[data-stat="npxg"]').text().trim() || "0.0",
                    xAG: $(row).find('[data-stat="xg_assist"]').text().trim() || "0.0",
                    sca: $(row).find('[data-stat="sca"]').text().trim() || "0",
                    crosses: $(row).find('[data-stat="crosses"]').text().trim() || "0", 
                    tacklesWon: $(row).find('[data-stat="tackles_won"]').text().trim() || "0",
                    penaltiesConceded: $(row).find('[data-stat="pens_conceded"]').text().trim() || "0",
                    ownGoals: $(row).find('[data-stat="own_goals"]').text().trim() || "0",
                    recoveries: $(row).find('[data-stat="recoveries"]').text().trim() || "0",
                    aerialDuelsWon: $(row).find('[data-stat="aerial_duels_won"]').text().trim() || "0",
                    aerialDuelsLost: $(row).find('[data-stat="aerial_duels_lost"]').text().trim() || "0",
                    aerialDuelsWonPercentage: $(row).find('[data-stat="aerial_duels_won_pct"]').text().trim() || "0.0"
                };
            }
        });
    });

    // Itera sobre a tabela específica de goleiros
    $('div[id^="all_keeper_stats"] table.stats_table').each((tableIndex, table) => {
        $(table).find('tbody tr').each((index, row) => {
            const playerName = $(row).find('[data-stat="player"]').text().trim();

            if (!playerName) return;

            // Inicializa o jogador no objeto playersStats se ainda não existir
            if (!playersStats[playerName]) {
                playersStats[playerName] = {
                    name: playerName,
                    team: teamName,
                    position: "GK",
                    shirtNumber: $(row).find('[data-stat="shirtnumber"]').text().trim() || "N/A",
                    nationality: $(row).find('[data-stat="nationality"]').text().trim().slice(-3, -1) || "N/A",
                    age: $(row).find('[data-stat="age"]').text().trim().slice(0, 2) || "N/A",
                    minutes: $(row).find('[data-stat="minutes"]').text().trim() || "0"
                };
            }

            // Mapeia os campos específicos de goleiros
            playersStats[playerName] = {
                ...playersStats[playerName],
                shotsOnTargetAgainst: $(row).find('[data-stat="gk_shots_on_target_against"]').text().trim() || "0",
                goalsConceded: $(row).find('[data-stat="gk_goals_against"]').text().trim() || "0",
                saves: $(row).find('[data-stat="gk_saves"]').text().trim() || "0",
                savePercentage: $(row).find('[data-stat="gk_save_pct"]').text().trim() || "0.0",
                psxg: $(row).find('[data-stat="gk_psxg"]').text().trim() || "0.0",
                passesLaunched: $(row).find('[data-stat="gk_passes_launched"]').text().trim() || "0",
                passesLaunchedAccuracy: $(row).find('[data-stat="gk_passes_pct_launched"]').text().trim() || "0.0",
                throws: $(row).find('[data-stat="gk_passes_throws"]').text().trim() || "0",
                goalKicks: $(row).find('[data-stat="gk_goal_kicks"]').text().trim() || "0",
                crossesFaced: $(row).find('[data-stat="gk_crosses"]').text().trim() || "0",
                sweeperActions: $(row).find('[data-stat="gk_def_actions_outside_pen_area"]').text().trim() || "0",
                sweeperDistance: $(row).find('[data-stat="gk_avg_distance_def_actions"]').text().trim() || "0.0"
            };
        });
    });

    // Converte o objeto playersStats em um array de objetos
    return Object.values(playersStats);
}
