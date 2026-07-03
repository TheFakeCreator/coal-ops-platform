with production as (
    select * from {{ ref('stg_coal__production') }}
),

sites as (
    select * from {{ ref('stg_coal__sites') }}
)

select
    p.production_id,
    p.extraction_date,
    p.tons_extracted,
    p.shift_manager,
    s.site_name,
    s.region,
    s.primary_coal_type
from production p
left join sites s on p.site_id = s.site_id
