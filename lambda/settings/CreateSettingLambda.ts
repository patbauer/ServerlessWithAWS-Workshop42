import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SettingRequestBody } from './interfaces/api-interfaces';

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
    maxAttempts: 10, // Retry configuration
});

// Create DynamoDB Document Client
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    // Logging the received event
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // Parse the request body
        const requestBody: SettingRequestBody = JSON.parse(event.body || '{}');

        // Validation (you can expand this as needed)
        if (!requestBody.settingId || !requestBody.apiDetails?.baseUrl || !requestBody.description) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' }),
            };
        }

        const { settingId, ...remainingBody } = requestBody;

        // Prepare the item for DynamoDB
        const dynamoItem = {
            TableName: process.env.DYNAMODB,
            Item: {
                PK: `SettingId#${settingId}`,
                SK: `BaseUrl#${requestBody.apiDetails.baseUrl}`,
                ...remainingBody,
            },
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        };

        try {
            // Use PutCommand to insert the item into DynamoDB
            const data = await docClient.send(new PutCommand(dynamoItem));
            console.log('Added item:', JSON.stringify(data, null, 2));

            // Return success response
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Setting created successfully' }),
            };
        } catch (err) {
            console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));

            // Return error response
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Unable to add item' }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
}
