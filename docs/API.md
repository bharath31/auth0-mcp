# Auth0 MCP API Documentation

This document provides detailed information about the available tools and their usage in the Auth0 MCP server.

## Table of Contents

1. [List Users](#list-users)
2. [Create User](#create-user)
3. [Get User](#get-user)
4. [Update User](#update-user)
5. [Delete User](#delete-user)

## List Users

Lists Auth0 users with pagination support.

### Tool Name
`auth0_list_users`

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 0 | Page number for pagination |
| per_page | number | No | 50 | Number of users per page (1-100) |
| include_totals | boolean | No | true | Include total count in response |

### Example Request

```json
{
  "tool": "auth0_list_users",
  "params": {
    "page": 0,
    "per_page": 50,
    "include_totals": true
  }
}
```

### Example Response

```json
{
  "start": 0,
  "limit": 50,
  "length": 2,
  "total": 2,
  "users": [
    {
      "user_id": "auth0|123",
      "email": "user1@example.com",
      "email_verified": true,
      "created_at": "2024-02-23T10:00:00.000Z",
      "updated_at": "2024-02-23T10:00:00.000Z"
    },
    {
      "user_id": "auth0|456",
      "email": "user2@example.com",
      "email_verified": false,
      "created_at": "2024-02-23T11:00:00.000Z",
      "updated_at": "2024-02-23T11:00:00.000Z"
    }
  ]
}
```

## Create User

Creates a new Auth0 user.

### Tool Name
`auth0_create_user`

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| email | string | Yes | - | User's email address |
| password | string | Yes | - | User's password (min 8 characters) |
| connection | string | No | "Username-Password-Authentication" | Auth0 connection name |
| verify_email | boolean | No | false | Send verification email |
| user_metadata | object | No | - | Custom user metadata |
| app_metadata | object | No | - | Custom app metadata |

### Example Request

```json
{
  "tool": "auth0_create_user",
  "params": {
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "connection": "Username-Password-Authentication",
    "verify_email": true,
    "user_metadata": {
      "plan": "premium",
      "preferences": {
        "theme": "dark"
      }
    }
  }
}
```

### Example Response

```json
{
  "user_id": "auth0|789",
  "email": "newuser@example.com",
  "email_verified": false,
  "created_at": "2024-02-23T12:00:00.000Z",
  "updated_at": "2024-02-23T12:00:00.000Z",
  "user_metadata": {
    "plan": "premium",
    "preferences": {
      "theme": "dark"
    }
  }
}
```

## Get User

Retrieves a specific Auth0 user by ID.

### Tool Name
`auth0_get_user`

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | Auth0 user ID |

### Example Request

```json
{
  "tool": "auth0_get_user",
  "params": {
    "id": "auth0|123"
  }
}
```

### Example Response

```json
{
  "user_id": "auth0|123",
  "email": "user@example.com",
  "email_verified": true,
  "created_at": "2024-02-23T10:00:00.000Z",
  "updated_at": "2024-02-23T10:00:00.000Z",
  "last_login": "2024-02-23T12:00:00.000Z",
  "logins_count": 5
}
```

## Update User

Updates an existing Auth0 user.

### Tool Name
`auth0_update_user`

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | Auth0 user ID |
| email | string | No | - | New email address |
| verify_email | boolean | No | - | Send verification email |
| password | string | No | - | New password (min 8 characters) |
| connection | string | No | - | Auth0 connection name |
| blocked | boolean | No | - | Block/unblock user |
| user_metadata | object | No | - | Custom user metadata |
| app_metadata | object | No | - | Custom app metadata |

### Example Request

```json
{
  "tool": "auth0_update_user",
  "params": {
    "id": "auth0|123",
    "email": "updated@example.com",
    "verify_email": true,
    "blocked": false,
    "user_metadata": {
      "plan": "enterprise"
    }
  }
}
```

### Example Response

```json
{
  "user_id": "auth0|123",
  "email": "updated@example.com",
  "email_verified": false,
  "created_at": "2024-02-23T10:00:00.000Z",
  "updated_at": "2024-02-23T13:00:00.000Z",
  "user_metadata": {
    "plan": "enterprise"
  }
}
```

## Delete User

Deletes an Auth0 user.

### Tool Name
`auth0_delete_user`

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | Auth0 user ID |

### Example Request

```json
{
  "tool": "auth0_delete_user",
  "params": {
    "id": "auth0|123"
  }
}
```

### Example Response

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Handling

All tools follow a consistent error handling pattern. When an error occurs, the response will include:

1. A descriptive error message
2. The original error message from Auth0 (if available)
3. An appropriate HTTP status code

Example error response:

```json
{
  "error": {
    "message": "Failed to create user: Email already exists",
    "status": 409
  }
}
```

## Rate Limiting

Auth0's Management API has rate limits that vary by endpoint and subscription plan. Please refer to the [Auth0 Rate Limit documentation](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy) for more details.

## Best Practices

1. Always handle errors appropriately in your client application
2. Implement proper retry logic for rate-limited requests
3. Use appropriate page sizes when listing users
4. Cache user data when appropriate
5. Implement proper logging and monitoring
6. Follow security best practices when storing and transmitting user credentials

## Additional Resources

- [Auth0 Management API Documentation](https://auth0.com/docs/api/management/v2)
- [Auth0 Best Practices](https://auth0.com/docs/best-practices)
- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/protocol)
