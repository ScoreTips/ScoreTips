class MatchRepository {
    constructor(mongoService) {
        this.mongoService = mongoService;
    }

    async getAllTeams() {
        const collection = this.mongoService.getCollection('Brazil_SerieA');
        const teams = await collection.distinct('home_team');
        return teams;
    }

    async getMatchesByTeam(teamName) {
        const collection = this.mongoService.getCollection('Brazil_SerieA');
        const matches = await collection.find({
            $or: [
                { "home_team": teamName },
                { "away_team": teamName }
            ]
        }).toArray();
        return matches;
    }
}

export default MatchRepository;
