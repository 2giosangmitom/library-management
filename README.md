# BookWise - A library management system

BookWise is a library management system.

## ER Diagram

```mermaid
erDiagram
  USER {
    UUID user_id PK
    VARCHAR(50) name
    VARCHAR(100) email UNIQUE
    VARCHAR(255) password_hash
    VARCHAR(255) salt
    ENUM role "MEMBER, LIBRARIAN"
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  CATEGORY {
    UUID category_id PK
    VARCHAR(100) name
    VARCHAR(50) slug
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  AUTHOR {
    UUID author_id PK
    VARCHAR(100) name
    TEXT biography
    DATE date_of_birth "NULLABLE"
    DATE date_of_death "NULLABLE"
    VARCHAR(100) nationality
    VARCHAR(50) slug
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  BOOK {
    UUID book_id PK
    VARCHAR(255) title
    TEXT description
    INT total_copies
    INT available_copies
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  BOOK_AUTHOR {
    UUID book_id PK, FK
    UUID author_id PK, FK
  }

  BOOK_CATEGORY {
    UUID book_id PK, FK
    UUID category_id PK, FK
  }

  LOAN {
    UUID loan_id PK
    UUID user_id FK
    UUID book_id FK
    DATE loan_date
    DATE due_date
    DATE return_date "NULLABLE"
    ENUM status "BORROWED, RETURNED, OVERDUE"
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  USER ||--o{ LOAN: "borrows"
  BOOK ||--o{ LOAN: "is loaned in"
  BOOK ||--o{ BOOK_AUTHOR: "has"
  AUTHOR ||--o{ BOOK_AUTHOR: "writes"
  BOOK ||--o{ BOOK_CATEGORY: "belongs to"
  CATEGORY ||--o{ BOOK_CATEGORY: "includes"
```
