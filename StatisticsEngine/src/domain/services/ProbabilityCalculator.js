class ProbabilityCalculator {
    calculateProbabilities(statsArray, targetValues) {
        const totalMatches = statsArray.length;
        const probabilities = {};

        targetValues.forEach(value => {
            const count = statsArray.filter(stat => stat >= value).length;
            probabilities[value] = (count / totalMatches) * 100;
        });

        return probabilities;
    }

    extractStatFromMatches(matches, teamName, statDescription) {
        const statsArray = [];

        matches.forEach(match => {
            const statObject = match.stats_extra.find(stat => stat.description === statDescription);
            if (statObject && statObject[teamName] !== undefined) {
                const statValue = parseInt(statObject[teamName], 10);
                if (!isNaN(statValue)) {
                    statsArray.push(statValue);
                }
            }
        });

        return statsArray;
    }

    extractShootingStatsFromMatches(matches, teamName) {
        const statsArray = [];

        matches.forEach(match => {
            const statObject = match.team_stats.find(stat => stat.description === "Chutes ao Gol");
            if (statObject && statObject[teamName] !== undefined) {
                const statValue = statObject[teamName];
                const matchPattern = /(\d+) of (\d+)/;
                const matchResult = statValue.match(matchPattern);
                if (matchResult) {
                    const onTarget = parseInt(matchResult[1], 10);
                    const total = parseInt(matchResult[2], 10);
                    if (!isNaN(onTarget) && !isNaN(total)) {
                        statsArray.push({ onTarget, total });
                    }
                }
            }
        });

        return statsArray;
    }

    calculateShootingProbabilities(statsArray, targetValues) {
        const totalMatches = statsArray.length;
        const onTargetProbabilities = {};
        const totalProbabilities = {};

        targetValues.forEach(value => {
            const onTargetCount = statsArray.filter(stat => stat.onTarget >= value).length;
            const totalCount = statsArray.filter(stat => stat.total >= value).length;
            onTargetProbabilities[value] = (onTargetCount / totalMatches) * 100;
            totalProbabilities[value] = (totalCount / totalMatches) * 100;
        });

        return { onTarget: onTargetProbabilities, total: totalProbabilities };
    }

    calculateGoalProbabilities(matches, teamName, targetValues) {
        const goalProbabilities = {
            total: {},
            home: {},
            away: {},
            homeFirstHalf: {},
            awayFirstHalf: {}
        };

        targetValues.forEach(value => {
            let totalGoals = 0;
            let homeGoals = 0;
            let awayGoals = 0;
            let homeFirstHalfGoals = 0;
            let awayFirstHalfGoals = 0;

            matches.forEach(match => {
                const isHomeTeam = match.home_team === teamName;
                const isAwayTeam = match.away_team === teamName;

                if (isHomeTeam || isAwayTeam) {
                    // Contagem de gols totais
                    const teamGoals = match.events.filter(event => event.teamName === teamName && event.eventDescription === "Gol").length;
                    if (teamGoals >= value) totalGoals++;

                    // Contagem de gols em casa
                    if (isHomeTeam) {
                        if (teamGoals >= value) homeGoals++;

                        // Contagem de gols em casa no primeiro tempo
                        const firstHalfGoals = match.events.filter(event => event.teamName === teamName && event.eventDescription === "Gol" && event.parte === "Primeira Parte").length;
                        if (firstHalfGoals >= value) homeFirstHalfGoals++;
                    }

                    // Contagem de gols fora de casa
                    if (isAwayTeam) {
                        if (teamGoals >= value) awayGoals++;

                        // Contagem de gols fora de casa no primeiro tempo
                        const firstHalfGoals = match.events.filter(event => event.teamName === teamName && event.eventDescription === "Gol" && event.parte === "Primeira Parte").length;
                        if (firstHalfGoals >= value) awayFirstHalfGoals++;
                    }
                }
            });

            const totalMatches = matches.length;
            goalProbabilities.total[value] = (totalGoals / totalMatches) * 100;
            goalProbabilities.home[value] = (homeGoals / totalMatches) * 100;
            goalProbabilities.away[value] = (awayGoals / totalMatches) * 100;
            goalProbabilities.homeFirstHalf[value] = (homeFirstHalfGoals / totalMatches) * 100;
            goalProbabilities.awayFirstHalf[value] = (awayFirstHalfGoals / totalMatches) * 100;
        });

        return goalProbabilities;
    }
}

export default ProbabilityCalculator;
