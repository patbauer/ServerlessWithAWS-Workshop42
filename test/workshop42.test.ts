import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Workshop42Stack } from '../lib/workshop42-stack';

// Example test to check if the dynamo db is present in the generated cloud formation template

test('DynamoDB Table Created', () => {
    const app = new cdk.App();

    const stack = new Workshop42Stack(app, 'MyTestStack', {
        userId: 'dev',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
    });
});
