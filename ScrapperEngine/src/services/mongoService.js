import { MongoClient } from 'mongodb';
import { logMessage } from '../utils/logger.js';
import dotenv from "dotenv";
dotenv.config({ path: '../constants/.env' });

export class MongoService {
    constructor(collection) {
        // this.client = new MongoClient(process.env.mongoUri);
        
        this.client = new MongoClient(process.env.mongoUri);
        this.database = this.client.db('matchesData');
        // this.collection = "Inglaterra_Premier_League"
        this.collection = collection

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
            const collection = this.database.collection(this.collection);
            const query = { match_id: matchId };
            const existingMatch = await collection.findOne(query);
            console.log('collection:', this.collection)
            return existingMatch !== null;
        } catch (error) {
            logMessage(`Failed to check match existence: ${error.message}`);
            throw error;
        }
    }
    
    async saveMatchData(matchData) {
        try {
            await this.connect();
            const collection = this.database.collection(this.collection);
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