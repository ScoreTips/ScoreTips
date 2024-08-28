import fetch from 'node-fetch';

export class FetchService {
    async fetchHTML(url) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.110 Safari/537.36 Edg/114.0.1823.51`,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            if (response.status === 429) {
                console.error("Erro 429: Limite de requisições atingido. A automação será encerrada.");
                process.exit(1); // Encerra a automação
            }

            if (!response.ok) { // Verifica qualquer outro status de erro
                console.error(`Erro ${response.status}: ${response.statusText} ao tentar acessar a URL: ${url}`);
                return null; // Retorna null ou outra indicação de erro, dependendo do seu fluxo de trabalho
            }

            return await response.text();
        } catch (error) {
            console.error(`Erro ao tentar acessar a URL: ${url}. Detalhes do erro: ${error.message}`);
            return null; // Retorna null ou outra indicação de erro, dependendo do seu fluxo de trabalho
        }
    }
}
