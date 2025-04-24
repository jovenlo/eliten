# Eiten Jewelry Website Backend

This is the backend system for the Eiten Jewelry website, built with Flask and SQLite.

## Project Structure

```
jewelry_website/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── database.py         # Database configuration
│   ├── routes/             # Route handlers
│   ├── static/             # Static files (CSS, JS, images)
│   └── templates/          # HTML templates
├── requirements.txt        # Python dependencies
└── README.md              # Project documentation
```

## Features

- User authentication (login/register)
- Product management
- Shopping cart functionality
- Review system
- Order management
- Admin dashboard

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create a .env file with:
DATABASE_URL=sqlite:///jewelry.db
SECRET_KEY=your-secret-key-here
```

4. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

5. Run the application:
```bash
python backend/app.py
```

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `GET /logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/<id>` - Get product details
- `POST /api/products` - Create new product (admin only)
- `PUT /api/products/<id>` - Update product (admin only)
- `DELETE /api/products/<id>` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/<id>` - Update cart item
- `DELETE /api/cart/<id>` - Remove item from cart

### Reviews
- `GET /api/reviews` - Get product reviews
- `POST /api/reviews` - Add review
- `DELETE /api/reviews/<id>` - Delete review

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/<id>` - Get order details

## Database Schema

### Users
- id (Primary Key)
- username
- email
- password_hash
- first_name
- last_name
- created_at
- is_admin

### Products
- id (Primary Key)
- name
- description
- price
- stock
- created_at
- updated_at

### Cart Items
- id (Primary Key)
- user_id (Foreign Key)
- product_id (Foreign Key)
- quantity

### Reviews
- id (Primary Key)
- user_id (Foreign Key)
- product_id (Foreign Key)
- rating
- title
- text
- created_at

### Orders
- id (Primary Key)
- user_id (Foreign Key)
- total_amount
- status
- created_at

### Order Items
- id (Primary Key)
- order_id (Foreign Key)
- product_id (Foreign Key)
- quantity
- price

## Security

- Password hashing using Werkzeug
- CSRF protection
- Session management
- Admin-only routes protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 