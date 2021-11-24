import logging
import time
import timeit

import boto3

log = logging.getLogger(__name__)


def run_job(job: str, *, timeout_minutes: int = 10, retry_seconds: int = 5) -> None:
    """Run the specified AWS Glue job, waiting until completion."""
    # Ref: https://stackoverflow.com/a/66072347/
    timeout_seconds = timeout_minutes * 60
    client = boto3.client("glue")
    start_time = timeit.default_timer()
    abort_time = start_time + timeout_seconds

    log.info(f"Running {job}.")
    job_run_id = client.start_job_run(JobName=job)

    def wait_until_ready() -> None:
        while True:
            response_get = client.get_job_run(JobName=job, RunId=job_run_id["JobRunId"])
            state = response_get["JobRun"]["JobRunState"]
            if state == "SUCCEEDED":
                return
            if timeit.default_timer() > abort_time:
                raise TimeoutError(f"Failed to run {job}. The allocated time of {timeout_minutes:,} minutes has elapsed.")
            time.sleep(retry_seconds)

    wait_until_ready()
    
    wait_until_ready()
    log.info(f"Ran {job}.")