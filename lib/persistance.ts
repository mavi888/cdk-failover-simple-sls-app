import { Construct } from 'constructs';

import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { CfnOutput } from 'aws-cdk-lib';

interface CreateTableProps {
	region: string;
	tableName: string;
	replicationRegions: string[];
}

export function createTable(scope: Construct, props: CreateTableProps) {
	let globalTable;

	// check if we are in the main region
	if (props.region === 'eu-west-1') {
		globalTable = new Table(scope, 'Table', {
			tableName: props.tableName,
			partitionKey: { name: 'pk', type: AttributeType.STRING },
			replicationRegions: props.replicationRegions,
		});

		new CfnOutput(scope, 'tableName', {
			value: globalTable.tableName,
		});

		return globalTable;
	} else {
		return Table.fromTableName(scope, 'Table', props.tableName);
	}
}
