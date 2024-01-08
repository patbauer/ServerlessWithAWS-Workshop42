import {
    AccessLogFormat,
    LambdaIntegration,
    LogGroupLogDestination,
    MethodLoggingLevel,
    RequestValidator,
    RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { NagSuppressions } from 'cdk-nag';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { StackProps, Stack } from 'aws-cdk-lib';
import path = require('path');

export interface Workshop42StackProps extends StackProps {
    readonly userId: string;
}

export class Workshop42Stack extends Stack {
    // Define Lambda functions as class properties
    private readonly createSettingLambda: NodejsFunction;
    // ...

    constructor(scope: Construct, id: string, props: Workshop42StackProps) {
        super(scope, id, props);

        // Define the log group for API Gateway
        const workshop42APILogGroup = new LogGroup(this, `Workshop42AccessLogGroup-${props.userId}`, {
            retention: RetentionDays.ONE_WEEK,
        });

        // Define the API Gateway REST API with logging enabled
        const api = new RestApi(this, `Workshop42Api-${props.userId}`, {
            restApiName: `Workshop42Service-${props.userId}`,
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(workshop42APILogGroup),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                stageName: `Workshop42-${props.userId}`,
                loggingLevel: MethodLoggingLevel.INFO,
            },
        });

        // Define the DynamoDB table
        const workshop42Table = new Table(this, `Workshop42Table-${props.userId}`, {
            partitionKey: {
                name: 'PK',
                type: AttributeType.STRING,
            },
            pointInTimeRecovery: true,
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING,
            },
            deletionProtection: false,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        // Example: Add an additional gsi to the DynamoDB table
        workshop42Table.addGlobalSecondaryIndex({
            indexName: 'GSI1',
            nonKeyAttributes: ['column1', 'column2'],
            partitionKey: {
                name: 'GSI1PK',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.INCLUDE,
            sortKey: {
                name: 'GSI1SK',
                type: AttributeType.STRING,
            },
        });

        // Example: Define ParameterStore entry
        const parameterWorkshop42 = new StringParameter(this, `ParameterWorkshop42-${props.userId}`, {
            parameterName: `/${props.userId}/parameter/workshop42`,
            description: 'Secret configuration for 42 Workshop',
            // You can specify the value as needed
            stringValue: 'I am a stored parameter',
        });

        // Example: Define SecretsManager entry
        const secretWorkshop42 = new Secret(this, `SecretWorkshop42-${props.userId}`, {
            secretName: `/${props.userId}/secret/workshop42`,
            description: 'Secret configuration for 42 Workshop',
            // You can specify the secret value as a JSON object if needed
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ key: 'initialValue' }),
                generateStringKey: 'password',
            },
        });

        // Example: Define  a request validator for some API Gateway endpoints
        const requestValidator = new RequestValidator(this, `RequestValidator-${props.userId}`, {
            restApi: api,
            validateRequestBody: true,
            validateRequestParameters: true,
        });

        // Define Lambda functions for each operation
        this.createSettingLambda = new NodejsFunction(this, `CreateSettingLambda-${props.userId}`, {
            runtime: Runtime.NODEJS_18_X,
            entry: path.resolve(__dirname, '../lambda/settings/CreateSettingLambda.ts'),
            bundling: {
                minify: true,
                sourceMap: true,
            },
            environment: {
                DYNAMODB: workshop42Table.tableName,
            },
        });

        // You can add additional lambdas here
        // ...

        // You can grant permissions to each lambda
        workshop42Table.grantWriteData(this.createSettingLambda);

        // You can modify the api here

        // Create API interaction settings endpoints
        const settings = api.root.addResource('settings');
        const postSettingsMethod = settings.addMethod('POST', new LambdaIntegration(this.createSettingLambda));
        // const getSettingsMethod = settings.addMethod('GET', new LambdaIntegration(this.listSettingsLambda));

        // // Specific API setting endpoint
        // const setting = settings.addResource('{id}');
        // const getSettingMethod = setting.addMethod('GET', new LambdaIntegration(this.getSettingLambda));
        // const putSettingMethod = setting.addMethod('PUT', new LambdaIntegration(this.updateSettingLambda));
        // const deleteSettingMethod = setting.addMethod('DELETE', new LambdaIntegration(this.deleteSettingLambda));

        // // Trigger endpoint
        // const trigger = api.root.addResource('trigger');
        // const triggerWithId = trigger.addResource('{id}');
        // const postTriggerMethod = triggerWithId.addMethod('POST', new LambdaIntegration(this.triggerApiCallLambda));

        // // List available external APIs endpoint
        // const listExternalApisMethod = api.root
        //     .addResource('external-apis')
        //     .addMethod('GET', new LambdaIntegration(this.listExternalApisLambda));

        // list of all api methods so we can suppress the warnings easier
        const allApiMethods = [
            postSettingsMethod,
            // ...
        ];

        // Authorization with Cognito and APIGateway authorizers
        NagSuppressions.addResourceSuppressions(allApiMethods, [
            {
                id: 'AwsSolutions-COG4',
                reason: 'Not needed in this example',
            },
            {
                id: 'AwsSolutions-APIG4',
                reason: 'Not needed in this example',
            },
        ]);

        NagSuppressions.addStackSuppressions(this, [
            {
                id: 'AwsSolutions-IAM4',
                reason: 'Not needed.',
            },
            {
                id: 'AwsSolutions-IAM5',
                reason: 'Not needed.',
            },
            {
                id: 'AwsSolutions-SMG4',
                reason: 'Not needed.',
            },
        ]);
    }
}
