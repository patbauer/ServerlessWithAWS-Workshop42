// Example Lambda Code

export async function handler(event: any): Promise<any> {
    console.log('Hello World');

    // Logging the received event
    console.log('Received event:', JSON.stringify(event, null, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello World - Get Setting Lambda' }),
    };
}
