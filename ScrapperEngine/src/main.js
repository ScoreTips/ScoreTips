import { ScrapeService } from './services/scrapeService.js';
import { logMessage } from './utils/logger.js';

// URLs dos times que você deseja fazer o scraping
// const teamUrls = [
//     'https://fbref.com/pt/equipes/6f7e1f03/2024/partidas/c24/schedule/Internacional-Resultados-e-Calendarios-Serie-A',
//     'https://fbref.com/pt/equipes/abdce579/2024/partidas/c24/schedule/Palmeiras-Resultados-e-Calendarios-Serie-A'
    
// ];

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

async function main() {
    try {
        logMessage("Starting the process")
        const scrapeService = new ScrapeService();
        await scrapeService.scrapeAndSaveTeamData(teamUrls);
        logMessage('Scraping process completed successfully.');
    } catch (error) {
        console.log(`An error occurred during the main process: `, error);
    }
}

main();
