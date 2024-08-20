import { scrapeAndSave } from './services/scrapeService.js';

const url = 'https://fbref.com/pt/equipes/6f7e1f03/2024/partidas/c24/schedule/Internacional-Resultados-e-Calendarios-Serie-A';
const homeTeam = 'Internacional';   

scrapeAndSave(url, homeTeam);
