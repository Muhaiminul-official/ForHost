import admin from 'firebase-admin';

const serviceAccount = {
  "type": "service_account",
  "project_id": "bloodlink-61bb7",
  "private_key_id": "0ef0b0179bda925900d772f4c498a20e1997526a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDqIsejw7IhUXFV\nwToVgSYKSx12p6LWUz89jZG8Ye4DabyTBdUn40blW/gWwMeIbahkr4bwVmn4oQdy\nuW/oDk8p392Hnz1ly6QeSz4V2OF0B7YEq0n+UY4GS68/iCTUQjiehwW+JhCLk4xQ\nXHsUE9otJpUAkoWxe+cCEgxnalZs869L6X4wjJSYETA5FicAMMmv5uCXL7WGwy8a\nUQjLXUkQyZy8VOUsaIxmfwidkvq2WZTttxhvMlF76aK2CKe/SqxHk0GL6afdX3VW\nZvD02qoHd0vtrpXaSXWRztlQz6dbM8ioLyIphsnf6Y5UgtVzwTXenRWKVfCbxeun\n1jxg4UdbAgMBAAECggEAGZlq5Ytohv8OGrexP5eqzpZO5uHGSpO4huTbKdM1QFdH\nwHVzTFSrtDkdg3NZfZ+ruTJ92PpBxObqVw9SXnduDWCGKqVtA5vD2nIUnDPl1pdf\nPdxyjyVgl2ygARzEFhcVdLPDm3oy9efQgBrUdCoFgUlGIlVi27h11gKeK5JzV58J\nmfhamTHxpvFJsGs/rFa/38lo861MwEaZmgIMH79cJjeSQyYJgndpk6SYGUmfPjXn\nLbOI7ZqJPjE8E5KOzHTGZnoQZbKadfCGPKWScyO8ZiV6L7n52MfB17YwsMxG+TIA\nAP2jgQ4mZ0Ed/rmHpvjv7Ef9vXwfy6fY66W4LQX+aQKBgQD9tzoQtUSLWHnYlsNk\n3HrLkeMnTwVeDa0rFtCmI528U3dkpy0jrewiB5DpcU34jz7Qe/2HtTaeqlBo8YTV\nFP8UlX/MTpE1m7oKfAMBj5Tl1OD4tgSzAq/bUURix8coZ6hmOixiTXWZLmFH12Hd\nfDcDdY6zSm8x7eDaEOv1P0fweQKBgQDsPmy0nJzpFJ0yYa2N+a5gD5IfPjBK8rSF\nkqc7xib7fVzG7Zzqgh1zyGhDTAFAZQytV9ngJGD0Hnu5P1/ZxjsgrkpNktbuYzGx\nMWROi9U5y+CSO21PDKH1TYbAPW/BHkZMud8TlA3sNW9LHvzoKGSZJxb+QFW84ghq\n6BTRHfwJcwKBgQDYqMgoDnN7P1HF2HEBR5qBDpLZNYzS1YEEY9ZHmfCQKwKw7GYK\nqvIT2TwxbXV1BfZRGSDW67O56J0EEQMq52Qwkr3wnUM5cUN8wovaoF85qQF4wg7f\nQzMjaZGpfQqggWx358ORKq564fVm4RGMjw93n8L9blnoXEgAUCT/aEupmQKBgQDo\nQrc9Gnxp6wphbgbjfoYhiy1t6gYwqU0xxW0FJ1tMBYQhT5rmM+Yg3vcisqbIWJCO\nG8DozNtFJnMdPWFPCcU37CLBAYyt8nf4bUbgsjmACSFQo3xkK1dPhFjmx4AHrWwQ\nIu1eokDN6frxMBYVaSD+MaA5d6bTfKYp9OICdihEYQKBgGafqCEm8dus8q854W7W\n265/JDRX4xXEIDLbLxTqhQvy7EuvUP0g+WVrPxzxqdKwamIQPgBuVzMoJZqw7u3a\nbFOffE9TsLk6V//CANRLN6cwByxeZCLpL8zVmdJr8aPjmvb7R3Pz1RUUhqwdk0Nb\nhTIWta9CHkavYRgSD/j+A2gA\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@bloodlink-61bb7.iam.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const sendPushNotification = async (user: any, payload: { title: string, message: string, link?: string }) => {
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

    const tokens = user.pushSubscriptions;

    const message = {
      notification: {
        title: payload.title,
        body: payload.message
      },
      data: {
        title: payload.title,
        message: payload.message,
        link: payload.link || '/'
      },
      tokens: tokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        
        // Cleanup expired/invalid tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            user.pushSubscriptions = tokens.filter((t: string) => !failedTokens.includes(t));
            await user.save();
        }
    } catch (error) {
        console.error('Error sending Firebase push notification:', error);
    }
};
