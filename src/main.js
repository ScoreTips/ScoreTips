import { scrapeAndSave } from './services/scrapeService.js';

const url = 'https://fbref.com/pt/equipes/abdce579/2024/partidas/c24/schedule/Palmeiras-Resultados-e-Calendarios-Serie-A';
const homeTeam = 'Palmeiras';   

scrapeAndSave(url, homeTeam);
