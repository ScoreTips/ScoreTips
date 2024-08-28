class TeamStatisticsGenerator {
    constructor(matchRepository, probabilityCalculator, eventProbabilityCalculator) {
        this.matchRepository = matchRepository;
        this.probabilityCalculator = probabilityCalculator;
        this.eventProbabilityCalculator = eventProbabilityCalculator;
    }

    async generateTeamStatistics(teamName, statDescriptions, targetValues) {
        const matches = await this.matchRepository.getMatchesByTeam(teamName);
        const probabilities = {};

        for (const statDescription of statDescriptions) {
            const statsArray = this.probabilityCalculator.extractStatFromMatches(matches, teamName, statDescription);

            if (statsArray.length === 0) {
                console.log(`Nenhum dado encontrado para ${statDescription} do time ${teamName}.`);
                continue;
            }

            probabilities[statDescription] = this.probabilityCalculator.calculateProbabilities(statsArray, targetValues);
        }

        const shootingStatsArray = this.probabilityCalculator.extractShootingStatsFromMatches(matches, teamName);
        if (shootingStatsArray.length > 0) {
            probabilities["Chutes ao Gol"] = this.probabilityCalculator.calculateShootingProbabilities(shootingStatsArray, targetValues);
        }

        const eventsArray = this.eventProbabilityCalculator.extractEventsFromMatches(matches, teamName);
        if (eventsArray.length > 0) {
            probabilities["Gols_Primeira_Parte"] = this.eventProbabilityCalculator.calculateEventProbabilities(eventsArray, "Gol", "Primeira Parte");
            probabilities["Gols_Segunda_Parte"] = this.eventProbabilityCalculator.calculateEventProbabilities(eventsArray, "Gol", "Segunda Parte");
            probabilities["Cartoes_Amarelos_Primeira_Parte"] = this.eventProbabilityCalculator.calculateEventProbabilities(eventsArray, "Cartão Amarelo", "Primeira Parte");
            probabilities["Cartoes_Amarelos_Segunda_Parte"] = this.eventProbabilityCalculator.calculateEventProbabilities(eventsArray, "Cartão Amarelo", "Segunda Parte");
        }

        probabilities["Gols"] = this.probabilityCalculator.calculateGoalProbabilities(matches, teamName, targetValues);

        return probabilities;
    }
}

export default TeamStatisticsGenerator;
