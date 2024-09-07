import MongoService from "./src/infrastructure/database/MongoService.js";
import MatchRepository from "./src/domain/repositories/MatchRepository.js";
import ProbabilityCalculator from "./src/domain/services/ProbabilityCalculator.js";
import EventProbabilityCalculator from "./src/domain/services/EventProbabilityCalculator.js";
import StatisticsEngine from "./src/domain/services/StatisticsEngine.js";
import TeamStatisticsGenerator from "./src/domain/services/TeamStatisticsGenerator.js";
import PlayerStatisticsGenerator from "./src/domain/services/PlayerStatisticsGenerator.js";
import dotenv from "dotenv";
dotenv.config({ path: '../constants/.env' });

async function main() {
  try {
    console.log("Iniciando a aplicação...");

    const mongoUri = process.env.mongoUri; // URI do MongoDB
    const matchesDbName = "matchesData"; // Nome do banco de dados de origem
    const statsDbName = 'Statistics'; // Nome do banco de dados de destino

    // Conectando ao banco de dados matchesData
    const matchesMongoService = new MongoService(mongoUri, matchesDbName);
    await matchesMongoService.connect();
    console.log(`Conectado ao banco de dados ${matchesDbName}.`);

    const matchRepository = new MatchRepository(matchesMongoService);
    const eventProbabilityCalculator = new EventProbabilityCalculator();
    const probabilityCalculator = new ProbabilityCalculator();
    const teamStatisticsGenerator = new TeamStatisticsGenerator(
      matchRepository,
      probabilityCalculator,
      eventProbabilityCalculator
    );
    const playerStatisticsGenerator = new PlayerStatisticsGenerator(
      matchRepository,
      probabilityCalculator
    );

    // Mudando para o banco de dados Statistics
    const statisticsMongoService = new MongoService(mongoUri, statsDbName);
    await statisticsMongoService.connect();
    console.log(`Mudança para o banco de dados ${statsDbName}.`);

    const statisticsEngine = new StatisticsEngine(
      teamStatisticsGenerator,
      playerStatisticsGenerator,
      matchRepository,
      statisticsMongoService
    );

    // Gera e salva estatísticas para todos os times
    console.log("Iniciando a geração de estatísticas para todos os times.");
    await statisticsEngine.generateAndSaveAllTeamsStatistics();
    console.log("Geração de estatísticas para todos os times concluída.");

    // Desconecta do banco de dados
    await matchesMongoService.disconnect();
    await statisticsMongoService.disconnect();
    console.log("Desconectado do MongoDB.");
  } catch (e) {
    console.log("Erro: ", e);
  }
}

main().catch(console.error);
