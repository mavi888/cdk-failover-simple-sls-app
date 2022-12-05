import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createRestApi } from './api-conf';
import { createTable } from './persistance';
import { addApiGatewayDomainName } from './domain-conf';

interface GlobalApplicationStackProps extends StackProps {
	hostedZoneId: string;
	domainName: string;
	replicationRegions: string[];
	env: any;
}

export class GlobalApplicationStack extends Stack {
	constructor(
		scope: Construct,
		id: string,
		props: GlobalApplicationStackProps
	) {
		super(scope, id, props);

		const region = props.env.region;

		// Create global table
		const table = createTable(this, {
			region: region,
			tableName: `GlobalApplicationTable`,
			replicationRegions: props.replicationRegions,
		});

		// Create API integration with Table
		const restApi = createRestApi(this, { table, region });

		// Configure the domain name with the api gateway
		addApiGatewayDomainName(this, {
			domainName: props.domainName,
			restApi,
			hostedZoneId: props.hostedZoneId,
			region,
		});
	}
}
