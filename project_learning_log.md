# Coal Mine Data Pipeline: Learning & Execution Log

This document serves as a step-by-step summary of how we built the AWS -> Snowflake -> dbt data pipeline. It details the exact steps we took, the errors we ran into, and how we solved them. 

---

## Phase 1: Environment Setup & Snowflake Foundations
**Goal:** Connect to Snowflake locally and create the foundational architecture (Database, Schemas, Warehouse).

*   **Step 1:** We installed the **SnowSQL CLI** to interact with Snowflake from the terminal.
    *   *Problem Faced:* We couldn't find the configuration file to enter the trial account credentials.
    *   *Solution:* We realized that `.snowsql` is a hidden folder in Windows, and the `config` file is only generated *after* running the `snowsql` command for the very first time. We also learned that INI files treat `#` as comments, so we had to wrap passwords containing a `#` in double quotes (e.g., `"pass#word"`).
*   **Step 2:** We created the SQL script `snowflake/01_setup.sql` to build the `COAL_MINE_DB`, the `RAW` and `ANALYTICS` schemas, and the `COMPUTE_WH` warehouse.
*   **Step 3:** We created a **Storage Integration** to connect Snowflake to the AWS S3 bucket (`coal-pipeline-data-2026`).
    *   *Problem Faced:* Snowflake needs permission to read the AWS bucket securely without exposing access keys.
    *   *Solution:* We created an **IAM Role** in AWS. Snowflake provided us with a unique `STORAGE_AWS_IAM_USER_ARN` and an `EXTERNAL_ID`. We pasted those back into the AWS IAM Trust Policy to complete a secure "handshake" between the two clouds.

---

## Phase 2 & 3: Data Extraction and Loading
**Goal:** Move the raw data from S3 into our Snowflake Data Warehouse.

*   **Step 1:** The extraction phase (moving data from SQL Express to S3) was skipped because the files were already uploaded to S3 as `.parquet` files.
*   **Step 2:** We wrote `snowflake/02_load_data.sql` to create the tables and copy the data over.
    *   *Problem Faced:* Creating tables manually requires typing out every single column name and data type, which is tedious and prone to error.
    *   *Solution:* Because the files were in **Parquet format** (which stores schema metadata inside the file), we used Snowflake's highly advanced `INFER_SCHEMA` and `CREATE TABLE ... USING TEMPLATE` features. Snowflake dynamically read the Parquet files, figured out the columns, built the tables, and loaded 70 rows into all 4 tables perfectly!

---

## Phase 4: Data Transformation with dbt
**Goal:** Use dbt (Data Build Tool) to clean the raw tables and join them into an analytics-ready "Mart" table.

*   **Step 1:** We needed to install and initialize the `dbt-snowflake` package.
    *   *Problem Faced 1 (PATH Error):* Running `dbt init` failed because the Python `Scripts` folder wasn't in the Windows PATH environment variable. 
    *   *Solution:* We bypassed the PATH entirely by executing the absolute path to the executable: `C:\Users\_MSI_\AppData\Roaming\Python\...\dbt.exe`.
    *   *Problem Faced 2 (Python Version Crash):* The absolute path threw a massive `mashumaro.exceptions.UnserializableField` error. We discovered the system was running **Python 3.14**, which is a bleeding-edge pre-release that dbt's background dependencies don't support yet.
    *   *Solution:* We discovered that **Python 3.13** was also installed. We installed `dbt-snowflake` on Python 3.13, which successfully bypassed the bug! We then ran the interactive `dbt init` setup.
*   **Step 2:** We wrote the SQL models (Staging models to clean data, and a Mart model to join Production with Site details).
    *   *Problem Faced:* When we ran `dbt run`, it threw an error: `invalid identifier 'PRODUCTIONID'`.
    *   *Solution:* We realized that Snowflake's `INFER_SCHEMA` perfectly preserved the CamelCase headers from the Parquet files (e.g., `ProductionID`). By default, Snowflake SQL forces all columns to uppercase unless you wrap them in double-quotes. We fixed the dbt models by explicitly quoting the columns (e.g., `"ProductionID" as production_id`).
*   **Step 3:** The second `dbt run` compiled successfully, ran the SQL in Snowflake, and created the final `fct_daily_production` table in our `ANALYTICS` schema!

---

## Phase 5: The Dashboard (Next.js & Shadcn UI)
**Goal:** Build a beautiful, interactive web application to visualize the final transformed data directly from Snowflake.

*   **Step 1:** We initially built a dashboard using Streamlit. However, to achieve a true production-level, enterprise aesthetic, we completely pivoted to a **React Full-Stack Web Application** using Next.js.
*   **Step 2:** We ran `npx create-next-app` to scaffold a modern Next.js 15 app with Tailwind CSS.
    *   *Problem Faced:* We accidentally placed the UI code (`page.tsx`) in the root `app/` folder instead of the `src/app/` folder, causing Next.js to lose track of the `layout.tsx` file (which contains HTML tags).
    *   *Solution:* We moved the files into the correct `src/app/` directory and Next.js instantly resolved the issue.
*   **Step 3:** We wrote a custom Next.js API route (`/api/data/route.ts`) using the `snowflake-sdk` for Node.js to fetch live data from our `FCT_DAILY_PRODUCTION` and `FCT_HAULAGE_ANALYTICS` tables in Snowflake.
*   **Step 4:** We installed `shadcn-ui` and `recharts` to build the frontend. The dashboard now features a multi-tab layout for Production and Fleet Analytics.
*   **Step 5 (UI/UX Pro Max):** We utilized the expert `ui-ux-pro-max` design system generator to style the dashboard. We implemented a "Data-Dense Dashboard" style by importing the `Fira Code` and `Fira Sans` professional fonts, removing informal emojis in favor of crisp `Lucide` SVG icons, adjusting card padding for maximum data density, and adding smooth hover transitions.

---

## Conclusion
We successfully built a complete modern enterprise data stack! 
**AWS S3 Data Lake -> Snowflake Data Warehouse -> dbt Transformations -> Next.js React Dashboard (Shadcn/Recharts)**. 

This covers all the core pillars of modern Data Engineering: Extract, Load, Transform (ELT), and Premium Visualization.
