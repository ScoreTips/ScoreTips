import { MongoClient } from 'mongodb';

class MongoService {
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log(`Conectado ao banco de dados ${this.dbName}.`);
    }

    async disconnect() {
        await this.client.close();
        console.log('Desconectado do MongoDB.');
    }

    getCollection(collectionName) {
        return this.db.collection(collectionName);
    }
}

export default MongoService;
