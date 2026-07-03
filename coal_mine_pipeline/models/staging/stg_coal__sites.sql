with source as (
    select * from {{ source('raw_coal', 'DIM_MINE_SITES') }}
),

renamed as (
    select
        "SiteID" as site_id,
        "SiteName" as site_name,
        "Region" as region,
        "PrimaryCoalType" as primary_coal_type,
        "UpdatedAt" as updated_at
    from source
)

select * from renamed
