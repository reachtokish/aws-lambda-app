import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

export class MyFirstLamdaAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new cdk.aws_lambda_nodejs.NodejsFunction(this, 'myFirstLambda', {
      entry: path.join(__dirname, 'myFirstLambda', 'handler.ts'),
      handler: 'handler',
    });

    const myFirstApi = new cdk.aws_apigateway.RestApi(this, 'myFirstApi', {});
    const diceResource = myFirstApi.root.addResource('dice');

    const diceWithId = diceResource.addResource('{id}');

    const rollADiceFunction = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'rollADiceFunction', {
      entry: path.join(__dirname, 'rollADice', 'handler.ts'),
      handler: 'handler',
    });

    const rollADiceWithIdFunction = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'rollADiceWithIdFunction', {
      entry: path.join(__dirname, 'rollADiceWithId', 'handler.ts'),
      handler: 'handler',
    });
    
    diceResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(rollADiceFunction));
    diceWithId.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(rollADiceWithIdFunction));

    const notesTable = new cdk.aws_dynamodb.Table(this, 'notesTable', {
      partitionKey: {
        name: 'PK',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const createNote = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'createNote', {
      entry: path.join(__dirname, 'createNote', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName, // VERY IMPORTANT
      },
    });
    
    const getNote = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'getNote', {
      entry: path.join(__dirname, 'getNote', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName, // VERY IMPORTANT
      },
    });

    const getAllNotes = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'getAllNotes', {
      entry: path.join(__dirname, 'getAllNotes', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName, // VERY IMPORTANT
      },
    });
    
    notesTable.grantWriteData(createNote); // VERY IMPORTANT
    notesTable.grantReadData(getNote); // VERY IMPORTANT
    notesTable.grantReadData(getAllNotes); // VERY IMPORTANT

    // myFirstApi was already defined in the previous article
    const notesResource = myFirstApi.root.addResource('notes').addResource('{userId}');

    notesResource.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(createNote));

    notesResource.addResource('{id}').addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(getNote));

    notesResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(getAllNotes));
  }
}
