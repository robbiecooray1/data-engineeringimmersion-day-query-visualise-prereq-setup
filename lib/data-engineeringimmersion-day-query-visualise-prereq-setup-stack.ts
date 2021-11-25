import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as glue from '@aws-cdk/aws-glue';
import { CodeBuildTrigger } from './code_build_trigger';

export class DataEngineeringimmersionDayQueryVisualisePrereqSetupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "data-eng-bucket");

    const codeBuildRole = new iam.Role(this, 'CodeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, "CodeBuildRoleAdministratorAccess", "arn:aws:iam::aws:policy/AdministratorAccess")
      ]
    });

    const crawlerRole = new iam.Role(this, 'CrawlerRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, "CrawlerRoleAdministratorAccess", "arn:aws:iam::aws:policy/AdministratorAccess")
      ]
    });

    const glueJobRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      roleName: 'AWSGlueServiceRole-AdminAccess',
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, "GlueJobRoleAdministratorAccess", "arn:aws:iam::aws:policy/AdministratorAccess")
      ]
    });

    const glueJobSportsTeam = new glue.Job(this, 'GlueJobSportsTeam', {
      executable: glue.JobExecutable.pythonEtl({
        glueVersion: glue.GlueVersion.V3_0,
        pythonVersion: glue.PythonVersion.THREE,
        script: glue.Code.fromBucket(bucket, 'scripts/Glue-Lab-SportTeamParquet.py'),
      }),
      workerCount: 10,
      workerType: glue.WorkerType.G_1X,
      role: glueJobRole,
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--S3_BUCKET_PARQUET_PATH': bucket.bucketName + '/tickets/dms_parquet/'
      }
    });

    const glueJobSportLocation = new glue.Job(this, 'GlueJobSportLocation', {
      executable: glue.JobExecutable.pythonEtl({
        glueVersion: glue.GlueVersion.V3_0,
        pythonVersion: glue.PythonVersion.THREE,
        script: glue.Code.fromBucket(bucket, 'scripts/Glue-Lab-SportLocationParquet.py'),
      }),
      workerCount: 10,
      workerType: glue.WorkerType.G_1X,
      role: glueJobRole,
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--S3_BUCKET_PARQUET_PATH': bucket.bucketName + '/tickets/dms_parquet/'
      }
    });

    const glueJobSportingEvent = new glue.Job(this, 'GlueJobSportingEvent', {
      executable: glue.JobExecutable.pythonEtl({
        glueVersion: glue.GlueVersion.V3_0,
        pythonVersion: glue.PythonVersion.THREE,
        script: glue.Code.fromBucket(bucket, 'scripts/Glue-Lab-SportingEventParquet.py'),
      }),
      workerCount: 10,
      workerType: glue.WorkerType.G_1X,
      role: glueJobRole,
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--S3_BUCKET_PARQUET_PATH': bucket.bucketName + '/tickets/dms_parquet/'
      }
    });

    const glueJobSportingEventTicket = new glue.Job(this, 'GlueJobSportingEventTicket', {
      executable: glue.JobExecutable.pythonEtl({
        glueVersion: glue.GlueVersion.V3_0,
        pythonVersion: glue.PythonVersion.THREE,
        script: glue.Code.fromBucket(bucket, 'scripts/Glue-Lab-SportingEventTicketParquet.py'),
      }),
      workerCount: 10,
      workerType: glue.WorkerType.G_1X,
      role: glueJobRole,
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--S3_BUCKET_PARQUET_PATH': bucket.bucketName + '/tickets/dms_parquet/'
      }
    });

    const glueJobPerson = new glue.Job(this, 'GlueJobPerson', {
      executable: glue.JobExecutable.pythonEtl({
        glueVersion: glue.GlueVersion.V3_0,
        pythonVersion: glue.PythonVersion.THREE,
        script: glue.Code.fromBucket(bucket, 'scripts/Glue-Lab-PersonParquet.py'),
      }),
      workerCount: 10,
      workerType: glue.WorkerType.G_1X,
      role: glueJobRole,
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--S3_BUCKET_PARQUET_PATH': bucket.bucketName + '/tickets/dms_parquet/'
      }
    });

    const database = new glue.Database(this, "data-eng-database", {
      databaseName: 'ticketdata'
    });

    // const personTable = new glue.Table(this, 'PersonTable', {
    //   columns: [
    //     {name: 'id',type: glue.Schema.STRING},
    //     {name: 'full_name',type: glue.Schema.STRING},
    //     {name: 'first_name',type: glue.Schema.STRING},
    //     {name: 'last_name',type: glue.Schema.STRING}
    //   ],
    //   database: database,
    //   dataFormat: glue.DataFormat.CSV,
    //   tableName: 'person',
    //   bucket: bucket,
    //   s3Prefix: 'tickets/dms_sample/person'
    // })

    const crawler = new glue.CfnCrawler(this, "data-eng-crawler", {
      role: crawlerRole.roleName,
      targets: {
        s3Targets: [{
          path: `${bucket.bucketName}/tickets`,
          exclusions: ['dms_parquet/**']
        }],
      },
      databaseName: database.databaseName,
    });

    const parquetCrawler = new glue.CfnCrawler(this, "data-eng-parquet-crawler", {
      role: crawlerRole.roleName,
      targets: {
        s3Targets: [{
          path: `${bucket.bucketName}/tickets/dms_parquet`
        }],
      },
      databaseName: database.databaseName,
      tablePrefix: 'parquet_'
    });

    const codeBuildProject = new codebuild.Project(this, 'data-eng-prereq', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0
      },
      role: codeBuildRole,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'git clone https://github.com/robbiecooray1/data-engineeringimmersion-day-query-visualise-prereq-setup.git',
              `aws s3 cp --recursive --copy-props none ./data-engineeringimmersion-day-query-visualise-prereq-setup/scripts/ s3://${bucket.bucketName}/scripts/`,
              'aws --version',
              `aws s3 cp --recursive --copy-props none s3://aws-dataengineering-day.workshop.aws/data/ s3://${bucket.bucketName}/tickets/`,
              `cd ./data-engineeringimmersion-day-query-visualise-prereq-setup/scripts/`,
              `python -c "from crawl_runner import run_crawler; run_crawler('${crawler.ref}')"`,
              `python -c "from job_runner import run_job; run_job('${glueJobSportsTeam.jobName}')"`,
              `python -c "from job_runner import run_job; run_job('${glueJobSportLocation.jobName}')"`,
              `python -c "from job_runner import run_job; run_job('${glueJobSportingEvent.jobName}')"`,
              `python -c "from job_runner import run_job; run_job('${glueJobSportingEventTicket.jobName}')"`,
              `python -c "from job_runner import run_job; run_job('${glueJobPerson.jobName}')"`,
              `python -c "from crawl_runner import run_crawler; run_crawler('${parquetCrawler.ref}')"`,
            ],
          },
        },
      }),
    });

    const trigger = new CodeBuildTrigger(this, 'CodeBuildTrigger', {
      projectName: codeBuildProject.projectName
    });  
  }
}
