class StatisticsEngine {
    constructor(teamStatisticsGenerator, playerStatisticsGenerator, matchRepository, mongoService) {
        this.teamStatisticsGenerator = teamStatisticsGenerator;
        this.playerStatisticsGenerator = playerStatisticsGenerator;
        this.matchRepository = matchRepository;
        this.mongoService = mongoService;
    }

    async generateAndSaveTeamStatistics(teamName) {
        console.log(`Iniciando a geração de estatísticas para o time: ${teamName}.`);

        // Geração de estatísticas gerais da equipe
        const statDescriptions = ["Escanteios", "Cartões Amarelos", "Impedimentos", "Tiro de meta", "Cobrança de lateral", "Faltas"];
        const targetValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

        // Gerar estatísticas do time
        const statistics = await this.teamStatisticsGenerator.generateTeamStatistics(teamName, statDescriptions, targetValues);

        const players = await this.matchRepository.getTeamPlayers(teamName);

        // if (!Array.isArray(players) || players.length === 0) {
        //     console.error(`Nenhum jogador encontrado para o time ${teamName}`);
        //     return;
        // }

        // Gerar estatísticas dos jogadores
        const playerStatistics = await this.playerStatisticsGenerator.generatePlayerStatistics(players);
        // console.log('Estatísticas dos jogadores:', playerStatistics);

        // Salvar estatísticas no banco de dados
        const collection = this.mongoService.getCollection('Inglaterra_Premier_League');
        await collection.insertOne({
            teamName,
            statistics,
            playerStatistics,
            generatedAt: new Date()
        });

        console.log(`Estatísticas para o time ${teamName} foram salvas com sucesso.`);
        console.log('-------------------------------------')

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
