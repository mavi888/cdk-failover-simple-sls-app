import { Fn } from 'aws-cdk-lib';
import {
	DomainName,
	RestApi,
	SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
	ARecord,
	CfnHealthCheck,
	CfnRecordSet,
	HostedZone,
	RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface AddApiGateWayDomainNameProps {
	region: string;
	domainName: string;
	restApi: RestApi;
	hostedZoneId: string;
}

export function addApiGateWayDomainName(
	scope: Construct,
	props: AddApiGateWayDomainNameProps
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

	// We need to call addBasePathMapping, so that the custom domain gets connected with our rest api
	apigwDomainName.addBasePathMapping(props.restApi);

	const executeApiDomainName = Fn.join('.', [
		props.restApi.restApiId,
		'execute-api',
		props.region,
		Fn.ref('AWS::URLSuffix'),
	]);

	const healthCheck = new CfnHealthCheck(scope, `${props.region}HealthCheck`, {
		healthCheckConfig: {
			type: 'HTTPS',
			fullyQualifiedDomainName: executeApiDomainName,
			port: 443,
			requestInterval: 30,
			resourcePath: `/${props.restApi.deploymentStage.stageName}/health`,
		},
	});

	const dnsRecord = new ARecord(scope, `${props.region}`, {
		zone: hostedZone,
		target: RecordTarget.fromAlias(new ApiGatewayDomain(apigwDomainName)),
	});

	const recordSet = dnsRecord.node.defaultChild as CfnRecordSet;
	recordSet.region = props.region;
	recordSet.healthCheckId = healthCheck.attrHealthCheckId;
	recordSet.setIdentifier = `${props.region}Api`;
}
