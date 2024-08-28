class EventProbabilityCalculator {
    calculateEventProbabilities(eventsArray, eventDescription, part) {
        const totalMatches = eventsArray.length;
        const filteredEvents = eventsArray.filter(event => event.eventDescription === eventDescription && event.parte === part);

        const probability = (filteredEvents.length / totalMatches) * 100;

        return probability;
    }

    extractEventsFromMatches(matches, teamName) {
        const eventsArray = [];

        matches.forEach(match => {
            match.events.forEach(event => {
                if (event.teamName === teamName) {
                    eventsArray.push(event);
                }
            });
        });

        return eventsArray;
    }
}

export default EventProbabilityCalculator;
