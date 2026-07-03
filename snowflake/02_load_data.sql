USE DATABASE COAL_MINE_DB;
USE SCHEMA RAW;
USE WAREHOUSE COMPUTE_WH;

-- 1. Create a Parquet File Format
CREATE FILE FORMAT IF NOT EXISTS my_parquet_format
  TYPE = PARQUET;

-- 2. Create tables dynamically by inferring the schema from the Parquet files!
CREATE OR REPLACE TABLE Dim_Equipment
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*))
    FROM TABLE(INFER_SCHEMA(LOCATION=>'@s3_coal_stage/dbo/Dim_Equipment/', FILE_FORMAT=>'my_parquet_format'))
  );

CREATE OR REPLACE TABLE Dim_Mine_Sites
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*))
    FROM TABLE(INFER_SCHEMA(LOCATION=>'@s3_coal_stage/dbo/Dim_Mine_Sites/', FILE_FORMAT=>'my_parquet_format'))
  );

CREATE OR REPLACE TABLE Fact_Coal_Production
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*))
    FROM TABLE(INFER_SCHEMA(LOCATION=>'@s3_coal_stage/dbo/Fact_Coal_Production/', FILE_FORMAT=>'my_parquet_format'))
  );

CREATE OR REPLACE TABLE Fact_Haulage_Trips
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*))
    FROM TABLE(INFER_SCHEMA(LOCATION=>'@s3_coal_stage/dbo/Fact_Haulage_Trips/', FILE_FORMAT=>'my_parquet_format'))
  );

-- 3. Load the Data using COPY INTO
COPY INTO Dim_Equipment
  FROM @s3_coal_stage/dbo/Dim_Equipment/
  FILE_FORMAT = (FORMAT_NAME = 'my_parquet_format')
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO Dim_Mine_Sites
  FROM @s3_coal_stage/dbo/Dim_Mine_Sites/
  FILE_FORMAT = (FORMAT_NAME = 'my_parquet_format')
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO Fact_Coal_Production
  FROM @s3_coal_stage/dbo/Fact_Coal_Production/
  FILE_FORMAT = (FORMAT_NAME = 'my_parquet_format')
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO Fact_Haulage_Trips
  FROM @s3_coal_stage/dbo/Fact_Haulage_Trips/
  FILE_FORMAT = (FORMAT_NAME = 'my_parquet_format')
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;
