import { ScrapeService } from './services/scrapeService.js';
import { logMessage } from './utils/logger.js';

// URLs dos times que você deseja fazer o scraping
const teamUrls = [
    'https://fbref.com/pt/equipes/6f7e1f03/2024/partidas/c24/schedule/Internacional-Resultados-e-Calendarios-Serie-A',
    // Adicione mais URLs aqui
];

async function main() {
    try {
        const scrapeService = new ScrapeService();
        
        logMessage("Starting the process")
        await scrapeService.scrapeAndSaveTeamData(teamUrls);
        logMessage('Scraping process completed successfully.');
    } catch (error) {
        console.log(`An error occurred during the main process: `, error);
    }
}

main();
