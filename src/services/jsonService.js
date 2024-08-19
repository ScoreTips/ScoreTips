import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logMessage } from '../utils/logger.js';

export function saveMatchToJSON(folderName, fileName, events) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dir = path.join(__dirname, '..', '..', folderName);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logMessage(`Created directory: ${dir}`);
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
    logMessage(`Saved match details to ${fileName}`);
}

export function saveAllMatchesToJSON(folderName, fileName, matchDetails) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dir = path.join(__dirname, '..', '..', folderName);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logMessage(`Created directory: ${dir}`);
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(matchDetails, null, 2), 'utf-8');
    logMessage(`Saved all matches to ${fileName}`);
}
