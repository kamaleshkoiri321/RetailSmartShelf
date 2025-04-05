import os
from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from models import db, User, Product, Detection
from werkzeug.middleware.proxy_fix import ProxyFix
import datetime

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database for SQLite
# If using DATABASE_URL, we'll use it, otherwise create a SQLite database
if os.environ.get("DATABASE_URL"):
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
else:
    # For local development, use SQLite
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///retailai.db"

# Additional database config
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
    
# Routes
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        # For demo purposes, create a user if it doesn't exist
        if not user:
            user = User(email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
        # Check password
        if user and user.check_password(password):
            session['user_id'] = user.id
            return jsonify({'success': True}), 200
        
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/detection', methods=['GET', 'POST'])
def detection():
    if request.method == 'POST':
        # Handle product detection API
        user_id = session.get('user_id')
        data = request.get_json()
        
        # Create a new detection
        detection = Detection(user_id=user_id)
        
        # Save image if provided
        if data and 'image_data' in data:
            detection.image_path = data['image_data']  # In a real app, you might save the file to disk instead
        
        db.session.add(detection)
        db.session.flush()  # Get the detection ID
        
        # Mock product data - in a real app, this would come from the detection API
        mock_products = [
            {
                'name': 'Milk',
                'batch': 'A123',
                'expiry': '2025-04-15',
                'quantity': 10
            },
            {
                'name': 'Bread',
                'batch': 'B456',
                'expiry': '2025-04-10',
                'quantity': 5
            },
            {
                'name': 'Eggs',
                'batch': 'C789',
                'expiry': '2025-04-05',
                'quantity': 20
            }
        ]
        
        # Add products to database
        for product_data in mock_products:
            product = Product(
                name=product_data['name'],
                batch=product_data['batch'],
                expiry_date=datetime.datetime.strptime(product_data['expiry'], '%Y-%m-%d').date(),
                quantity=product_data['quantity'],
                detection_id=detection.id
            )
            db.session.add(product)
        
        db.session.commit()
        
        # Return the data
        return jsonify({
            'success': True,
            'detection': detection.to_dict()
        }), 200
    
    return render_template('detection.html')

@app.route('/api/detections', methods=['GET'])
def get_detections():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    # Get the latest detection for this user
    detection = Detection.query.filter_by(user_id=user_id).order_by(Detection.detected_at.desc()).first()
    
    if not detection:
        return jsonify({'success': False, 'message': 'No detections found'}), 404
    
    return jsonify({
        'success': True,
        'detection': detection.to_dict()
    }), 200

@app.route('/api/products', methods=['GET', 'POST'])
def api_products():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    if request.method == 'POST':
        # Add new product
        data = request.get_json()
        
        # Create a new detection for this product
        detection = Detection(user_id=user_id)
        db.session.add(detection)
        db.session.flush()  # Get the detection ID
        
        # Create the product
        try:
            product = Product(
                name=data.get('name'),
                batch=data.get('batch'),
                expiry_date=datetime.datetime.strptime(data.get('expiry_date'), '%Y-%m-%d').date(),
                quantity=data.get('quantity', 0),
                detection_id=detection.id,
                product_image=data.get('product_image')  # Store the base64 image
            )
            db.session.add(product)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'product': product.to_dict()
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({
                'success': False, 
                'message': str(e)
            }), 400
    
    # GET method - fetch all products
    try:
        # Get all detections for this user
        detections = Detection.query.filter_by(user_id=user_id).all()
        
        # Collect all products from these detections
        all_products = []
        for detection in detections:
            all_products.extend(detection.products)
        
        return jsonify({
            'success': True,
            'products': [product.to_dict() for product in all_products]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/inventory')
def inventory():
    return render_template('inventory.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
