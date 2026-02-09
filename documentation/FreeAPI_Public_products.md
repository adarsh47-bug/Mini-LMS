# FreeAPI Public Products API — Full Documentation (Accurate Schemas)

> Base URL: `https://api.freeapi.app`
> Section: **Public → Products**
> Auth: ❌ Not required
> Data source: Random demo products
> Status: Stable

---

# 🧱 GLOBAL RESPONSE WRAPPER

All product endpoints return this structure:

```ts
type ApiResponse<T> = {
  success: boolean
  message: string
  statusCode: number
  data: T
}
```

---

# 🛍️ PRODUCT SCHEMAS

## Basic Product (list item)

Used in `/public/randomproducts`

```ts
type ProductListItem = {
  id: number
  title: string
  category: string
  price: number
  thumbnail: string
  images: string[]
}
```

---

## Full Product (single product)

Used in:

* `/public/randomproducts/{productId}`
* `/public/randomproducts/product/random`

```ts
type Product = {
  id: number
  title: string
  description: string
  category: string
  brand: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  thumbnail: string
  images: string[]
}
```

---

# 📌 ENDPOINTS

---

# 1️⃣ Get Random Products (Paginated)

**GET** `/public/randomproducts`

### Description

Returns paginated list of random products.

### Query Params

```ts
type Query = {
  page?: number
  limit?: number
}
```

### Example Request

```
GET https://api.freeapi.app/public/randomproducts?page=1&limit=10
```

---

## Response Schema

```ts
type RandomProductsResponse = ApiResponse<{
  page: number
  limit: number
  totalItems: number
  totalPages: number
  currentPageItems: number
  nextPage: boolean
  previousPage: boolean
  data: ProductListItem[]
}>
```

---

## Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Random products fetched successfully",
  "data": {
    "page": 1,
    "limit": 10,
    "totalItems": 10,
    "totalPages": 1,
    "currentPageItems": 10,
    "nextPage": false,
    "previousPage": false,
    "data": [
      {
        "id": 61,
        "title": "Leather Straps Wristwatch",
        "category": "mens-watches",
        "price": 120,
        "thumbnail": "...",
        "images": ["..."]
      }
    ]
  }
}
```

---

# 2️⃣ Get Product By ID

**GET** `/public/randomproducts/{productId}`

### Params

```ts
type Params = {
  productId: number
}
```

### Example

```
GET /public/randomproducts/30
```

---

## Response Schema

```ts
type ProductByIdResponse = ApiResponse<Product>
```

---

## Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product fetched successfully",
  "data": {
    "id": 30,
    "title": "Key Holder",
    "description": "...",
    "brand": "Golden",
    "category": "home-decoration",
    "price": 30,
    "discountPercentage": 2.92,
    "rating": 4.92,
    "stock": 54,
    "thumbnail": "...",
    "images": ["..."]
  }
}
```

---

# 3️⃣ Get Random Product

**GET** `/public/randomproducts/product/random`

### Description

Returns one random product with full details.

### Example Request

```
GET /public/randomproducts/product/random
```

---

## Response Schema

```ts
type RandomProductResponse = ApiResponse<Product>
```

---

## Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Random product fetched successfully",
  "data": {
    "id": 96,
    "title": "lighting ceiling kitchen",
    "description": "...",
    "brand": "lightingbrilliance",
    "category": "lighting",
    "price": 30,
    "discountPercentage": 14.89,
    "rating": 4.83,
    "stock": 96,
    "thumbnail": "...",
    "images": ["..."]
  }
}
```

---

# 🧠 Field Descriptions

| Field              | Type     | Description         |
| ------------------ | -------- | ------------------- |
| id                 | number   | Product ID          |
| title              | string   | Product name        |
| description        | string   | Product description |
| category           | string   | Category slug       |
| brand              | string   | Brand name          |
| price              | number   | Product price       |
| discountPercentage | number   | Discount            |
| rating             | number   | Rating (0–5)        |
| stock              | number   | Items available     |
| thumbnail          | string   | Thumbnail image     |
| images             | string[] | All product images  |

---

# 🔄 Pagination Logic

Used only in `/randomproducts`

```ts
page: current page
limit: items per page
totalItems: total products
totalPages: total pages
nextPage: boolean
previousPage: boolean
```

---

# 🧑‍💻 Usage Example

## Fetch product list

```ts
const res = await fetch(
  "https://api.freeapi.app/public/randomproducts"
);
const json = await res.json();

const products = json.data.data;
```

---

## Fetch single product

```ts
const res = await fetch(
  "https://api.freeapi.app/public/randomproducts/30"
);
```

---

## Fetch random product

```ts
const res = await fetch(
  "https://api.freeapi.app/public/randomproducts/product/random"
);
```

---

# 🏗️ TypeScript Types (Copy for Project)

```ts
export type ProductListItem = {
  id: number
  title: string
  category: string
  price: number
  thumbnail: string
  images: string[]
}

export type Product = {
  id: number
  title: string
  description: string
  category: string
  brand: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  thumbnail: string
  images: string[]
}

export type PaginatedProducts = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  currentPageItems: number
  nextPage: boolean
  previousPage: boolean
  data: ProductListItem[]
}
```

---

# ⚠️ Notes

* Public demo API
* Data may change
* No auth required
* Safe for testing apps
* Perfect for UI demos

---

# 🏁 End of Products API Docs

Ready for AI Copilot ingestion.
