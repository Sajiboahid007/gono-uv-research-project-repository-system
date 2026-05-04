/**
 * OpenAPI 3 document for the REST API (paths are relative to server root; all routes live under `/api`).
 */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Gono UV Research Project Repository API",
    version: "1.0.0",
    description:
      "HTTP API for users, authentication, departments, roles, batches, categories, and subcategories.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local development" }],
  tags: [
    { name: "Auth", description: "Login and token refresh" },
    { name: "Users", description: "User CRUD" },
    { name: "Departments", description: "Department CRUD" },
    { name: "Roles", description: "Role CRUD" },
    { name: "Batches", description: "Batch CRUD" },
    { name: "Categories", description: "Category CRUD" },
    { name: "Subcategories", description: "Subcategory CRUD" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT from `POST /api/login` (use as: Authorization: Bearer <token>)",
      },
    },
    schemas: {
      ErrorMessage: {
        type: "object",
        properties: { error: { type: "string" }, message: { type: "string" } },
      },
      LoginRequest: {
        type: "object",
        required: ["Email", "Password"],
        properties: {
          Email: { type: "string" },
          Password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          token: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: [
          "RoleId",
          "Name",
          "Email",
          "StudentId",
          "Password",
          "DepartmentId",
        ],
        properties: {
          RoleId: { type: "integer" },
          Name: { type: "string" },
          Email: { type: "string", format: "email" },
          StudentId: { type: "string" },
          Password: { type: "string" },
          DepartmentId: { type: "integer" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          Name: { type: "string" },
          Email: { type: "string", format: "email" },
          DepartmentId: { type: "integer" },
        },
      },
      DepartmentBody: {
        type: "object",
        properties: {
          Name: { type: "string" },
          Code: { type: "string" },
        },
      },
      RoleBody: {
        type: "object",
        properties: { Name: { type: "string" } },
      },
      BatchBody: {
        type: "object",
        properties: {
          Name: { type: "string" },
          Year: { type: "integer" },
          DepartmentId: { type: "integer" },
        },
      },
      CategoryBody: {
        type: "object",
        properties: {
          Name: { type: "string" },
          Code: { type: "string" },
        },
      },
      SubcategoryCreate: {
        type: "object",
        required: ["Name", "CategoryId", "Code"],
        properties: {
          Name: { type: "string" },
          CategoryId: { type: "integer" },
          Code: { type: "string" },
        },
      },
      SubcategoryUpdate: {
        type: "object",
        properties: {
          Name: { type: "string" },
          CategoryId: { type: "integer" },
          Code: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "JWT and refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/getToken/{refreshToken}": {
      get: {
        tags: ["Auth"],
        summary: "Exchange refresh token for new JWT",
        parameters: [
          {
            name: "refreshToken",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "New tokens",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "404": { description: "Invalid refresh token" },
        },
      },
    },
    "/api/users/get": {
      get: {
        tags: ["Users"],
        summary: "List users (not marked deleted)",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/getByDepartment/{departmentId}": {
      get: {
        tags: ["Users"],
        summary: "List users by department",
        parameters: [
          {
            name: "departmentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/get/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "User not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/create": {
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/update/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Updated" },
          "401": { description: "User not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/delete/{id}": {
      put: {
        tags: ["Users"],
        summary: "Soft-delete user (mark for deletion)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/departments/get": {
      get: {
        tags: ["Departments"],
        summary: "List departments",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/departments/get/{id}": {
      get: {
        tags: ["Departments"],
        summary: "Get department by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/departments/create": {
      post: {
        tags: ["Departments"],
        summary: "Create department",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DepartmentBody" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/departments/update/{id}": {
      put: {
        tags: ["Departments"],
        summary: "Update department",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DepartmentBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/departments/delete/{id}": {
      put: {
        tags: ["Departments"],
        summary: "Soft-delete department",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/roles/get": {
      get: {
        tags: ["Roles"],
        summary: "List roles",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/roles/get/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Get role by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/roles/create": {
      post: {
        tags: ["Roles"],
        summary: "Create role",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/roles/update/{id}": {
      put: {
        tags: ["Roles"],
        summary: "Update role",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/roles/delete/{id}": {
      delete: {
        tags: ["Roles"],
        summary: "Delete role",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/get": {
      get: {
        tags: ["Batches"],
        summary: "List batches",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/get/department/{departmentId}": {
      get: {
        tags: ["Batches"],
        summary: "List batches by department",
        parameters: [
          {
            name: "departmentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/get/{id}": {
      get: {
        tags: ["Batches"],
        summary: "Get batch by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/create": {
      post: {
        tags: ["Batches"],
        summary: "Create batch",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BatchBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/update/{id}": {
      put: {
        tags: ["Batches"],
        summary: "Update batch",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BatchBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/batches/delete/{id}": {
      put: {
        tags: ["Batches"],
        summary: "Soft-delete batch",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/categories/get": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/categories/get/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/categories/create": {
      post: {
        tags: ["Categories"],
        summary: "Create category",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/categories/update/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Update category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryBody" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/categories/delete/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Soft-delete category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/subcategories/get": {
      get: {
        tags: ["Subcategories"],
        summary: "List subcategories",
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/subcategories/get/{id}": {
      get: {
        tags: ["Subcategories"],
        summary: "Get subcategory by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/subcategories/create": {
      post: {
        tags: ["Subcategories"],
        summary: "Create subcategory",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubcategoryCreate" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "401": { description: "Missing or invalid JWT" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/subcategories/update/{id}": {
      put: {
        tags: ["Subcategories"],
        summary: "Update subcategory",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubcategoryUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/subcategories/delete/{id}": {
      put: {
        tags: ["Subcategories"],
        summary: "Soft-delete subcategory",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
  },
} as const;
