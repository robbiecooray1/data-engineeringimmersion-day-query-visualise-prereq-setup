import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ["JOB_NAME", 'S3_BUCKET_PARQUET_PATH'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# Script generated for node S3 bucket
S3bucket_node1 = glueContext.create_dynamic_frame.from_catalog(
    database="ticketdata", table_name="sporting_event", transformation_ctx="S3bucket_node1"
)

# Script generated for node ApplyMapping
ApplyMapping_node2 = ApplyMapping.apply(
    frame=S3bucket_node1,
    mappings=[
        ("id", "long", "id", "double"),
        ("sport_type_name", "string", "sport_type_name", "string"),
        ("home_team_id", "long", "home_team_id", "long"),
        ("away_team_id", "long", "away_team_id", "long"),
        ("location_id", "long", "location_id", "long"),
        ("start_date_time", "string", "start_date_time", "timestamp"),
        ("start_date", "string", "start_date", "date"),
        ("sold_out", "long", "sold_out", "long"),
    ],
    transformation_ctx="ApplyMapping_node2",
)

# Script generated for node S3 bucket
S3bucket_node3 = glueContext.write_dynamic_frame.from_options(
    frame=ApplyMapping_node2,
    connection_type="s3",
    format="glueparquet",
    connection_options={
        "path": "s3://" + args['S3_BUCKET_PARQUET_PATH'] + "sporting_event/",
        "partitionKeys": [],
    },
    format_options={"compression": "uncompressed"},
    transformation_ctx="S3bucket_node3",
)

job.commit()
