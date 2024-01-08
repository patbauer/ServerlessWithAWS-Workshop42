# Welcome to your CDK TypeScript project

This is a example project for the ServerlessWithAWS Workshop at 42 Heilbronn.

## Getting started

To get started run the command `npm ci` in your terminal to install the required dependencies. 

Run `aws configure` and follow the instruction on how to setup your aws environment. The required 
client credentials can be obtained after logging in to the AWS Console from your favorite browser.

To deploy the project the first time to AWS, run `cdk synth` to synthesize the CloudFormation template 
followed by `cdk deploy` to deploy it to you default AWS account. Use the --profile <YourProfile> option
to synth/ deploy for a specific profile.

## Useful commands

- `npm run build` - Compile TypeScript to JavaScript.
- `npm run watch` - Watch for changes and compile.
- `npm run test` - Perform the Jest unit tests.
- `cdk deploy` - Deploy this stack to your default AWS account/region.
- `cdk diff` - Compare deployed stack with current state.
- `cdk synth` - Emits the synthesized CloudFormation template.
- `npm run lint` - Run ESLint to identify and report on patterns found in TypeScript code, with no automatic fixes.
- `npm run lint-fix` - Run ESLint and automatically fix problems in TypeScript code.
- `npm run prettier-format` - Format all TypeScript files in the project according to the rules specified in `.prettierrc`.

### Linting and Formatting

- Running `npm run lint` helps in identifying potential issues in the code that might lead to bugs or inconsistencies.
- `npm run lint-fix` not only identifies these issues but also attempts to fix them automatically.
- `npm run prettier-format` ensures that your codebase follows a consistent style, making it more readable and maintainable.


