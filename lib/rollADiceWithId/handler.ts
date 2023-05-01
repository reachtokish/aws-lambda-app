export const handler = async ({ pathParameters: { id } }: { pathParameters: { id: string } }): Promise<{ statusCode: number; body: any }> => {
  const randomNumber = Math.floor(Math.random() * Number(id)) + 1;

  return Promise.resolve({ statusCode: 200, body: randomNumber });
};