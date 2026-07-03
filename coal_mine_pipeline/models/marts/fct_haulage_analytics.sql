with haulage as (
    select * from {{ ref('stg_coal__haulage') }}
),
equipment as (
    select * from {{ ref('stg_coal__equipment') }}
),
sites as (
    select * from {{ ref('stg_coal__sites') }}
)

select
    h.trip_id,
    h.trip_start,
    h.trip_end,
    h.tons_transported,
    h.fuel_consumed_liters,
    h.destination_yard,
    e.equipment_type,
    e.model,
    e.operational_status,
    s.site_name,
    s.region,
    s.primary_coal_type
from haulage h
left join equipment e on h.equipment_id = e.equipment_id
left join sites s on h.source_site_id = s.site_id
