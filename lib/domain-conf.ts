import {
	DomainName,
	RestApi,
	SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	ARecord,
	CfnRecordSet,
	HostedZone,
	RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface AddApiGatewayDomainNameProps {
	region: string;
	domainName: string;
	restApi: RestApi;
	hostedZoneId: string;
}

export function addApiGatewayDomainName(
	scope: Construct,
	props: AddApiGatewayDomainNameProps
) {
	const hostedZone = HostedZone.fromHostedZoneAttributes(scope, 'HostedZone', {
		hostedZoneId: props.hostedZoneId,
		zoneName: props.domainName,
	});

	// Certificate names must be globally unique
	const certificate = new DnsValidatedCertificate(
		scope,
		`${props.region}Certificate`,
		{
			domainName: props.domainName,
			hostedZone: hostedZone,
			region: props.region,
		}
	);

	const apigwDomainName = new DomainName(scope, `${props.region}DomainName`, {
		domainName: props.domainName,
		certificate,
		securityPolicy: SecurityPolicy.TLS_1_2,
	});

	// Connects the custom domain gets with the rest api
	apigwDomainName.addBasePathMapping(props.restApi);

	const dnsRecord = new ARecord(scope, `${props.region}`, {
		zone: hostedZone,
		target: RecordTarget.fromAlias(new ApiGatewayDomain(apigwDomainName)),
	});

	// This is used to configure the record with latency routing policy
	const recordSet = dnsRecord.node.defaultChild as CfnRecordSet;
	recordSet.region = props.region;
	recordSet.setIdentifier = `${props.region}Api`;
}
