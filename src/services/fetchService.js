import fetch from 'node-fetch';

export async function fetchHTML(url, userAgent) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed with status code ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        throw new Error(`Error fetching data from ${url}: ${error.message}`);
    }
}
