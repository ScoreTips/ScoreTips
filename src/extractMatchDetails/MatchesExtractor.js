import * as cheerio from 'cheerio';

export class MatchesExtractor {
    extractMatches(html, homeTeam) {
        const $ = cheerio.load(html);
        const scripts = $('script[type="application/ld+json"]');
        const matchesData = [];
        scripts.each((index, script) => {
            const jsonData = JSON.parse($(script).html() || '{}');
            if (Array.isArray(jsonData)) {
                jsonData.forEach(event => {
                    const matchData = this.extractEventData(event, homeTeam);
                    if (matchData) {
                        matchesData.push(matchData);
                    }
                });
            } else {
                const matchData = this.extractEventData(jsonData, homeTeam);
                if (matchData) {
                    matchesData.push(matchData);
                }
            }
        });

        return matchesData;
    }

    extractEventData(event, homeTeam) {
        const description = event.description || '';
        const team1 = event.competitor?.[0]?.name || '';
        const team2 = event.competitor?.[1]?.name || '';
    
        const isHome = team1 === homeTeam || description.startsWith(`${homeTeam} vs`);
        const home = isHome ? homeTeam : (team1 !== homeTeam ? team1 : team2);
        const away = isHome ? (team1 === home ? team2 : team1) : homeTeam;
    
        const homeOrAway = isHome ? 'Casa' : 'Fora';
        
        return {
            homeOrAway: homeOrAway,
            homeTeam: home,
            awayTeam: away,
            opponent: homeOrAway === 'Casa' ? away : home,
            url: event.url || '',
            location: event.location?.name || '',
            date: event.startDate || ''
        };
    }    
}
