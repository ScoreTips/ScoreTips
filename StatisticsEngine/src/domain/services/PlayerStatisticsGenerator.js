class PlayerStatisticsGenerator {
    // Função para calcular as probabilidades acumulativas
    calculateCumulativeProbabilities(statsArray) {
        const totalMatches = statsArray.length;
        const cumulativeProbabilities = {};

        for (let i = 1; i <= 10; i++) {
            const count = statsArray.filter(stat => stat >= i).length;
            cumulativeProbabilities[i] = ((count / totalMatches) * 100).toFixed(2) + "%";
        }

        return cumulativeProbabilities;
    }

    async generatePlayerStatistics(players) {
        if (!Array.isArray(players)) {
            throw new Error('Expected an array of players');
        }

        const playerStatistics = {};

        // Agrupar os registros por jogador
        const playerGroups = players.reduce((acc, player) => {
            if (!acc[player.name]) {
                acc[player.name] = [];
            }
            acc[player.name].push(player);
            return acc;
        }, {});

        // Para cada jogador, calcular as probabilidades
        for (const playerName in playerGroups) {
            const matches = playerGroups[playerName];

            // Inicializar arrays para as estatísticas
            const goalsArray = [];
            const shotsArray = [];
            const shotsOnTargetArray = [];
            const tacklesArray = [];
            const yellowCardsArray = [];
            const redCardsArray = [];
            // Coletar os dados das partidas para cada estatística
            matches.forEach(match => {
                goalsArray.push(parseInt(match.goals, 10) || 0);
                shotsArray.push(parseInt(match.shots, 10) || 0);
                shotsOnTargetArray.push(parseInt(match.shotsOnTarget, 10) || 0);
                tacklesArray.push(parseInt(match.tackles, 10) || 0);
                yellowCardsArray.push(parseInt(match.yellowCards, 10) || 0);
                redCardsArray.push(parseInt(match.redCards, 10) || 0);
            });

            // Cálculo das probabilidades cumulativas de eventos
            const goalProbabilities = this.calculateCumulativeProbabilities(goalsArray);
            const shotsProbabilities = this.calculateCumulativeProbabilities(shotsArray);
            const shotsOnTargetProbabilities = this.calculateCumulativeProbabilities(shotsOnTargetArray);
            const tacklesProbabilities = this.calculateCumulativeProbabilities(tacklesArray);
            const yellowCardsProbabilities = this.calculateCumulativeProbabilities(yellowCardsArray);
            const redCardsProbabilities = this.calculateCumulativeProbabilities(redCardsArray);

            // Agregando as estatísticas e probabilidades do jogador
            playerStatistics[playerName] = {
                name: playerName,
                position: matches[0].position, // A posição deve ser consistente entre as partidas
                goals: goalProbabilities,
                shots: shotsProbabilities,
                shotsOnTarget: shotsOnTargetProbabilities,
                tackles: tacklesProbabilities,
                yellowCards: yellowCardsProbabilities,
                redCards: redCardsProbabilities,
            };
        }

        return playerStatistics;
    }
}

export default PlayerStatisticsGenerator;
