# Company Settings & File Upload API Documentation

This document provides details for managing company settings and uploading files (such as logos) via the Fleetbase Internal API.

## 1. File Upload API

Use this endpoint to upload a logo or any other file to the system. The returned `uuid` should be used when updating the company's `logo_uuid`.

### Endpoint
`POST {{url}}/int/v1/files/upload`

### Request Headers
- `Content-Type: multipart/form-data`

### Request Body (Form-Data)
| Key | Type | Value | Description |
| :--- | :--- | :--- | :--- |
| `file` | File | `image.jpg` | The image file to upload. |
| `type` | Text | `logo` | The type of the file. |
| `path` | Text | `logo` | The directory path for storage. |

### Response
```json
{
    "file": {
        "company_uuid": "ac5006be-238e-4928-b622-7454871b98bb",
        "uploader_uuid": "38ce602c-70bd-497a-832d-66139d1057d4",
        "original_filename": "image (1).jpg",
        "content_type": "image/jpeg",
        "disk": "s3",
        "path": "logo/aXtSfh6o7.jpg",
        "bucket": "fleetyes",
        "type": "logo",
        "file_size": 11524,
        "uuid": "e352f554-b998-4f9e-85b9-cbad39394d21",
        "public_id": "file_vMWtpzQ",
        "slug": "image-1jpg-6",
        "updated_at": "2026-04-13T10:29:33.000000Z",
        "created_at": "2026-04-13T10:29:33.000000Z",
        "url": "https://fleetyes.s3.amazonaws.com/logo/aXtSfh6o7.jpg",
        "hash_name": "aXtSfh6o7.jpg"
    }
}
```

---

## 2. Get Company Settings

Retrieve the details and settings for a specific company.

### Endpoint
`GET {{url}}/int/v1/companies/{uuid}`

### Response
```json
{
    "company": {
        "id": 2,
        "uuid": "ac5006be-238e-4928-b622-7454871b98bb",
        "owner_uuid": "a5a26c46-3c0b-446f-95a8-e0156372470c",
        "public_id": "company_2Bj582s",
        "name": "FleetYes",
        "description": "Fleet Managment System",
        "phone": "+448987633568",
        "type": null,
        "users_count": 52,
        "timezone": null,
        "logo_url": "https://fleetyes.s3.amazonaws.com/fleetyes/dev/companies/ac5006be-238e-4928-b622-7454871b98bb/logo/2rY6wjOr7.png",
        "slug": "fleetyes",
        "status": null,
        "joined_at": "2025-01-31T07:24:52.000000Z",
        "updated_at": "2026-04-13T10:06:39.000000Z",
        "created_at": "2024-12-12T04:41:54.000000Z",
        "parking_zone_max_distance": 3,
        "driver_can_create_holiday": true,
        "driver_can_create_issue": false,
        "currency": "GBP"
    }
}
```

---

## 3. Update Company Settings

Update the company details, including permissions for drivers and organizational settings.

### Endpoint
`PUT {{url}}/int/v1/companies/{uuid}`

### Request Body
```json
{
    "company": {
        "name": "FleetYes",
        "logo_uuid": "1f9dd4b5-8101-4631-bc5e-e130482764f7", // logo_uuid need to get from file upload api
        "description": "Fleet Managment System",
        "currency": "GBP",
        "phone": "+448987633568",
        "parking_zone_max_distance": 3,
        "driver_can_create_holiday": true,
        "driver_can_create_issue": false
    }
}
```

### Response
```json
{
    "company": {
        "id": 2,
        "uuid": "ac5006be-238e-4928-b622-7454871b98bb",
        "owner_uuid": "a5a26c46-3c0b-446f-95a8-e0156372470c",
        "public_id": "company_2Bj582s",
        "name": "FleetYes",
        "description": "Fleet Managment System",
        "phone": "+448987633568",
        "type": null,
        "users_count": 52,
        "timezone": null,
        "logo_url": "https://fleetyes.s3.amazonaws.com/fleetyes/dev/companies/ac5006be-238e-4928-b622-7454871b98bb/logo/2rY6wjOr7.png",
        "backdrop_url": "https://flb-assets.s3.ap-southeast-1.amazonaws.com/static/default-storefront-backdrop.png",
        "branding": {
            "id": 1,
            "uuid": 1,
            "icon_url": "http://127.0.0.1:8000/storage/uploads/system/zacZbhIBm.svg",
            "logo_url": "http://127.0.0.1:8000/storage/uploads/system/fo9zgaRn2.svg",
            "icon_uuid": "a07246e8-a127-4646-9bc9-2f2574c78a2e",
            "logo_uuid": "b6a2f680-e652-4b7f-b2cc-f3d11e665a85",
            "default_theme": "light"
        },
        "options": {
            "fleetops": {
                "adhoc_distance": 6000
            },
            "storefront": []
        },
        "amazon_reporting_emails": [],
        "owner": null,
        "slug": "fleetyes",
        "status": null,
        "joined_at": "2025-01-31T07:24:52.000000Z",
        "updated_at": "2026-04-13T10:06:39.000000Z",
        "created_at": "2024-12-12T04:41:54.000000Z",
        "parking_zone_max_distance": 3,
        "driver_can_create_holiday": true,
        "driver_can_create_issue": false,
        "currency": "GBP"
    }
}
```
