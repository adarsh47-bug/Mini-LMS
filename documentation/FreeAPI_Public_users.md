# FreeAPI Public Users API — Full Markdown Documentation (Accurate Schemas)

> Base URL: `https://api.freeapi.app`
> Section: **Public → Random Users**
> Auth: ❌ Not required
> Data: Random demo users
> Pagination: ✅ Supported

---

# 🧱 GLOBAL RESPONSE WRAPPER

All endpoints return:

```ts
type ApiResponse<T> = {
  success: boolean
  message: string
  statusCode: number
  data: T
}
```

---

# 👤 USER DATA SCHEMA

This is the **actual full schema** returned by API.

```ts
type RandomUser = {
  id: number
  gender: "male" | "female" | string
  email: string
  phone: string
  cell: string
  nat: string

  name: {
    title: string
    first: string
    last: string
  }

  picture: {
    large: string
    medium: string
    thumbnail: string
  }

  dob: {
    date: string
    age: number
  }

  registered: {
    date: string
    age: number
  }

  location: {
    city: string
    state: string
    country: string
    postcode: string | number

    street: {
      name: string
      number: number
    }

    coordinates: {
      latitude: string
      longitude: string
    }

    timezone: {
      offset: string
      description: string
    }
  }

  login: {
    uuid: string
    username: string
    password: string
    salt: string
    md5: string
    sha1: string
    sha256: string
  }
}
```

---

# 📄 PAGINATED USERS RESPONSE

Used in:

```
GET /public/randomusers
```

```ts
type PaginatedUsers = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  currentPageItems: number
  nextPage: boolean
  previousPage: boolean
  data: RandomUser[]
}
```

Full response:

```ts
type RandomUsersResponse = ApiResponse<PaginatedUsers>
```

---

# 📌 ENDPOINTS

---

# 1️⃣ Get Random Users (Paginated)

**GET** `/public/randomusers`

### Description

Returns paginated list of random users.

### Query Params

```ts
type Query = {
  page?: number     // default 1
  limit?: number    // default 10
}
```

### Example

```
GET https://api.freeapi.app/public/randomusers?page=1&limit=10
```

---

## Response Example

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Random users fetched successfully",
  "data": {
    "page": 1,
    "limit": 10,
    "totalItems": 500,
    "totalPages": 50,
    "currentPageItems": 10,
    "nextPage": true,
    "previousPage": false,
    "data": [RandomUser]
  }
}
```

---

# 2️⃣ Get User By ID

**GET** `/public/randomusers/{userId}`

### Params

```ts
type Params = {
  userId: number
}
```

### Example

```
GET /public/randomusers/13
```

---

## Response Schema

```ts
type UserByIdResponse = ApiResponse<RandomUser>
```

---

# 3️⃣ Get Random Single User

**GET** `/public/randomusers/user/random`

### Description

Returns one random user.

### Response

```ts
type RandomUserResponse = ApiResponse<RandomUser>
```

---

# 🧠 FIELD DESCRIPTIONS

| Field                | Type     | Description |
| -------------------- | -------- | ----------- |
| id                   | number   | User ID     |
| name.first           | string   | First name  |
| name.last            | string   | Last name   |
| email                | string   | Email       |
| phone                | string   | Phone       |
| cell                 | string   | Cell number |
| gender               | string   | Gender      |
| nat                  | string   | Nationality |
| picture.large        | string   | Avatar      |
| dob.date             | string   | Birth date  |
| dob.age              | number   | Age         |
| location.city        | string   | City        |
| location.country     | string   | Country     |
| location.coordinates | lat/long |             |
| login.username       | string   | Username    |
| login.uuid           | string   | UUID        |

---

# 🔄 PAGINATION LOGIC

```ts
page → current page
limit → items per page
totalItems → total users
totalPages → total pages
nextPage → boolean
previousPage → boolean
```

---

# 🧑‍💻 USAGE EXAMPLES

## Fetch users

```ts
const res = await fetch(
  "https://api.freeapi.app/public/randomusers"
);

const json = await res.json();
const users = json.data.data;
```

---

## Fetch user by ID

```ts
await fetch(
  "https://api.freeapi.app/public/randomusers/13"
);
```

---

## Fetch random user

```ts
await fetch(
  "https://api.freeapi.app/public/randomusers/user/random"
);
```

---

# 🏗️ TYPESCRIPT TYPES (COPY-PASTE)

```ts
export type RandomUser = {
  id: number
  gender: string
  email: string
  phone: string
  cell: string
  nat: string

  name: {
    title: string
    first: string
    last: string
  }

  picture: {
    large: string
    medium: string
    thumbnail: string
  }

  dob: {
    date: string
    age: number
  }

  registered: {
    date: string
    age: number
  }

  location: {
    city: string
    state: string
    country: string
    postcode: string | number
    street: { name: string; number: number }
    coordinates: { latitude: string; longitude: string }
    timezone: { offset: string; description: string }
  }

  login: {
    uuid: string
    username: string
    password: string
    salt: string
    md5: string
    sha1: string
    sha256: string
  }
}
```

---

# ⚠️ IMPORTANT NOTES

* Public demo API
* Data is random
* Not production database
* Great for UI testing
* Login fields are fake
* Passwords are dummy

---

# 🧠 Best Use Cases

Use for:

* Chat apps UI
* Social apps
* Contact list
* Admin dashboards
* Testing pagination
* Avatar lists

---

# 🏁 END OF USERS DOC

Ready for AI Copilot ingestion.
