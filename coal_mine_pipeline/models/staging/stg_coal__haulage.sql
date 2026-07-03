with source as (
    select * from {{ source('raw_coal', 'FACT_HAULAGE_TRIPS') }}
),

renamed as (
    select
        "TripID" as trip_id,
        "EquipmentID" as equipment_id,
        "SourceSiteID" as source_site_id,
        "DestinationYard" as destination_yard,
        "TripStart" as trip_start,
        "TripEnd" as trip_end,
        "TonsTransported" as tons_transported,
        "FuelConsumedLiters" as fuel_consumed_liters,
        "UpdatedAt" as updated_at
    from source
)

select * from renamed
