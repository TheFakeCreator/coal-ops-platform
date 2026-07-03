-- 1. Create the Database and Schemas
CREATE DATABASE IF NOT EXISTS COAL_MINE_DB;
USE DATABASE COAL_MINE_DB;

CREATE SCHEMA IF NOT EXISTS RAW;
CREATE SCHEMA IF NOT EXISTS ANALYTICS;

-- 2. Create the Virtual Warehouse for Compute
CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH
    WITH WAREHOUSE_SIZE = 'XSMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;

USE WAREHOUSE COMPUTE_WH;

-- 3. Create a Storage Integration for AWS S3
CREATE STORAGE INTEGRATION IF NOT EXISTS s3_coal_integration
  TYPE = EXTERNAL_STAGE
  STORAGE_PROVIDER = 'S3'
  ENABLED = TRUE
  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:role/snowflake_s3_role'
  STORAGE_ALLOWED_LOCATIONS = ('s3://coal-pipeline-data-2026/');

-- 4. Create an External Stage using the integration
USE SCHEMA RAW;
CREATE STAGE IF NOT EXISTS s3_coal_stage
  URL = 's3://coal-pipeline-data-2026/'
  STORAGE_INTEGRATION = s3_coal_integration;

-- After creating this, you must run:
-- DESC INTEGRATION s3_coal_integration;
-- and copy the STORAGE_AWS_IAM_USER_ARN and STORAGE_AWS_EXTERNAL_ID
-- into your AWS IAM Role Trust Policy!
