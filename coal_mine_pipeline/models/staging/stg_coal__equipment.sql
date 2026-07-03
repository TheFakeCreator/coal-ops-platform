with source as (
    select * from {{ source('raw_coal', 'DIM_EQUIPMENT') }}
),

renamed as (
    select
        "EquipmentID" as equipment_id,
        "EquipmentType" as equipment_type,
        "Model" as model,
        "MaxCapacityTons" as max_capacity_tons,
        "OperationalStatus" as operational_status,
        "PurchaseDate" as purchase_date,
        "UpdatedAt" as updated_at
    from source
)

select * from renamed
