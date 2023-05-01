import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event: {
  pathParameters: { userId?: string; };
}): Promise<{ statusCode: number; body: string }> => {
  const { userId } = event.pathParameters ?? {};

  if (userId === undefined) {
    return {
      statusCode: 400,
      body: 'bad request',
    };
  }

  const { Items } = await client.send(
    new QueryCommand({
      KeyConditionExpression: 'PK = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
      TableName: process.env.TABLE_NAME,
    }),
  );

  if (Items === undefined) {
    return {
      statusCode: 404,
      body: 'not found',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      user_id: userId,
      content: Items,
    }),
  };
};