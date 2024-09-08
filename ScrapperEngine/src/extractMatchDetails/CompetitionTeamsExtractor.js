import * as cheerio from "cheerio";
import { FetchService } from "../services/fetchService.js";
import { logMessage } from "../utils/logger.js";

export class CompetitionTeamsExtractor {
    constructor() {
        this.fetchService = new FetchService();
    }

    async extractTeamLinks(competitionUrl) {
        try {
            // Faz a requisição HTTP para o URL da competição
            const html = await this.fetchService.fetchHTML(competitionUrl);
            const $ = cheerio.load(html);

            const teamLinks = [];

            // Seleciona os links dos times presentes na tabela (ajustando o seletor conforme o HTML)
            $("table tbody tr td:nth-child(2) a").each((i, elem) => {
                const teamName = $(elem).text().trim();
                const teamUrlPart = $(elem).attr("href");

                if (teamUrlPart && teamUrlPart.includes("/equipes/")) {
                    const fullTeamUrl = `https://fbref.com${teamUrlPart}`;
                    teamLinks.push(fullTeamUrl);
                }
            });

            return teamLinks;
        } catch (error) {
            logMessage(`Erro ao extrair os links dos times: ${error.message}`);
            throw error;
        }
    }
}