from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from database import init_db, db
from models import User, Product, CartItem, Review, Order, OrderItem, ProductImage
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize database
init_db(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    products = Product.query.all()
    return render_template('index.html', products=products)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return redirect(url_for('register'))
        
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/api/products')
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'stock': p.stock,
        'images': [img.url for img in p.images]
    } for p in products])

@app.route('/api/cart', methods=['GET', 'POST'])
@login_required
def cart():
    if request.method == 'POST':
        product_id = request.json.get('product_id')
        quantity = request.json.get('quantity', 1)
        
        product = Product.query.get(product_id)
        if not product or product.stock < quantity:
            return jsonify({'error': 'Product not available'}), 400
        
        cart_item = CartItem.query.filter_by(
            user_id=current_user.id,
            product_id=product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                user_id=current_user.id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        return jsonify({'message': 'Item added to cart'})
    
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': item.id,
        'product_id': item.product_id,
        'name': item.product.name,
        'price': item.product.price,
        'quantity': item.quantity,
        'image': item.product.images[0].url if item.product.images else None
    } for item in cart_items])

@app.route('/api/reviews', methods=['GET', 'POST'])
@login_required
def reviews():
    if request.method == 'POST':
        product_id = request.json.get('product_id')
        rating = request.json.get('rating')
        title = request.json.get('title')
        text = request.json.get('text')
        
        review = Review(
            user_id=current_user.id,
            product_id=product_id,
            rating=rating,
            title=title,
            text=text
        )
        db.session.add(review)
        db.session.commit()
        
        return jsonify({'message': 'Review added successfully'})
    
    product_id = request.args.get('product_id')
    reviews = Review.query.filter_by(product_id=product_id).all()
    return jsonify([{
        'id': r.id,
        'user_id': r.user_id,
        'username': r.user.username,
        'rating': r.rating,
        'title': r.title,
        'text': r.text,
        'created_at': r.created_at.isoformat()
    } for r in reviews])

@app.route('/admin')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        return redirect(url_for('index'))
    
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
    total_customers = User.query.filter_by(is_admin=False).count()
    recent_products = Product.query.order_by(Product.created_at.desc()).limit(6).all()
    
    return render_template('admin.html',
                         total_products=total_products,
                         total_orders=total_orders,
                         total_revenue=total_revenue,
                         total_customers=total_customers,
                         recent_products=recent_products)

@app.route('/api/products', methods=['POST'])
@login_required
def add_product():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    name = request.form.get('name')
    description = request.form.get('description')
    price = float(request.form.get('price'))
    stock = int(request.form.get('stock'))
    images = request.files.getlist('images')
    
    product = Product(
        name=name,
        description=description,
        price=price,
        stock=stock
    )
    db.session.add(product)
    db.session.commit()
    
    for image in images:
        if image.filename:
            filename = secure_filename(image.filename)
            image_path = os.path.join('static', 'uploads', filename)
            image.save(image_path)
            
            product_image = ProductImage(
                product_id=product.id,
                url=f'/static/uploads/{filename}'
            )
            db.session.add(product_image)
    
    db.session.commit()
    return jsonify({'message': 'Product added successfully'})

@app.route('/api/products/<int:id>', methods=['DELETE'])
@login_required
def delete_product(id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    product = Product.query.get_or_404(id)
    
    # Delete associated images
    for image in product.images:
        image_path = os.path.join('static', image.url.lstrip('/'))
        if os.path.exists(image_path):
            os.remove(image_path)
        db.session.delete(image)
    
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True) 