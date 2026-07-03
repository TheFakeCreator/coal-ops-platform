with source as (
    select * from {{ source('raw_coal', 'FACT_COAL_PRODUCTION') }}
),

renamed as (
    select
        "ProductionID" as production_id,
        "SiteID" as site_id,
        "ExtractionDate" as extraction_date,
        "TonsExtracted" as tons_extracted,
        "ShiftManager" as shift_manager,
        "UpdatedAt" as updated_at
    from source
)

select * from renamed
