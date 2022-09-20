#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GlobalApplicationStack } from '../lib/global-app-stack';

import * as config from '../config.json';

const mainRegion = config.mainRegion;
const replicatedRegions = config.replicatedRegions;
const domain = config.domain;
const hostedZoneId = config.hostedZone;

const app = new cdk.App();

new GlobalApplicationStack(app, 'GlobalApplicationEurope', {
	env: {
		region: 'eu-west-1',
	},
	hostedZoneId: hostedZoneId!,
	domainName: domain,
	replicationRegions: replicatedRegions,
});

new GlobalApplicationStack(app, 'GlobalApplicationUS', {
	env: {
		region: 'us-east-1',
	},
	hostedZoneId: hostedZoneId!,
	domainName: domain,
	replicationRegions: replicatedRegions,
});
