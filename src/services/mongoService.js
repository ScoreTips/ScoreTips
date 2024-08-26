import { MongoClient } from 'mongodb';
import { logMessage } from '../utils/logger.js';

export class MongoService {
    constructor() {
        this.client = new MongoClient("mongodb+srv://scoretipsadmin:mq87igW7MQJX7tTp@scoretips.ogtez.mongodb.net/?retryWrites=true&w=majority&appName=ScoreTips");
        this.database = this.client.db('brasileirao_statistics');
    }

    async connect() {
        try {
            if (!this.client.topology?.isConnected()) {
                await this.client.connect();
                logMessage('Connected to MongoDB');
            }
        } catch (error) {
            logMessage(`Failed to connect to MongoDB: ${error.message}`);
            throw error;
        }
    }

    async checkMatchExists(match) {
        try {
            let matchId = `${match.date}_${match.homeTeam}_vs_${match.awayTeam}`
            await this.connect();
            const collection = this.database.collection('teste');
            const query = { match_id: matchId };
            const existingMatch = await collection.findOne(query);
            return existingMatch !== null;
        } catch (error) {
            logMessage(`Failed to check match existence: ${error.message}`);
            throw error;
        }
    }

    async saveMatchData(matchData) {
        try {
            await this.connect();
            const collection = this.database.collection('teste');
            await collection.insertOne(matchData);
        } catch (error) {
            logMessage(`Failed to save match data: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            logMessage('Disconnected from MongoDB');
        } catch (error) {
            logMessage(`Failed to disconnect from MongoDB: ${error.message}`);
            throw error;
        }
    }
}