import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import dynamodb = require('aws-cdk-lib/aws-dynamodb') ;
import * as lambda from 'aws-cdk-lib/aws-lambda';


export class CrudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //dynamodb
    const dynmoTable=new dynamodb.Table(this,'mytestDB',{
      partitionKey:{
        name:'itemId',
        type:dynamodb.AttributeType.STRING
      }
    });

    //lambda
    const getAll = new lambda.Function(this, 'getAllitems',{
      code: new lambda.AssetCode('./src'),
      handler:'get-all.handler',
      runtime:lambda.Runtime.NODEJS_16_X,
      environment:{
        TABLE_NAME: dynmoTable.tableName,
        PRIMARY_KEY:'itemId'
      }
    });

    const createLambda = new lambda.Function(this, 'createItem',{
      code: new lambda.AssetCode('./src'),
      handler:'create.handler',
      runtime:lambda.Runtime.NODEJS_16_X,
      environment:{
        TABLE_NAME: dynmoTable.tableName,
        PRIMARY_KEY:'itemId'
      },
    });


    dynmoTable.grantReadData(getAll);
    dynmoTable.grantReadWriteData(createLambda);

    //apigateway
    const api = new apigateway.RestApi(this,' testApi',{
      restApiName:'my test api'
    });
    const rootApi=api.root.addResource('root');
    const getAllApi=new apigateway.LambdaIntegration(getAll);
    rootApi.addMethod('GET',getAllApi);

    const createApi=rootApi.addResource('create');
    const createApiIntegration=new apigateway.LambdaIntegration(createLambda);
    createApi.addMethod('POST', createApiIntegration);

    const plan = api.addUsagePlan('UsagePlan', {
      name:'EASY',
      throttle:{
        rateLimit:20,
        burstLimit:2
      }
    });
    const key =api.addApiKey('ApiKey');
    plan.addApiKey(key);
  }
}
