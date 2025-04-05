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

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        # For frontend development, always register successfully
        # Set a fake user ID for session
        session['user_id'] = 1
        return jsonify({'success': True}), 201
        
        # Regular registration process (commented out for now)
        # # Check if email already exists
        # existing_user = User.query.filter_by(email=email).first()
        # if existing_user:
        #     return jsonify({'success': False, 'message': 'Email already registered'}), 400
        # 
        # # Create new user
        # user = User(username=name, email=email)
        # user.set_password(password)
        # db.session.add(user)
        # db.session.commit()
        # 
        # # Log the user in
        # session['user_id'] = user.id
        # return jsonify({'success': True}), 201
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # For frontend development, accept any credentials
        # Use a fake user ID 
        session['user_id'] = 1
        return jsonify({'success': True}), 200
        
        # Regular authentication (commented out for now)
        # user = User.query.filter_by(email=email).first()
        # if user and user.check_password(password):
        #     session['user_id'] = user.id
        #     return jsonify({'success': True}), 200
        # return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/detection', methods=['GET', 'POST'])
def detection():
    # For frontend development, let's skip authentication check
    # if 'user_id' not in session:
    #     return redirect(url_for('login'))
        
    if request.method == 'POST':
        # Handle product detection API (without DB interaction)
        data = request.get_json()
        
        # Demo detection data for frontend testing
        detection_response = {
            'id': 1,
            'image_path': data.get('image_data') if data and 'image_data' in data else None,
            'detected_at': datetime.datetime.now().isoformat(),
            'products': [
                {
                    'id': 1,
                    'name': 'Milk',
                    'batch': 'A123',
                    'expiry_date': '2025-04-15',
                    'quantity': 10,
                    'days_until_expiry': 10,
                    'is_expired': False,
                    'is_expiring_soon': False,
                    'created_at': '2025-04-01T00:00:00',
                    'product_image': None
                },
                {
                    'id': 2,
                    'name': 'Bread',
                    'batch': 'B456',
                    'expiry_date': '2025-04-08',
                    'quantity': 5,
                    'days_until_expiry': 3,
                    'is_expired': False,
                    'is_expiring_soon': True,
                    'created_at': '2025-04-02T00:00:00',
                    'product_image': None
                },
                {
                    'id': 3,
                    'name': 'Eggs',
                    'batch': 'C789',
                    'expiry_date': '2025-04-02',
                    'quantity': 20,
                    'days_until_expiry': -3,
                    'is_expired': True,
                    'is_expiring_soon': False,
                    'created_at': '2025-04-03T00:00:00',
                    'product_image': None
                }
            ]
        }
        
        # Return the demo data
        return jsonify({
            'success': True,
            'detection': detection_response
        }), 200
    
    return render_template('detection.html')

@app.route('/api/detections', methods=['GET'])
def get_detections():
    # For frontend development, let's skip authentication check
    # user_id = session.get('user_id')
    # if not user_id:
    #     return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    # Demo detection data for frontend testing
    detection = {
        'id': 1,
        'image_path': None, # Could be a base64 image data URL for testing
        'detected_at': datetime.datetime.now().isoformat(),
        'products': [
            {
                'id': 1,
                'name': 'Milk',
                'batch': 'A123',
                'expiry_date': '2025-04-15',
                'quantity': 10,
                'days_until_expiry': 10,
                'is_expired': False,
                'is_expiring_soon': False,
                'created_at': '2025-04-01T00:00:00',
                'product_image': None
            },
            {
                'id': 2,
                'name': 'Bread',
                'batch': 'B456',
                'expiry_date': '2025-04-08',
                'quantity': 5,
                'days_until_expiry': 3,
                'is_expired': False,
                'is_expiring_soon': True,
                'created_at': '2025-04-02T00:00:00',
                'product_image': None
            },
            {
                'id': 3,
                'name': 'Eggs',
                'batch': 'C789',
                'expiry_date': '2025-04-02',
                'quantity': 20,
                'days_until_expiry': -3,
                'is_expired': True,
                'is_expiring_soon': False,
                'created_at': '2025-04-03T00:00:00',
                'product_image': None
            }
        ]
    }
    
    return jsonify({
        'success': True,
        'detection': detection
    }), 200

@app.route('/api/products', methods=['GET', 'POST'])
def api_products():
    # For frontend development, let's use demo data instead of database
    if request.method == 'POST':
        data = request.get_json()
        
        # Just return success with the posted data for frontend testing
        return jsonify({
            'success': True,
            'product': {
                'id': 1001,
                'name': data.get('name', 'New Product'),
                'batch': data.get('batch', 'BATCH-001'),
                'expiry_date': data.get('expiry_date', '2025-04-30'),
                'quantity': data.get('quantity', 1),
                'days_until_expiry': 25,
                'is_expired': False,
                'is_expiring_soon': False,
                'created_at': datetime.datetime.now().isoformat(),
                'product_image': data.get('product_image')
            }
        }), 201
    
    # GET method - return demo product data for frontend development
    demo_products = [
        {
            'id': 1,
            'name': 'Milk',
            'batch': 'A123',
            'expiry_date': '2025-04-15',
            'quantity': 10,
            'days_until_expiry': 10,
            'is_expired': False,
            'is_expiring_soon': False,
            'created_at': '2025-04-01T00:00:00',
            'product_image': None
        },
        {
            'id': 2,
            'name': 'Bread',
            'batch': 'B456',
            'expiry_date': '2025-04-08',
            'quantity': 5,
            'days_until_expiry': 3,
            'is_expired': False,
            'is_expiring_soon': True,
            'created_at': '2025-04-02T00:00:00',
            'product_image': None
        },
        {
            'id': 3,
            'name': 'Eggs',
            'batch': 'C789',
            'expiry_date': '2025-04-02',
            'quantity': 20,
            'days_until_expiry': -3,
            'is_expired': True,
            'is_expiring_soon': False,
            'created_at': '2025-04-03T00:00:00',
            'product_image': None
        }
    ]
    
    return jsonify({
        'success': True,
        'products': demo_products
    }), 200

@app.route('/inventory')
def inventory():
    # For frontend development, let's skip authentication check
    # if 'user_id' not in session:
    #     return redirect(url_for('login'))
        
    return render_template('inventory.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
