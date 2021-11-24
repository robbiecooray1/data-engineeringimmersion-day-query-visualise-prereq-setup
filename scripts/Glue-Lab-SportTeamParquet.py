import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ["JOB_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# Script generated for node S3 bucket
S3bucket_node1 = glueContext.create_dynamic_frame.from_catalog(
    database="ticketdata", table_name="sport_team", transformation_ctx="S3bucket_node1"
)

# Script generated for node ApplyMapping
ApplyMapping_node2 = ApplyMapping.apply(
    frame=S3bucket_node1,
    mappings=[
        ("id", "string", "id", "double"),
        ("name", "string", "name", "string"),
        ("abbreviated_name", "string", "abbreviated_name", "string"),
        ("home_field_id", "long", "home_field_id", "long"),
        ("sport_type_name", "string", "sport_type_name", "string"),
        ("sport_league_short_name", "string", "sport_league_short_name", "string"),
        ("sport_division_short_name", "string", "sport_division_short_name", "string"),
    ],
    transformation_ctx="ApplyMapping_node2",
)

# Script generated for node S3 bucket
S3bucket_node3 = glueContext.write_dynamic_frame.from_options(
    frame=ApplyMapping_node2,
    connection_type="s3",
    format="glueparquet",
    connection_options={
        "path": "s3://dataengineeringimmersionday-dataengbucket0ec2460a-k0610phk48os/tickets/dms_parquet/sport_team/",
        "partitionKeys": [],
    },
    format_options={"compression": "uncompressed"},
    transformation_ctx="S3bucket_node3",
)

job.commit()
