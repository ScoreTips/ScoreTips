import * as cheerio from 'cheerio';

export class EventsExtractor {
    extractEvents(html, homeTeam, awayTeam)  {
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
}

export const eventsExtractor = new EventsExtractor();
