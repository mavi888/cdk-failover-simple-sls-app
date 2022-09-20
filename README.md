# CDK Demo App for a Global Serverless Applications

_Infrastructure as code framework used_: AWS CDK
_AWS Services used_: AWS DynamoDB, Route53, API Gateway

## Summary of the demo

In this demo you will see:

- How to configure a global table using DynamoDB
- How to create a API Gateway that integrates directly to DynamoDB
- How to attach a healthcheck to the API Gateway
- How to shift traffic to one place or another depending on the location of the user
- How to send traffic to the right stack depending on the latency.

This demo is part of a video posted in FooBar Serverless channel. You can check the video to see the whole demo.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the AWS Pricing page for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements

- AWS CLI already configured with Administrator permission
- AWS CDK - v2
- NodeJS 16.x installed
- CDK bootstrapped in your account (in the regions where you are going to deploy this)

## Deploy this demo

1. Configure this project by changing the `config.json`file to match your project. For running this demo you need to have a domain in the account that you are going to deploy this app.

1. Deploy the project to the cloud, this will deploy the app in 2 regions - Ireland and Virginia.

```
cdk synth
cdk deploy --all
```

3. When asked about functions that may not have authorization defined, answer (y)es. The access to those functions will be open to anyone, so keep the app deployed only for the time you need this demo running.

## How to test

After deploying this application.

1. Open a REST client and do

```
POST https://yourdomain.com/data/
```

And pass a JSON as a body.

That returns a requestId, save that to see the result.

```
{
  "requestId": "8f618771-523c-47c2-8ce8-c1df35b01ac6"
}
```

2. In a REST client do

```
GET https://yourdomain.com/data/<requestId>
```

That will return the Item that was stored in the database.
You can see what region it was stored from. The region will be the closest to you.
You can change your location by connecting to a VPN and moving closer to the other region.

```
{
  "Item": {
    "region": {
      "S": "eu-west-1"
    },
    "pk": {
      "S": "8f618771-523c-47c2-8ce8-c1df35b01ac6"
    },
    "name": {
      "S": "marcia"
    }
  }
}
```

## Delete the app

To delete the app in all the regions. You might need to delete manually the Replicated Global Table:

```
cdk destroy --all
```

## Links related to this code

- Video with more details:

### AWS CDK useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
