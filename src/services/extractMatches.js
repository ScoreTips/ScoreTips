import * as cheerio from 'cheerio';

export function extractMatches(html, homeTeam) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    const matchesData = [];

    scripts.each((index, script) => {
        const jsonData = JSON.parse($(script).html());
        if (Array.isArray(jsonData)) {
            jsonData.forEach(event => matchesData.push(extractEventData(event, homeTeam)));
        } else {
            matchesData.push(extractEventData(jsonData, homeTeam));
        }
    });

    return matchesData;
}

function extractEventData(event, homeTeam) {
    const description = event.description || '';
    const team1 = event.competitor?.[0]?.name || '';
    const team2 = event.competitor?.[1]?.name || '';

    const isHome = description.startsWith(`${homeTeam} vs`);
    const home = isHome ? homeTeam : team1 !== homeTeam ? team1 : team2;
    const away = isHome ? team2 !== homeTeam ? team2 : team1 : homeTeam;
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
