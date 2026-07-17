## Purpose

The purpose of this case study is to evaluate the candidate's ability to:

* Develop a mobile application
* Consume REST APIs
* Perform CRUD operations
* Manage application state
* Create reusable components
* Handle forms and validations
* Manage local storage
* Write clean and maintainable code

---

## Scenario

You are developing the mobile version of a restaurant management panel.

The application will allow restaurant managers to manage their menu products.

The user should be able to:

* View product categories
* List menu products
* View product details
* Add a new product
* Edit an existing product
* Delete a product
* Search products
* Sort products
* Add products to favorites

The application should use the **DummyJSON REST API**.

API Documentation:

https://dummyjson.com/docs/products

---

## API Endpoints

Base URL:

```text
https://dummyjson.com
```

### Products

```http
GET /products
```

```http
GET /products/{id}
```

```http
POST /products/add
```

```http
PUT /products/{id}
```

```http
DELETE /products/{id}
```

### Categories

```http
GET /products/categories
```

Products may also be retrieved by category:

```http
GET /products/category/{category}
```

---

## Screens

### 1. Product List

All products should be displayed on this screen.

Each product item should contain:

* Product image
* Product name
* Price
* Category
* Favorite status

Each product should provide the following actions:

* View details
* Add to or remove from favorites
* Edit
* Delete

The screen should also include:

* Product search
* Category filtering
* Product sorting
* Pull to Refresh

---

### 2. Product Detail

The selected product's information should be displayed.

The screen should contain:

* Product image
* Product name
* Description
* Price
* Category
* Favorite status
* Edit action
* Delete action

---

### 3. Add Product

The user should be able to create a new product.

The form should contain the following fields:

* Product name
* Description
* Price
* Category
* Image URL

Submitting the form should send a create request to the API.

---

### 4. Edit Product

The user should be able to edit an existing product.

The form should initially display the current product information.

Submitting the form should send an update request to the API.

---

### 5. Favorite Products

The application should contain a separate screen that displays only favorite products.

The user should be able to:

* Add a product to favorites
* Remove a product from favorites
* View favorite products after restarting the application

Favorite product IDs should be stored locally using a suitable persistent storage solution.

Examples:

* AsyncStorage
* MMKV
* Another appropriate local storage solution

Favorites do not need to be sent to the API.

---

## Search

The Product List screen should support searching products by name.

Search may be implemented using either:

* The DummyJSON search endpoint
* Client-side filtering

Example API request:

```http
GET /products/search?q={searchText}
```

The search result should update according to the entered text.

---

## Category Filtering

The user should be able to filter products by category.

Categories should be retrieved from the API.

When a category is selected, only products belonging to that category should be displayed.

An option to display all products should also be available.

---

## Sorting

The user should be able to sort products using the following options:

* Name: A to Z
* Name: Z to A
* Price: Low to High
* Price: High to Low

Sorting may be performed locally after products are retrieved from the API.

The selected sorting option should be clearly visible to the user.

---

## Delete Product

Before deleting a product, a confirmation dialog should be displayed.

Example:

```text
Are you sure you want to delete this product?
```

The delete request should only be sent after the user confirms the action.

---

## Pull to Refresh

The Product List screen should support Pull to Refresh.

When triggered, product data should be retrieved from the API again.

---

## Form Validation

The following fields are required:

* Product name
* Price
* Category

Validation rules:

* Product name cannot be empty.
* Price must be a valid number.
* Price must be greater than 0.
* Category must be selected.
* Image URL should be validated when provided.

Validation messages should be clearly displayed to the user.

---

## Loading and Error States

The application should properly handle:

* Initial loading
* Form submission loading
* Refresh loading
* Empty search results
* Empty favorite product list
* API request errors
* Product creation errors
* Product update errors
* Product deletion errors

The user should receive clear feedback after successful or failed operations.

---

## Technical Expectations

The following topics will be evaluated:

* REST API integration
* Clean and readable code
* Component architecture
* Project and folder structure
* State management
* Form handling
* Form validation
* Local storage usage
* Error handling
* Loading state management
* Responsive mobile design
* Git commit history

---

## Technologies

Candidates may choose an appropriate technology stack.

### Framework

* React Native
* Expo

### State Management

Any state management solution may be used.

### Navigation

Any navigation library may be used.

### Form Management

Any form management solution may be used.

### UI Library

Any UI library may be used.

Examples:

* AntDesign

---

## API Behavior Notice

DummyJSON simulates create, update, and delete operations.

Create, update, and delete requests return successful responses, but these changes may not be permanently stored on the DummyJSON server.

The application should still:

* Send the correct API requests
* Handle successful responses
* Update the local application state
* Reflect the operation immediately in the user interface

---

## Submission

Please provide:

* A public or accessible GitHub repository
* Installation and startup instructions
* A short explanation of the chosen architecture
* Information about the technologies and libraries used
* Any relevant assumptions made during development

The project should be runnable by following the instructions provided in the repository.

---

## AI Assistance

You may use AI-assisted development tools (such as ChatGPT, GitHub Copilot, Claude, Cursor, etc.) during this assignment.

However, you should fully understand and be able to explain every part of your implementation during the technical interview.

The focus of the evaluation is your problem-solving approach, architectural decisions, and understanding of the code—not whether AI tools were used.

---

## Deadline

Please complete and submit the assignment within **5 days** after receiving it.