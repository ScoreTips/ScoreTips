class StatisticsEngine {
    constructor(teamStatisticsGenerator, matchRepository, mongoService) {
        this.teamStatisticsGenerator = teamStatisticsGenerator;
        this.matchRepository = matchRepository;
        this.mongoService = mongoService;
    }

    async generateAndSaveTeamStatistics(teamName) {
        console.log(`Iniciando a geração de estatísticas para o time: ${teamName}.`);

        const statDescriptions = ["Escanteios", "Cartões Amarelos", "Impedimentos", "Tiro de meta", "Cobrança de lateral"];
        const targetValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        const statistics = await this.teamStatisticsGenerator.generateTeamStatistics(teamName, statDescriptions, targetValues);

        const collection = this.mongoService.getCollection('Brazil_SerieA');
        await collection.insertOne({
            teamName,
            statistics,
            generatedAt: new Date()
        });

        console.log(`Estatísticas para o time ${teamName} foram salvas com sucesso.`);
    }

    async generateAndSaveAllTeamsStatistics() {
        const teams = await this.matchRepository.getAllTeams();
        console.log(`Times encontrados: ${teams.length}`);

        for (const teamName of teams) {
            await this.generateAndSaveTeamStatistics(teamName);
        }
    }
}

export default StatisticsEngine;
