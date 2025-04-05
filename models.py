from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

# Initialize SQLAlchemy without binding to app yet
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)  # User's full name
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    detections = db.relationship('Detection', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    batch = db.Column(db.String(50), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    detection_id = db.Column(db.Integer, db.ForeignKey('detection.id'), nullable=False)
    product_image = db.Column(db.Text, nullable=True)  # Base64 encoded image

    def is_expiring_soon(self, days=7):
        """Check if product is expiring within 'days' days."""
        if not self.expiry_date:
            return False
        delta = self.expiry_date - datetime.utcnow().date()
        return delta.days >= 0 and delta.days <= days

    def is_expired(self):
        """Check if product is already expired."""
        if not self.expiry_date:
            return False
        return self.expiry_date < datetime.utcnow().date()
    
    def days_until_expiry(self):
        """Get number of days until expiry."""
        if not self.expiry_date:
            return None
        delta = self.expiry_date - datetime.utcnow().date()
        return delta.days
    
    def to_dict(self):
        """Convert product to dictionary for JSON responses."""
        return {
            'id': self.id,
            'name': self.name,
            'batch': self.batch,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'quantity': self.quantity,
            'days_until_expiry': self.days_until_expiry(),
            'is_expired': self.is_expired(),
            'is_expiring_soon': self.is_expiring_soon(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'product_image': self.product_image
        }

class Detection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255), nullable=True)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    products = db.relationship('Product', backref='detection', lazy=True)
    
    def to_dict(self):
        """Convert detection to dictionary for JSON responses."""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'detected_at': self.detected_at.isoformat() if self.detected_at else None,
            'products': [product.to_dict() for product in self.products]
        }