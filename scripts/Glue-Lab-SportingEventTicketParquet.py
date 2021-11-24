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
    database="ticketdata", table_name="sporting_event_ticket", transformation_ctx="S3bucket_node1"
)

# Script generated for node ApplyMapping
ApplyMapping_node2 = ApplyMapping.apply(
    frame=S3bucket_node1,
    mappings=[
        ("id", "string", "id", "double"),
        ("sporting_event_id", "string", "sporting_event_id", "double"),
        ("sport_location_id", "string", "sport_location_id", "string"),
        ("seat_level", "long", "seat_level", "long"),
        ("seat_section", "long", "seat_section", "long"),
        ("seat_row", "string", "seat_row", "string"),
        ("seat", "long", "seat", "long"),
        ("ticketholder_id", "string", "ticketholder_id", "double"),
        ("ticket_price", "double", "ticket_price", "double"),
    ],
    transformation_ctx="ApplyMapping_node2",
)

# Script generated for node S3 bucket
S3bucket_node3 = glueContext.write_dynamic_frame.from_options(
    frame=ApplyMapping_node2,
    connection_type="s3",
    format="glueparquet",
    connection_options={
        "path": "s3://" + args['S3_BUCKET_PARQUET_PATH'] + "sporting_event_ticket/",
        "partitionKeys": [],
    },
    format_options={"compression": "uncompressed"},
    transformation_ctx="S3bucket_node3",
)

job.commit()
