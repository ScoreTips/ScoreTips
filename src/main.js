import { ScrapeService } from './services/scrapeService.js';
import { logMessage } from './utils/logger.js';

// URLs dos times que você deseja fazer o scraping
// const teamUrls = [
//     'https://fbref.com/pt/equipes/6f7e1f03/2024/partidas/c24/schedule/Internacional-Resultados-e-Calendarios-Serie-A',
//     'https://fbref.com/pt/equipes/abdce579/2024/partidas/c24/schedule/Palmeiras-Resultados-e-Calendarios-Serie-A'
    
// ];

const teamUrls = [
    'https://fbref.com/pt/equipes/289e8847/Mirassol-Futebol-Clube-Stats'
    
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
