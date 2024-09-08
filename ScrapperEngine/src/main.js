import { ScrapeService } from './services/scrapeService.js';
import { CompetitionTeamsExtractor } from './extractMatchDetails/CompetitionTeamsExtractor.js';
import { logMessage } from './utils/logger.js';

// BRASILEIRÃO SÉRIE A
const teamUrls = [
    'https://fbref.com/pt/equipes/2091c619/2024/partidas/c24/schedule/Athletico-Paranaense-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/6f7e1f03/2024/partidas/c24/schedule/Internacional-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/a9d0ab0e/2024/partidas/c24/schedule/Fortaleza-Resultados-e-Calendarios-Serie-A', 
    'https://fbref.com/pt/equipes/d9fdd9d9/2024/partidas/c24/schedule/Botafogo-RJ-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/abdce579/2024/partidas/c24/schedule/Palmeiras-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/639950ae/2024/partidas/c24/schedule/Flamengo-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/5f232eb1/2024/partidas/c24/schedule/Sao-Paulo-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/157b7fee/2024/partidas/c24/schedule/Bahia-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/03ff5eeb/2024/partidas/c24/schedule/Cruzeiro-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/83f55dbe/2024/partidas/c24/schedule/Vasco-da-Gama-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/422bb734/2024/partidas/c24/schedule/Atletico-Mineiro-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/d081b697/2024/partidas/c24/schedule/Juventude-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/d5ae3703/2024/partidas/c24/schedule/Gremio-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/f98930d1/2024/partidas/c24/schedule/Red-Bull-Bragantino-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/3f7595bb/2024/partidas/c24/schedule/Criciuma-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/84d9701c/2024/partidas/c24/schedule/Fluminense-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/33f95fe0/2024/partidas/c24/schedule/Vitoria-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/bf4acd28/2024/partidas/c24/schedule/Corinthians-Resultados-e-Calendarios-Serie-A',
    'https://fbref.com/pt/equipes/f0e6fb14/2024/partidas/c24/schedule/Cuiaba-Resultados-e-Calendarios-Serie-A'

];

// const teamUrls = [
//     // 'https://fbref.com/pt/equipes/ac9a09b4/2024/partidas/c21/schedule/Godoy-Cruz-Resultados-e-Calendarios-Liga-Profesional-Argentina',
//     'https://fbref.com/pt/equipes/f711c854/Peru-Stats',
//     'https://fbref.com/pt/equipes/d2043442/Paraguay-Stats'
// ]

async function main() {
    try {

        let collection = ["Argentina_Primera_División", "Inglaterra_Premier_League", "Brazil_SerieA", "Brazil_SerieB"]
        let competitionUrl

        for (let i = 0; i < collection.length; i++){

         console.log("Iniciando o processo de extração para a liga:", collection[i]);


            if (collection[i] == "Inglaterra_Premier_League") {
                competitionUrl = 'https://fbref.com/pt/comps/9/Premier-League-Estatisticas';
            } 
            if (collection[i] == "Brazil_SerieA") {
                competitionUrl = 'https://fbref.com/pt/comps/24/Serie-A-Estatisticas';
            } 
            if (collection[i] == "Brazil_SerieB") {
                competitionUrl = 'https://fbref.com/pt/comps/38/Serie-B-Estatisticas';
            } 
            if (collection[i] == "Argentina_Primera_División") {
                competitionUrl = 'https://fbref.com/pt/comps/21/Liga-Profesional-Argentina-Estatisticas';
            } 

            // Instancia o extractor de times
        const competitionTeamsExtractor = new CompetitionTeamsExtractor();

        // Extrai os links dos times automaticamente
        const teamUrls = await competitionTeamsExtractor.extractTeamLinks(competitionUrl);

        logMessage("Links dos times extraídos com sucesso.");
        logMessage(`Times encontrados: ${teamUrls.length}`);

        const scrapeService = new ScrapeService(collection[i]);
        await scrapeService.scrapeAndSaveTeamData(teamUrls);

        logMessage('Processo de scraping concluído com sucesso.');
            
        }

        
    } catch (error) {
        console.log(`Ocorreu um erro durante o processo principal: `, error);
    }
}

main();