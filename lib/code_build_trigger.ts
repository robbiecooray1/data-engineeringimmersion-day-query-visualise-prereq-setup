import { Construct, CustomResource, Stack, Token } from "@aws-cdk/core";
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';

export interface CodeBuildTriggerProps {
    projectName?: string;
  }
  
  export class CodeBuildTrigger extends Construct {
    constructor(scope: Construct, id: string, props: CodeBuildTriggerProps) 
    {
      super(scope, id);

      const physicalResourceId = Stack.of(this).stackName + '-CodeBuildTrigger';

      const onEvent = new lambda.Function(this, 'CodeBuildTriggerCreation', { 
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: 'index.on_event',
        code: lambda.Code.fromInline(`
import boto3, json
import cfnresponse
client = boto3.client('codebuild')

def on_event(event, context):
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event, context)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event, context):  
  physical_id = '${physicalResourceId}'

  try:
    response = client.start_build(projectName='${props.projectName}')
    
  except Exception as e: 
    print(e)
    print('An error occurred')

  responseData = {}
  cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData, physical_id)
`       ),
      });

      onEvent.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [            
          'codebuild:StartBuild',
        ]
      }))

      const resource = new CustomResource(this, 'customConfig', { serviceToken: onEvent.functionArn });
      
    }
  }