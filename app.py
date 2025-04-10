import os
import logging
import json
from flask import Flask, render_template, jsonify

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Load product data
def load_products():
    try:
        with open('static/data/products.json', 'r') as file:
            return json.load(file)
    except Exception as e:
        logging.error(f"Error loading product data: {e}")
        return {"products": []}

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/payment')
def payment():
    return render_template('payment.html')

@app.route('/api/products')
def get_products():
    products = load_products()
    return jsonify(products)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
