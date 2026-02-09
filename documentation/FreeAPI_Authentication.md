# FreeAPI Authentication — Full Markdown Documentation (with Schemas)

> Base URL: `https://api.freeapi.app`
> Auth: JWT Bearer
> Tokens: `accessToken` + `refreshToken`

---

# 🔐 Authentication Overview

* JWT based authentication
* Access token required in headers:

  ```
  Authorization: Bearer <access_token>
  ```
* Refresh token used to obtain new access token
* Email verification required after registration
* Roles supported (USER, ADMIN etc.)

---

# 🧱 Global Data Schemas

## User Object

```ts
type User = {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN" | string
  avatar?: string
  isEmailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}
```

## Auth Tokens

```ts
type AuthTokens = {
  accessToken: string
  refreshToken: string
}
```

## API Success Response

```ts
type ApiResponse<T> = {
  success: true
  message?: string
  data: T
}
```

## API Error Response

```ts
type ApiError = {
  success: false
  message: string
  errors?: string[]
}
```

---

# 📌 ENDPOINT DOCUMENTATION

---

# 1️⃣ Get Current User

**GET** `/users/current-user`

### Description

Returns currently authenticated user.

### Auth

Required

### Headers

```
Authorization: Bearer <access_token>
```

### Response Schema

```ts
type CurrentUserResponse = ApiResponse<User>
```

---

# 2️⃣ Verify Email

**GET** `/users/verify-email/{verificationToken}`

### Description

Verifies user's email using token sent via email.

### Params

```ts
type VerifyEmailParams = {
  verificationToken: string // token from email link
}
```

### Response

```ts
type VerifyEmailResponse = {
  success: true
  message: string
}
```

---

# 3️⃣ Register User

**POST** `/users/register`

### Description

Creates new user account and sends email verification.

### Request Schema

```ts
type RegisterRequest = {
  name: string        // full name
  email: string       // unique email
  password: string    // min 6 chars recommended
}
```

### Response

```ts
type RegisterResponse = {
  success: true
  message: string
}
```

---

# 4️⃣ Login User

**POST** `/users/login`

### Description

Authenticates user and returns tokens.

### Request Schema

```ts
type LoginRequest = {
  email: string
  password: string
}
```

### Response Schema

```ts
type LoginResponse = ApiResponse<{
  accessToken: string
  refreshToken: string
  user: User
}>
```

---

# 5️⃣ Logout User

**POST** `/users/logout`

### Description

Logs out user and invalidates session.

### Auth

Required

### Headers

```
Authorization: Bearer <access_token>
```

### Response

```ts
type LogoutResponse = {
  success: true
  message: string
}
```

---

# 6️⃣ Refresh Token

**POST** `/users/refresh-token`

### Description

Generates new access & refresh tokens.

### Request Schema

```ts
type RefreshTokenRequest = {
  refreshToken: string
}
```

### Response

```ts
type RefreshTokenResponse = ApiResponse<{
  accessToken: string
  refreshToken: string
}>
```

---

# 7️⃣ Assign Role

**POST** `/users/assign-role/{userId}`

### Description

Assign role to user (admin only).

### Params

```ts
type AssignRoleParams = {
  userId: string
}
```

### Request Schema

```ts
type AssignRoleRequest = {
  role: string // e.g. "ADMIN", "USER"
}
```

### Response

```ts
type AssignRoleResponse = {
  success: true
  message: string
}
```

---

# 8️⃣ Resend Email Verification

**POST** `/users/resend-email-verification`

### Description

Resend's email verification link.

### Request

```ts
type ResendEmailRequest = {
  email: string
}
```

### Response

```ts
type ResendEmailResponse = {
  success: true
  message: string
}
```

---

# 9️⃣ Change Password

**POST** `/users/change-password`

### Description

Change password for logged in user.

### Auth

Required

### Request

```ts
type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}
```

### Response

```ts
type ChangePasswordResponse = {
  success: true
  message: string
}
```

---

# 🔟 Forgot Password

**POST** `/users/forgot-password`

### Description

Send password reset email.

### Request

```ts
type ForgotPasswordRequest = {
  email: string
}
```

### Response

```ts
type ForgotPasswordResponse = {
  success: true
  message: string
}
```

---

# 1️⃣1️⃣ Reset Password

**POST** `/users/reset-password/{resetToken}`

### Description

Reset password using token from email.

### Params

```ts
type ResetPasswordParams = {
  resetToken: string
}
```

### Request

```ts
type ResetPasswordRequest = {
  newPassword: string
}
```

### Response

```ts
type ResetPasswordResponse = {
  success: true
  message: string
}
```

---

# 1️⃣2️⃣ Update Avatar

**PATCH** `/users/avatar`

### Description

Update profile avatar.

### Auth

Required

### Headers

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request (FormData)

```ts
type UpdateAvatarRequest = {
  avatar: File // image file
}
```

### Response

```ts
type UpdateAvatarResponse = ApiResponse<{
  avatar: string // image URL
}>
```

---

# 🔄 Full Auth Flow

```
Register
 → verify-email
 → login
 → receive tokens
 → use access token
 → refresh-token when expired
 → logout
```

---

# 🛡️ Security Best Practices

* Store refresh token securely (HTTP only cookie preferred)
* Do not store tokens in localStorage (mobile secure storage instead)
* Rotate refresh tokens
* Always use HTTPS
* Handle 401 → refresh token → retry request

---

# 🧠 Copilot Notes

Use this header for authenticated calls:

```ts
headers: {
  Authorization: `Bearer ${accessToken}`
}
```

Handle token refresh automatically in interceptor.

---

# 🏁 End of Auth Documentation

Optimized for AI Copilot ingestion.
