import * as cheerio from 'cheerio';
import { fetchHTML } from './fetchService.js';
import { saveMatchToJSON, saveAllMatchesToJSON } from './jsonService.js';
import { logMessage } from '../utils/logger.js';

export async function scrapeAndSave(url) {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    const homeTeam = extractTeamFromURL(url);

    try {
        const html = await fetchHTML(url, userAgent);
        const eventsData = extractData(html, homeTeam);
        const matchDetails = eventsData.map(event => ({
            homeOrAway: event.homeOrAway,
            opponent: event.opponent,
            url: event.url,
            location: event.location,
            date: event.date
        }));

        saveAllMatchesToJSON(homeTeam.replace(/\s+/g, '_').toUpperCase(), `${homeTeam}Matches2024.json`, matchDetails);

        for (const event of eventsData) {
            if (event.url && event.opponent) {
                const matchHtml = await fetchHTML(event.url, userAgent);
                const events = extractEventDetails(matchHtml, event.homeTeam, event.awayTeam);
                const statsExtra = extractStatsExtra(matchHtml, event.homeTeam, event.awayTeam);
                
                const finalData = [
                    { events },
                    { statsExtra }
                ];

                saveMatchToJSON(homeTeam.replace(/\s+/g, '_').toUpperCase(), `${event.homeTeam}vs${event.awayTeam}.json`, finalData);
                await sleep(2000); // Delay para evitar sobrecarga do servidor
            }
        }

        logMessage('All data saved successfully.');
    } catch (error) {
        logMessage(`Error during scraping and saving: ${error.message}`);
    }
}

function extractTeamFromURL(url) {
    const parts = url.split('/');
    const teamName = parts[parts.length - 1].split('-')[0];
    return teamName.charAt(0).toUpperCase() + teamName.slice(1);
}

function extractData(html, homeTeam) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    const eventsData = [];

    scripts.each((index, script) => {
        const jsonData = JSON.parse($(script).html());
        if (Array.isArray(jsonData)) {
            jsonData.forEach(event => eventsData.push(extractEventData(event, homeTeam)));
        } else {
            eventsData.push(extractEventData(jsonData, homeTeam));
        }
    });

    return eventsData;
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

function extractEventDetails(html, homeTeam, awayTeam) {
    const $ = cheerio.load(html);
    const events = [];

    $('#events_wrap .event').each((index, element) => {
        let time = $(element).find('div:first-child').text().trim().split('’')[0].replace(/\D/g, '');
        time = time || "0";

        const parte = parseInt(time, 10) >= 46 ? 'Segunda Parte' : 'Primeira Parte';

        const eventType = $(element).find('.event_icon').attr('class').split(' ')[1];
        const playerName = $(element).find('a').first().text().trim();
        const eventClass = $(element).attr('class').split(' ')[1];
        const teamName = eventClass === 'a' ? homeTeam : awayTeam;

        let eventDescription;
        if (eventType === 'yellow_card') {
            eventDescription = 'Cartão Amarelo';
        } else if (eventType === 'red_card') {
            eventDescription = 'Cartão Vermelho';
        } else if (eventType === 'goal') {
            eventDescription = 'Gol';
        }

        if (eventDescription) {
            events.push({ teamName, parte, time, eventDescription, playerName });
        }
    });

    return events;
}

function extractStatsExtra(html, homeTeam, awayTeam) {
    const $ = cheerio.load(html);
    const statsExtra = [];

    $('#team_stats_extra > div').each((index, element) => {
        const stats = {};

        const homeStat = $(element).find('div.th').first().text().trim();
        const awayStat = $(element).find('div.th').last().text().trim();

        if (homeStat === homeTeam && awayStat === awayTeam) {
            $(element).find('div').each((i, el) => {
                const value = $(el).text().trim();
                if (i % 3 === 0) {
                    stats[homeTeam] = value;
                } else if (i % 3 === 1) {
                    stats['description'] = value;
                } else {
                    stats[awayTeam] = value;
                }
            });

            statsExtra.push(stats);
        }
    });

    return statsExtra;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
