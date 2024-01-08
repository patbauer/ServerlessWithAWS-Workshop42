#!/usr/bin/env node
import 'source-map-support/register';
import { Workshop42Stack } from '../lib/workshop42-stack';
import { AwsSolutionsChecks } from 'cdk-nag';
import { App, Aspects, Tags } from 'aws-cdk-lib';
import { userInfo } from 'os';

// Identify the current user name to prevent deployment errors due to duplicate resource names
const id = userInfo().username;
const workshopTags = new Map<string, string>([['Name', `Workshop42-${id}`]]);

// Initialize a new CDK application
const app = new App();

// Check Best practices based on AWS Solutions Security Matrix
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

// Tag each resource used in our stack with our id
workshopTags.forEach((v: string, k: string) => {
    Tags.of(app).add(k, v);
});

// Create the stack itself
new Workshop42Stack(app, `Workshop42Stack-${id}`, {
    userId: id,
});
