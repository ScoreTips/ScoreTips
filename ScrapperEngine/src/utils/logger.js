import { format } from 'date-fns';

export async function logMessage(message) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    console.log(`[${timestamp}] ${message}`);
}
