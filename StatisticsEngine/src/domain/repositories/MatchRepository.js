class MatchRepository {
    constructor(mongoService) {
        this.mongoService = mongoService;
    }

    async getAllTeams() {
        const collection = this.mongoService.getCollection('International');
        const teams = await collection.distinct('home_team');
        return teams;
    }

    async getMatchesByTeam(teamName) {
        const collection = this.mongoService.getCollection('International');
        const matches = await collection.find({
            $or: [
                { "home_team": teamName },
                { "away_team": teamName }
            ]
        }).toArray();
        return matches;
    }
    // Implementa o método getTeamPlayers
    async getTeamPlayers(teamName) {
        const collection = this.mongoService.getCollection('International');
        console.log(`Buscando jogadores para o time: ${teamName}`);
        
        const matches = await collection.find({
            $or: [
                { "home_team": teamName },
                { "away_team": teamName }
            ]
        }).toArray();
        const players = [];
    
        matches.forEach(match => {
            
            if (match.player_stats && Array.isArray(match.player_stats)) {
                match.player_stats.forEach(player => {
                    let playerTeam = match.home_team === teamName ? match.home_team : match.away_team;
                    if(playerTeam == 'Central Córdoba (SdE)'){
                        playerTeam = 'Cen. Córdoba–SdE'
                    } 
                    
                    // Verifica se o jogador realmente pertence ao time atual
                    if (player.team === playerTeam) {
                        players.push({
                            name: player.name,
                            position: player.position,
                            team: player.team,  // Agora usa o `player.team` para garantir que está correto
                            goals: player.goals,
                            shots: player.totalShots,
                            shotsOnTarget: player.shotsOnTarget,
                            tackles: player.tackles,
                            yellowCards: player.yellowCards,
                            redCards: player.redCards
                        });
                    }
                });
            }
        });
    
        if (!players.length) {
            console.log(`Nenhum jogador encontrado para o time: ${teamName}. Verifique se os dados estão formatados corretamente.`);
        } else {
            console.log(`Encontrados ${players.length} jogadores para o time: ${teamName}`);
        }
    
        return players;
    }
    
    
    // Implementa o método getPlayerEventStats
    async getPlayerEventStats(teamName, playerName) {
        const collection = this.mongoService.getCollection('PlayerEvents');
        const query = { teamName: teamName, playerName: playerName };
        const eventStats = await collection.find(query).toArray();
    
        const stats = {
            goals: [],
            shots: [],
            shotsOnTarget: [],
            tackles: [],
            yellowCards: [],
            redCards: []
        };
    
        eventStats.forEach(event => {
            if (event.eventDescription === 'Gol') stats.goals.push(1);  // Considera cada gol como 1 ocorrência
            if (event.eventDescription === 'Chute') stats.shots.push(1);
            if (event.eventDescription === 'Chute ao Gol') stats.shotsOnTarget.push(1);
            if (event.eventDescription === 'Desarme') stats.tackles.push(1);
            if (event.eventDescription === 'Cartão Amarelo') stats.yellowCards.push(1);
            if (event.eventDescription === 'Cartão Vermelho') stats.redCards.push(1);
        });
    
        return stats;
    }
    

    // Implementa o método getGoalkeeperStats
    async getGoalkeeperStats(teamName, goalkeeperName) {
        const collection = this.mongoService.getCollection('GoalkeeperStats');
        const query = { teamName: teamName, playerName: goalkeeperName };
        const goalkeeperStats = await collection.findOne(query);
        return goalkeeperStats ? {
            saves: goalkeeperStats.saves || [],
            cards: goalkeeperStats.cards || [],
            goalsConceded: goalkeeperStats.goalsConceded || []
        } : null;
    }
}

export default MatchRepository;
