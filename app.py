from flask import Flask, redirect, render_template, request, session, url_for, make_response, Response
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from datetime import timedelta
import os
from flask import jsonify
from sqlalchemy import func
import json 
import csv
from io import StringIO
import webbrowser # for opening in browser automatically
from threading import Timer
import subprocess #for the full-screen command
import sys

app = Flask(__name__)

if getattr(sys, 'frozen', False):
    basedir = os.path.dirname(sys.executable)
else:
    basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.secret_key = "my_super_secret_key"

db = SQLAlchemy(app)


# User Table
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='cashier')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    expiration_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.expiration_date:
            self.expiration_date = datetime.now() + timedelta(days=365)

#Shift Management Table
class Shift_management(db.Model):
    shift_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
    opening_cash = db.Column(db.Float, nullable = False, default = 0.0)
    final_cash = db.Column(db.Float, nullable = True)
    start_time = db.Column(db.DateTime, nullable = False, default = datetime.now)
    end_time = db.Column(db.DateTime, nullable = True)
    status = db.Column(db.Boolean, default = True)

#Products Table
class Products(db.Model):
    product_id = db.Column(db.Integer, primary_key=True)
    barcode = db.Column(db.String(100), unique=True, nullable=False)
    product_name = db.Column(db.String(200), nullable=False)
    composition = db.Column(db.String(200), nullable=True) 
    manufacturer = db.Column(db.String(100), nullable=True) 
    schedule_type = db.Column(db.String(10), default="Normal")
    category = db.Column(db.String(100), nullable=False)
    hsn_code = db.Column(db.String(20), nullable=True)
    tax_rate = db.Column(db.Float, nullable=False, default=0.0)
    
    batches = db.relationship('Batches', backref='product', lazy=True)

# 2. Batches (Where the Money & Stock lives)
class Batches(db.Model):
    batch_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    batch_code = db.Column(db.String(50), nullable=False) 
    expiry_date = db.Column(db.Date, nullable=False)      
    
    cost_price = db.Column(db.Float, nullable=False)
    mrp = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    
    stocks = db.Column(db.Integer, nullable=False, default=0)

# 3. Doctors (Optional, but good for "Schedule H" compliance)
class Doctors(db.Model):
    doctor_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

# Customer table
class Customers(db.Model):
    customer_id = db.Column(db.Integer, primary_key = True)
    phone_number = db.Column(db.String(), unique = True, nullable = True, default = "0")
    name = db.Column(db.String(), nullable = True, default = "Walk-in Customer")
    email = db.Column(db.String(), nullable = True, default = "walkin@example.com")

# Orders Table (Bill header)
class Orders(db.Model):
    order_id = db.Column(db.Integer, primary_key = True)
    invoice_no = db.Column(db.String(), unique = True, nullable = False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'), nullable = False)
    shift_id = db.Column(db.Integer, db.ForeignKey('shift_management.shift_id'), nullable = False)
    total_amount_before_tax = db.Column(db.Float, nullable = False, default = 0.0)
    tax_amount = db.Column(db.Float, nullable = False, default = 0.0)
    
    discount_amount = db.Column(db.Float, nullable = False, default = 0.0) 
    doctor_name = db.Column(db.String(100), nullable=True) 
    
    final_amount = db.Column(db.Float, nullable = False)
    status = db.Column(db.String(), nullable = False, default = "Paid")
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now)

# Update Order_items Table (Add batch_id)
class Order_items(db.Model):
    order_item_id = db.Column(db.Integer, primary_key = True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable = False)
    batch_id = db.Column(db.Integer, db.ForeignKey('batches.batch_id'), nullable = True) 
    item_name = db.Column(db.String(200), nullable=True)
    quantity = db.Column(db.Integer, nullable = False, default = 1)
    unit_price = db.Column(db.Float, nullable = False)
    total_price = db.Column(db.Float, nullable = False)
    avail_return_items = db.Column(db.Integer, nullable = False, default = 0)


# Payments Table
class Payments(db.Model):
    payment_id = db.Column(db.Integer, primary_key = True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable = False)
    cash = db.Column(db.Float, nullable = False, default = 0.0)
    upi = db.Column(db.Float, nullable = False, default = 0.0)
    card = db.Column(db.Float, nullable = False, default = 0.0)
    total_paid = db.Column(db.Float, nullable = False)
    excess_amount = db.Column(db.Float, nullable = False, default = 0.0)
    payment_time = db.Column(db.DateTime, nullable = False, default = datetime.now)
    upi_txn_id = db.Column(db.String(), nullable = True, default = "")
    card_txn_id = db.Column(db.String(), nullable = True, default = "")


# Active Bills Table
class Active_Bills(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    bills_data = db.Column(db.Text, nullable=False) 
    last_updated = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

# Returns Table
class Returns(db.Model):
    return_id = db.Column(db.Integer, primary_key = True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable = False)
    shift_id = db.Column(db.Integer, db.ForeignKey(Shift_management.shift_id), nullable = False)
    refund_amount = db.Column(db.Float, nullable = False)
    return_time = db.Column(db.DateTime, nullable = False, default = datetime.now)

# Return Items Table
class Return_items(db.Model):
    return_item_id = db.Column(db.Integer, primary_key = True)
    return_id = db.Column(db.ForeignKey('returns.return_id'), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable = False)
    quantity = db.Column(db.Integer, nullable = False, default = 1)


# --- ROUTES ---

@app.route('/')
def index():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.password == password:
            
            if user.expiration_date < datetime.now():
                if user.role != 'admin':
                    return render_template('login.html', error="License Expired. Billing Disabled.")

            session['user_id'] = user.user_id
            session['username'] = user.username
            session['role'] = user.role
            
            if user.role == 'admin':
                return redirect('/admin/stocks')
            else:
                return redirect('/dashboard')
        else:
            return render_template('login.html', error="Invalid username or password!")

    return render_template('login.html')


@app.route('/dashboard', methods = ['GET', 'POST'])
def dashboard():
    if 'user_id' not in session:
        return redirect('/login')
    
    current_user = session['user_id']

    user_obj = User.query.get(current_user)
    if user_obj.expiration_date < datetime.now():
        return redirect('/admin/stocks') 


    active_shift = Shift_management.query.filter_by(user_id=current_user, status=True).first()
    opening_cash = active_shift.opening_cash if active_shift else 0.0

    active_record = Active_Bills.query.filter_by(user_id = current_user).first()

    default_bill = [{ 
        'id': 1, 
        'cart': [], 
        'customer': {'phone': '', 'name': '', 'email': ''}, 
        'isScanEnabled': True 
    }]

    if active_record and active_record.bills_data:
        try:
            saved_bills = json.loads(active_record.bills_data)
            if not saved_bills:
                saved_bills = default_bill
        except:
            saved_bills = default_bill
    else:
        saved_bills = default_bill
    return render_template('dashboard.html', username=session['username'], active_shift=active_shift, opening_cash = opening_cash, saved_bills = saved_bills)


@app.route('/start_shift', methods = ['POST'])
def start_shift():
    # To start a new Shift
    if 'user_id' not in session:
        return redirect('/login')

    opening_cash = request.form.get('opening_cash')

    new_shift = Shift_management(
        user_id = session['user_id'],
        opening_cash = float(opening_cash),
        start_time = datetime.now(),
        status = True
    )

    db.session.add(new_shift)
    db.session.commit()

    return redirect('/dashboard')


# To close the current Shift
@app.route('/shift_close', methods = ['POST'])
def shift_close():
    if 'user_id' not in session:
        return redirect('/login')

    current_user = session['user_id']
    active_shift = Shift_management.query.filter_by(user_id = current_user, status = True).first()

    if active_shift:
        final_cash = request.form.get('actual_cash')
        active_shift.final_cash = float(final_cash)
        active_shift.end_time = datetime.now()
        active_shift.status = False

        db.session.commit()
        return redirect('/logout')

# To get all products from DB to JSON Format
# --- UPDATED GET PRODUCTS ROUTE (PHARMA COMPATIBLE) ---
@app.route('/get_products', methods=['GET'])
def get_products():
    if 'user_id' not in session: 
        return jsonify([])
    
    products = Products.query.all()
    product_list = []
    
    for p in products:
        # LOGIC: Find the best price to display in search (Starting from...)
        # We grab the selling price of the first active batch, or 0 if no stock.
        active_batch = Batches.query.filter_by(product_id=p.product_id).first()
        
        display_price = active_batch.selling_price if active_batch else 0.0
        total_stock = sum(b.stocks for b in p.batches) # Sum stock from all batches

        product_list.append({
            'product_id': p.product_id,
            'barcode': p.barcode,
            'product_name': p.product_name,
            'category': p.category,
            'manufacturer': p.manufacturer,
            'composition': p.composition,
            'selling_price': display_price, # Calculated from batch
            'stocks': total_stock           # Calculated sum
        })
        
    return jsonify(product_list)

# To get Batches
@app.route('/get_product_batches/<barcode>')
def get_product_batches(barcode):
    if 'user_id' not in session: return jsonify({'status': 'error'})

    # 1. Find Product
    prod = Products.query.filter_by(barcode=barcode).first()
    if not prod:
        return jsonify({'status': 'not_found'})

    # 2. Find All Active Batches (with stock)
    # Sort by Expiry Date (FIFO Logic)
    active_batches = Batches.query.filter(
        Batches.product_id == prod.product_id, 
        Batches.stocks > 0
    ).order_by(Batches.expiry_date.asc()).all()
    
    batch_list = []
    today = datetime.now().date()
    
    for b in active_batches:
        # Calculate Expiry Status
        days_left = (b.expiry_date - today).days
        status = "valid"
        if days_left < 0: status = "expired"
        elif days_left < 90: status = "near_expiry" # Warning for < 3 months

        batch_list.append({
            'batch_id': b.batch_id,
            'batch_code': b.batch_code,
            'expiry': b.expiry_date.strftime('%b-%Y'), # e.g., "Jan-2026"
            'mrp': b.mrp,
            'sp': b.selling_price,
            'stock': b.stocks,
            'status': status
        })

    return jsonify({
        'status': 'success',
        'product': {
            'id': prod.product_id,
            'name': prod.product_name,
            'manufacturer': prod.manufacturer,
            'composition': prod.composition
        },
        'batches': batch_list
    })




# To save data of Completed Bill
@app.route('/save_bill', methods=['POST'])
def save_bill():
    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json()
    current_user = session['user_id']
    payment_data = data.get('payment_details', {})

    # Validation
    if payment_data.get('upi', 0.0) + payment_data.get('card', 0.0) > data.get('total_amount', 0.0):
        return jsonify({'status': 'error', 'message': 'Card/UPI payments must be exact amount.'}), 400

    active_shift = Shift_management.query.filter_by(user_id=current_user, status=True).first()
    if not active_shift:
        return jsonify({'status': 'error', 'message': 'No active shift found'}), 400

    # Handle Customer
    phone = data.get('customer_phone')
    customer = None
    if phone:
        customer = Customers.query.filter_by(phone_number=phone).first()
        if not customer:
            customer = Customers(
                phone_number=phone,
                name=data.get('customer_name', 'Walk-in'),
                email=data.get('customer_email')
            )
            db.session.add(customer)
            db.session.flush()
    else:
        # Default Walk-in
        customer = Customers.query.filter_by(phone_number="0").first()
        if not customer:
            customer = Customers(phone_number="0", name="Walk-in Customer")
            db.session.add(customer)
            db.session.flush()

    invoice_number = f"INV-{int(datetime.now().timestamp())}"
    
    # Create Order (With Doctor & Discount)
    new_order = Orders(
        invoice_no=invoice_number,
        customer_id=customer.customer_id,
        shift_id=active_shift.shift_id,
        total_amount_before_tax=data.get('sub_total', 0.0), # From frontend sub_total
        tax_amount=0.0, 
        discount_amount=float(data.get('discount', 0.0)),   # Capture Discount
        doctor_name=data.get('doctor_name'),                # Capture Doctor
        final_amount=data.get('total_amount'),
        status="Paid"
    )
    db.session.add(new_order)
    db.session.flush() 

    # Process Items
    for item in data.get('items', []):
        
        # 1. Get the Name sent from Frontend (Works for Manual & DB items)
        name_to_save = item.get('name', 'Unknown Product') 

        # --- Manual Item (Product ID 0) ---
        if item.get('product_id') == 0:
            order_item = Order_items(
                order_id=new_order.order_id,
                product_id=0,
                item_name=name_to_save,  # <--- SAVING THE NAME HERE
                batch_id=None,
                quantity=item['qty'],
                unit_price=item['price'],
                total_price=item['price'] * item['qty']
            )
            db.session.add(order_item)
            continue 

        # --- DB Item ---
        batch = Batches.query.get(item['batch_id'])
        product = Products.query.get(item['product_id'])
        
        if batch and product:
            order_item = Order_items(
                order_id=new_order.order_id,
                product_id=product.product_id,
                item_name=name_to_save,  # <--- SAVING THE NAME HERE TOO
                batch_id=batch.batch_id,
                quantity=item['qty'],
                unit_price=item['price'],
                total_price=item['price'] * item['qty']
            )
            
            if batch.stocks >= item['qty']:
                batch.stocks -= item['qty']
            else:
                db.session.rollback()
                return jsonify({'status': 'error', 'message': f"Insufficient stock for Batch: {batch.batch_code}"}), 400
                
            db.session.add(order_item)

    # Process Payment
    cash_received = payment_data.get('cash', 0.0)
    upi_received = payment_data.get('upi', 0.0)
    card_received = payment_data.get('card', 0.0)
    bill_total = data.get('total_amount', 0.0)

    total_paid = card_received + upi_received + cash_received
    excess_amount = max(0.0, total_paid - bill_total)

    new_payment = Payments(
        order_id=new_order.order_id,
        cash=cash_received - excess_amount, # Store actual cash kept
        upi=upi_received,
        card=card_received,
        total_paid=bill_total,
        excess_amount=excess_amount
    )
    db.session.add(new_payment)

    try:
        db.session.commit()
        return jsonify({'status': 'success', 'invoice_no': invoice_number})
    except Exception as e:
        db.session.rollback()
        print("Error:", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Receipt Print
@app.route('/print_receipt/<invoice_no>')
def print_receipt(invoice_no):
    if 'user_id' not in session: return redirect('/login')

    order = Orders.query.filter_by(invoice_no=invoice_no).first_or_404()
    items = Order_items.query.filter_by(order_id=order.order_id).all()
    customer = Customers.query.get(order.customer_id)
    
    # Store Info (You can make this dynamic later)
    shop = {
        "name": "APOLLO PHARMACY",
        "address": "123, Anna Salai, Chennai - 600002",
        "phone": "044-12345678",
        "gstin": "33AAAAA0000A1Z5",
        "dl_no_20": "TN-14-20B-12345",
        "dl_no_21": "TN-14-21B-67890"
    }

    processed_items = []
    
    # Rename Order model fields to match receipt template expectation
    # Creating a wrapper object or modifying logic to pass data cleanly
    
    # We pass 'bill' object to template, so we construct a dict matching template needs
    bill_data = {
        "invoice_no": order.invoice_no,
        "date": order.created_at,
        "customer_name": customer.name,
        "customer_phone": customer.phone_number,
        "doctor_name": order.doctor_name, # Passed from DB
        "sub_total": order.total_amount_before_tax,
        "discount": order.discount_amount,
        "total_amount": order.final_amount
    }

    for item in items:
        product_name = item.item_name
        
        if not product_name:
            if item.product_id == 0:
                product_name = "Manual Item"
            else:
                prod = Products.query.get(item.product_id)
                product_name = prod.product_name if prod else "Unknown"

        batch = Batches.query.get(item.batch_id) if item.batch_id else None
        
        manufacturer = "N/A"
        hsn_code = "-"
        if item.product_id != 0:
            prod = Products.query.get(item.product_id)
            if prod:
                manufacturer = prod.manufacturer
                hsn_code = prod.hsn_code if prod.hsn_code else "3004"

        processed_items.append({
            "product_name": product_name, 
            "manufacturer": manufacturer,
            "hsn_code": hsn_code,
            "batch_code": batch.batch_code if batch else "N/A",
            "expiry_date": batch.expiry_date.strftime('%b-%y') if batch else "-",
            "quantity": item.quantity,
            "total_price": item.total_price
        })

    return render_template('receipt.html', bill=bill_data, items=processed_items, shop=shop)


# Cash Management 
@app.route('/get_dashboard_stats', methods=['GET'])
def get_dashboard_stats():
    if 'user_id' not in session:
        return jsonify({})

    current_user = session['user_id']
    
    active_shift = Shift_management.query.filter_by(user_id=current_user, status=True).first()
    
    if not active_shift:
        return jsonify({
            'total_sales': 0,
            'cash': 0,
            'upi': 0,
            'card': 0
        })

    total_sales = db.session.query(func.sum(Orders.final_amount))\
        .filter_by(shift_id=active_shift.shift_id).scalar() or 0.0

    total_refund = db.session.query(func.sum(Returns.refund_amount))\
        .filter_by(shift_id=active_shift.shift_id).scalar() or 0.0

    payment_stats = db.session.query(
        func.sum(Payments.cash),
        func.sum(Payments.upi),
        func.sum(Payments.card)
    ).join(Orders).filter(Orders.shift_id == active_shift.shift_id).first()

    cash_total = payment_stats[0] or 0.0
    upi_total = payment_stats[1] or 0.0
    card_total = payment_stats[2] or 0.0

    recent_orders = db.session.query(Orders, Customers, Payments)\
        .join(Customers, Orders.customer_id == Customers.customer_id)\
        .join(Payments, Orders.order_id == Payments.order_id)\
        .filter(Orders.shift_id == active_shift.shift_id)\
        .order_by(Orders.created_at.desc())\
        .limit(10).all()

    transactions_list = []
    for order, cust, pay in recent_orders:
        methods = []
        if pay.cash > 0: methods.append("Cash")
        if pay.upi > 0: methods.append("UPI")
        if pay.card > 0: methods.append("Card")
        method_str = " + ".join(methods) if methods else "Unknown"

        transactions_list.append({
            'time': order.created_at.strftime('%I:%M %p'), 
            'bill_no': order.invoice_no,
            'customer': cust.name,
            'method': method_str,
            'amount': order.final_amount,
            'status': order.status,
        })

    return jsonify({
        'total_sales': total_sales,
        'cash': cash_total - total_refund,
        'upi': upi_total,
        'card': card_total,
        'transactions': transactions_list,
        'refunds': total_refund
    })


# Save Active Bills
@app.route('/save_active_state', methods=['POST'])
def save_active_state():
    if 'user_id' not in session:
        return jsonify({'status': 'error'})

    user_id = session['user_id']
    data = request.get_json()
    bills_json = json.dumps(data.get('bills')) 
    
    active_record = Active_Bills.query.filter_by(user_id=user_id).first()

    if active_record:
        active_record.bills_data = bills_json
    else:
        new_record = Active_Bills(user_id=user_id, bills_data=bills_json)
        db.session.add(new_record)
    
    db.session.commit()
    return jsonify({'status': 'saved'})


# Returns Management
@app.route('/search_bill/<invoice_no>', methods=['GET'])
def search_bill(invoice_no):
    if 'user_id' not in session: 
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    # 1. Find the Bill
    order = Orders.query.filter_by(invoice_no=invoice_no).first()
    if not order: 
        return jsonify({'status': 'error', 'message': 'Bill not found'}), 404

    customer = Customers.query.get(order.customer_id)
    
    # 2. Get Items
    # We join Products to get names
    items = db.session.query(Order_items, Products).join(Products, Order_items.product_id == Products.product_id).filter(Order_items.order_id == order.order_id).all()
    
    item_list = []
    for order_item, product in items:
        # Calculate how many can still be returned
        returnable_qty = order_item.quantity - order_item.avail_return_items
        
        item_list.append({
            'product_id': product.product_id,
            'name': product.product_name,
            'qty_bought': order_item.quantity,
            'sold_price': order_item.unit_price, 
            'total': order_item.total_price,
            'avail_to_return': returnable_qty
        })

    return jsonify({
        'status': 'success',
        'order_id': order.order_id,
        'customer': customer.name if customer else "Unknown",
        'original_total': order.final_amount,
        'items': item_list
    })


@app.route('/process_return', methods=['POST'])
def process_return():
    if 'user_id' not in session: 
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    
    data = request.get_json()
    current_user = session['user_id']
    
    # 1. Check Shift
    active_shift = Shift_management.query.filter_by(user_id=current_user, status=True).first()
    if not active_shift: 
        return jsonify({'status': 'error', 'message': 'No active shift found'}), 400

    try:
        # 2. Create Return Record
        new_return = Returns(
            order_id=data['order_id'],
            shift_id=active_shift.shift_id,
            refund_amount=data['refund_amount'],
            return_time=datetime.now()
        )
        db.session.add(new_return)
        db.session.flush() 
        
        # 3. Process Items & Restock
        for item in data.get('items', []):
            qty_to_return = int(item['qty'])
            
            # Record the specific item return
            return_item = Return_items(
                return_item_id=None, # Auto-increment
                return_id=new_return.return_id,
                product_id=item['product_id'],
                quantity=qty_to_return
            )
            db.session.add(return_item)
            
            # Find the original sale line item to get the Batch ID
            original_sale_item = Order_items.query.filter_by(
                order_id=data['order_id'], 
                product_id=item['product_id']
            ).first()
            
            if original_sale_item:
                # Update "Returned So Far" count
                original_sale_item.avail_return_items += qty_to_return
                
                # RESTOCK THE BATCH
                if original_sale_item.batch_id:
                    batch = Batches.query.get(original_sale_item.batch_id)
                    if batch:
                        batch.stocks += qty_to_return

        db.session.commit()
        return jsonify({'status': 'success', 'return_id': new_return.return_id})
        
    except Exception as e:
        db.session.rollback()
        print("Return Error:", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500



@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')





# Admin...

@app.route('/admin/stocks', methods=['GET'])
def admin_stocks():
    if 'user_id' not in session: 
        return redirect('/login')
    if session.get('role') != 'admin': 
        return "Access Denied", 403

    current_user = User.query.get(session['user_id'])
    search_query = request.args.get('q', '').strip()
    
    # 1. Base Query
    query = Products.query
    if search_query:
        query = query.filter(
            (Products.product_name.ilike(f'%{search_query}%')) | 
            (Products.barcode.ilike(f'%{search_query}%'))
        )
    
    products = query.all()
    today = datetime.now().date()

    # 2. Advanced Metrics Calculation
    total_inventory_value_cp = 0.0 # Cost Price Value
    total_inventory_value_mrp = 0.0 # MRP Value
    total_val_sp = 0.0
    
    products_data = []

    for p in products:
        # Get all batches for this product
        batches = Batches.query.filter_by(product_id=p.product_id).all()
        
        # Counters
        stock_expired = 0
        stock_near_exp = 0 # < 90 Days
        stock_fresh = 0
        total_stock = 0
        
        current_mrp = 0.0
        current_cp = 0.0
        
        # Logic: Loop through batches to categorize stock
        for b in batches:
            if b.stocks > 0:
                total_stock += b.stocks
                
                # Pricing (Use the latest batch price as reference)
                current_mrp = b.mrp
                current_cp = b.cost_price
                
                # Valuation
                total_inventory_value_cp += (b.cost_price * b.stocks)
                total_inventory_value_mrp += (b.mrp * b.stocks)
                total_val_sp += (b.selling_price * b.stocks)

                # Expiry Logic
                days_left = (b.expiry_date - today).days
                
                if days_left < 0:
                    stock_expired += b.stocks
                elif days_left < 90: # 3 Months Warning
                    stock_near_exp += b.stocks
                else:
                    stock_fresh += b.stocks

        # Decide Status Badge
        status = "Good"
        if total_stock == 0: status = "Out of Stock"
        elif stock_expired > 0: status = "Has Expired"
        elif total_stock < 10: status = "Low Stock"

        products_data.append({
            'id': p.product_id,
            'name': p.product_name,
            'code': p.barcode,
            'category': p.category,
            'mrp': current_mrp,
            'cost': current_cp,
            'total_stock': total_stock,
            'expired': stock_expired,
            'near_exp': stock_near_exp,
            'fresh': stock_fresh,
            'status': status
        })

    products_data.sort(key=lambda x: (x['expired'] > 0, x['near_exp'] > 0), reverse=True)

    return render_template('admin_stocks.html', 
                           products=products_data, 
                           search_query=search_query,
                           total_val_cp=total_inventory_value_cp,
                           total_val_mrp=total_inventory_value_mrp,
                           total_val_sp=total_val_sp,
                           current_user=current_user,
                           now=datetime.now())


@app.route('/admin/product/new', methods=['GET', 'POST'])
@app.route('/admin/product/edit/<int:product_id>', methods=['GET', 'POST'])
def manage_product(product_id=None):
    if 'user_id' not in session: return redirect('/login')
    if session.get('role') != 'admin': return "Access Denied", 403

    product = None
    batches = []
    error_msg = None  # Initialize error variable

    # If editing, fetch existing data
    if product_id:
        product = Products.query.get(product_id)
        if product:
            batches = Batches.query.filter_by(product_id=product_id).order_by(Batches.expiry_date.asc()).all()

    if request.method == 'POST':
        name = request.form['name']
        code = request.form['code'].strip() # Remove spaces
        category = request.form['category']
        manufacturer = request.form['manufacturer']
        composition = request.form['composition']
        hsn = request.form.get('hsn', '')
        tax_rate = float(request.form['tax_rate'])

        # --- NEW CODE: CHECK FOR DUPLICATES ---
        existing_prod = Products.query.filter_by(barcode=code).first()
        
        # Logic: If a product exists with this barcode...
        # AND it's NOT the product we are currently editing...
        if existing_prod:
            if not product or (product and existing_prod.product_id != product.product_id):
                error_msg = f"Error: Barcode '{code}' is already used by '{existing_prod.product_name}'!"
                # Return the form immediately with the error, don't save.
                return render_template('admin_product_form.html', product=product, batches=batches, now=datetime.now(), error=error_msg)
        # --------------------------------------

        if product:
            # Update Existing
            product.product_name = name
            product.barcode = code
            product.category = category
            product.manufacturer = manufacturer
            product.composition = composition
            product.hsn_code = hsn
            product.tax_rate = tax_rate
        else:
            # Create New
            new_prod = Products(
                product_name=name, 
                barcode=code, 
                category=category,
                manufacturer=manufacturer, 
                composition=composition,
                hsn_code=hsn, 
                tax_rate=tax_rate
            )
            db.session.add(new_prod)
            db.session.commit()
            return redirect(f'/admin/product/edit/{new_prod.product_id}')
        
        db.session.commit()
        return redirect('/admin/stocks')

    return render_template('admin_product_form.html', product=product, batches=batches, now=datetime.now(), error=error_msg)



@app.route('/admin/product/analytics/<int:product_id>')
def product_analytics(product_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect('/login')

    product = Products.query.get_or_404(product_id)

    stats = db.session.query(
        func.sum(Order_items.quantity),
        func.sum(Order_items.total_price)
    ).filter(Order_items.product_id == product_id).first()

    total_sold = stats[0] or 0
    total_revenue = stats[1] or 0.0

    unit_profit = product.selling_price - product.cost_price
    total_profit = unit_profit * total_sold

    if product.cost_price > 0:
        profit_margin_pct = (unit_profit / product.cost_price) * 100
    else:
        profit_margin_pct = 100.0 

    now = datetime.now()
    current_month_start = datetime(now.year, now.month, 1)
    current_year_start = datetime(now.year, 1, 1)

    monthly_sales = db.session.query(func.sum(Order_items.quantity))\
        .join(Orders)\
        .filter(Order_items.product_id == product_id)\
        .filter(Orders.created_at >= current_month_start).scalar() or 0

    yearly_sales = db.session.query(func.sum(Order_items.quantity))\
        .join(Orders)\
        .filter(Order_items.product_id == product_id)\
        .filter(Orders.created_at >= current_year_start).scalar() or 0

    return render_template('admin_product_analytics.html',
                           p=product,
                           total_sold=total_sold,
                           total_revenue=total_revenue,
                           total_profit=total_profit,
                           profit_margin=profit_margin_pct,
                           monthly_sales=monthly_sales,
                           yearly_sales=yearly_sales)



@app.route('/admin/cash_management')
def admin_cash_mgmt():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect('/login')

    date_filter = request.args.get('date')
    view_filter = request.args.get('view', 'all') 

    if date_filter == 'None' or date_filter == '':
        date_filter = None

    # 1. Base Queries with Joins to get Data
    sales_query = db.session.query(Orders, Customers, Payments, User)\
        .join(Customers, Orders.customer_id == Customers.customer_id)\
        .join(Payments, Orders.order_id == Payments.order_id)\
        .join(Shift_management, Orders.shift_id == Shift_management.shift_id)\
        .join(User, Shift_management.user_id == User.user_id)
    
    refunds_query = db.session.query(Returns, User)\
        .join(Shift_management, Returns.shift_id == Shift_management.shift_id)\
        .join(User, Shift_management.user_id == User.user_id)

    # 2. Apply Date Filter
    if date_filter:
        sales_query = sales_query.filter(func.date(Orders.created_at) == date_filter)
        refunds_query = refunds_query.filter(func.date(Returns.return_time) == date_filter)

    sales_data = sales_query.order_by(Orders.created_at.desc()).all()
    refunds_data = refunds_query.order_by(Returns.return_time.desc()).all()

    # 3. Calculate Totals
    gross_sales = sum(s.Orders.final_amount for s in sales_data)
    total_refunds = sum(r.Returns.refund_amount for r in refunds_data)
    
    gross_cash = sum(s.Payments.cash for s in sales_data)
    gross_upi = sum(s.Payments.upi for s in sales_data)
    gross_card = sum(s.Payments.card for s in sales_data)
    
    net_sales = gross_sales - total_refunds
    net_cash = gross_cash - total_refunds 

    # 4. Build Transaction List
    transactions = []

    if view_filter in ['all', 'sales']:
        for s in sales_data:
            methods = []
            if s.Payments.cash > 0: methods.append("Cash")
            if s.Payments.upi > 0: methods.append("UPI")
            if s.Payments.card > 0: methods.append("Card")
            
            transactions.append({
                'type': 'BILL',
                'id': s.Orders.invoice_no,
                'raw_date': s.Orders.created_at,
                'date': s.Orders.created_at.strftime('%d %b, %I:%M %p'),
                'customer': s.Customers.name,
                'cashier': s.User.username,
                'method': " + ".join(methods),
                'amount': s.Orders.final_amount,
                'is_refund': False
            })

    if view_filter in ['all', 'refunds']:
        for r in refunds_data:
            transactions.append({
                'type': 'REFUND',
                'id': f"RET-{r.Returns.return_id}",
                'return_pk': r.Returns.return_id,
                'raw_date': r.Returns.return_time,
                'date': r.Returns.return_time.strftime('%d %b, %I:%M %p'),
                'customer': "Return Customer",
                'cashier': r.User.username,
                'method': "Cash (Refund)",
                'amount': r.Returns.refund_amount,
                'is_refund': True
            })

    transactions.sort(key=lambda x: x['raw_date'], reverse=True)

    return render_template('admin_cash.html', 
                           transactions=transactions,
                           total_sales=net_sales,
                           total_cash=net_cash,
                           total_upi=gross_upi,     
                           total_card=gross_card,   
                           total_refunds=total_refunds,
                           selected_date=date_filter,
                           view_filter=view_filter)

@app.route('/print_refund/<int:return_id>')
def print_refund(return_id):
    if 'user_id' not in session: return redirect('/login')
    
    # 1. Fetch Return + Cashier + Original Order info
    # We join 'Orders' now to get the original invoice number for the receipt header
    result = db.session.query(Returns, User, Orders)\
        .join(Shift_management, Returns.shift_id == Shift_management.shift_id)\
        .join(User, Shift_management.user_id == User.user_id)\
        .join(Orders, Returns.order_id == Orders.order_id)\
        .filter(Returns.return_id == return_id)\
        .first()
        
    if not result:
        return "Refund Record Not Found", 404
        
    ret, cashier, original_order = result
    
    # 2. Fetch the Items being returned
    # We join with Order_items to get the price and name used at the time of sale
    # This works for both Database Products AND Manual Items (id=0)
    return_lines = db.session.query(Return_items, Order_items)\
        .join(Order_items, 
              (Order_items.order_id == ret.order_id) & 
              (Order_items.product_id == Return_items.product_id))\
        .filter(Return_items.return_id == return_id)\
        .all()

    processed_items = []
    for r_item, o_item in return_lines:
        # Determine Name (using the new column logic you added)
        display_name = o_item.item_name
        
        # Fallback for old data or if item_name wasn't saved
        if not display_name:
            if o_item.product_id == 0:
                display_name = "Manual Item"
            else:
                p = Products.query.get(o_item.product_id)
                display_name = p.product_name if p else "Unknown Product"

        processed_items.append({
            'name': display_name,
            'qty': r_item.quantity,
            'rate': o_item.unit_price,
            'total': r_item.quantity * o_item.unit_price
        })
    
    # 3. Render
    return render_template('refund_receipt.html', 
                           r=ret, 
                           cashier=cashier, 
                           items=processed_items, # <--- Passing the items list now!
                           original_invoice=original_order.invoice_no)

# --- REPLACE THE 'download_transaction_report' FUNCTION WITH THIS ---

@app.route('/admin/download_transaction_report')
def download_transaction_report():
    if 'user_id' not in session: return redirect('/login')
    if session.get('role') != 'admin': return "Access Denied", 403 
    
    # 1. Get Filters & CLEAN THEM
    raw_date = request.args.get('date', '').strip()
    
    # SAFETY FIX: Treat "None" string as empty
    date_filter = raw_date if raw_date and raw_date.lower() != 'none' else None
    
    view_filter = request.args.get('view', 'all')
    
    sales_data = []
    
    # 2. FETCH SALES
    if view_filter in ['all', 'sales']:
        sales_query = db.session.query(Orders, Payments, Customers, User)\
            .join(Payments, Orders.order_id == Payments.order_id)\
            .join(Customers, Orders.customer_id == Customers.customer_id)\
            .join(Shift_management, Orders.shift_id == Shift_management.shift_id)\
            .join(User, Shift_management.user_id == User.user_id)
        
        # Only apply filter if we have a REAL date
        if date_filter:
            sales_query = sales_query.filter(func.date(Orders.created_at) == date_filter)
        
        sales_data = sales_query.order_by(Orders.created_at.desc()).all()

    # 3. FETCH REFUNDS
    refunds_data = []
    if view_filter in ['all', 'refunds']:
        refunds_query = db.session.query(Returns, User)\
            .join(Shift_management, Returns.shift_id == Shift_management.shift_id)\
            .join(User, Shift_management.user_id == User.user_id)

        if date_filter:
            refunds_query = refunds_query.filter(func.date(Returns.return_time) == date_filter)
        
        refunds_data = refunds_query.order_by(Returns.return_time.desc()).all()

    # 4. Combine Data
    all_rows = []

    for s in sales_data:
        methods = []
        if s.Payments.cash > 0: methods.append("Cash")
        if s.Payments.upi > 0: methods.append("UPI")
        if s.Payments.card > 0: methods.append("Card")

        all_rows.append({
            'date': s.Orders.created_at.strftime('%Y-%m-%d'),
            'time': s.Orders.created_at.strftime('%H:%M:%S'),
            'id': s.Orders.invoice_no,
            'type': 'BILL',
            'cashier': s.User.username,
            'customer': s.Customers.name,
            'method': " + ".join(methods),
            'amount': s.Orders.final_amount
        })

    for r in refunds_data:
        all_rows.append({
            'date': r.Returns.return_time.strftime('%Y-%m-%d'),
            'time': r.Returns.return_time.strftime('%H:%M:%S'),
            'id': f"RET-{r.Returns.return_id}",
            'type': 'REFUND',
            'cashier': r.User.username,
            'customer': "Return Customer",
            'method': "Cash Refund",
            'amount': -abs(r.Returns.refund_amount)
        })

    # Sort by Time (Newest First)
    all_rows.sort(key=lambda x: (x['date'], x['time']), reverse=True)

    # 5. Generate CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Time', 'Transaction ID', 'Type', 'Cashier', 'Customer', 'Payment Method', 'Amount'])
    
    for row in all_rows:
        writer.writerow([row['date'], row['time'], row['id'], row['type'], row['cashier'], row['customer'], row['method'], row['amount']])
    
    filename_date = date_filter if date_filter else "All_Time"
    filename = f"Transaction_Report_{filename_date}.csv"

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    
    return response


@app.route('/admin/download_gst_report')
def download_gst_report():
    if 'user_id' not in session: return redirect('/login')
    
    # 1. Get Date Filters
    start_str = request.args.get('start')
    end_str = request.args.get('end')

    # 2. Query: Join Orders -> Items -> Products -> Customers
    # We need 'Products' to get the Tax Rate & HSN
    query = db.session.query(Order_items, Orders, Products, Customers)\
        .join(Orders, Order_items.order_id == Orders.order_id)\
        .join(Products, Order_items.product_id == Products.product_id)\
        .join(Customers, Orders.customer_id == Customers.customer_id)

    if start_str and end_str:
        try:
            start_date = datetime.strptime(start_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            query = query.filter(Orders.created_at >= start_date, Orders.created_at <= end_date)
        except ValueError:
            pass 
    
    # Sort by Invoice Date
    records = query.order_by(Orders.created_at.desc()).all()

    def generate():
        data = StringIO()
        w = csv.writer(data)
        
        # --- CA REQUIRED HEADERS ---
        w.writerow((
            'Date', 
            'Invoice No', 
            'Customer Name', 
            'Customer GSTIN',   # Required for B2B
            'Place of Supply',  # Required for GSTR-1
            'HSN Code',         # Critical for Audit
            'Product Name', 
            'Qty', 
            'Total Value (Inc. Tax)', 
            'GST Rate (%)', 
            'Taxable Value',    # Value Before Tax
            'CGST Amount',      # Central Tax
            'SGST Amount',      # State Tax
            'IGST Amount'       # Integrated Tax
        ))
        yield data.getvalue()
        data.seek(0)
        data.truncate(0)

        for item, order, prod, cust in records:
            # --- TAX CALCULATION LOGIC ---
            # Assuming your 'total_price' is inclusive of tax (MRP based selling)
            # Formula: Taxable = Total / (1 + Rate/100)
            
            rate = prod.tax_rate if prod.tax_rate else 0.0
            total_line_val = item.total_price
            
            # Back-calculate Taxable Value
            taxable_val = total_line_val * 100 / (100 + rate) if rate > 0 else total_line_val
            
            gst_amount = total_line_val - taxable_val
            
            # Split Taxes (Assuming Intra-State / Tamil Nadu by default)
            # If you add Logic for Inter-State later, change this.
            cgst = gst_amount / 2
            sgst = gst_amount / 2
            igst = 0.0

            w.writerow((
                order.created_at.strftime('%d-%m-%Y'),
                order.invoice_no,
                cust.name,
                "N/A",              # You can add a GSTIN column to Customer table later
                "Tamil Nadu",       # Default Place of Supply
                prod.hsn_code if prod.hsn_code else "3004", # Default HSN
                prod.product_name,
                item.quantity,
                f"{total_line_val:.2f}",
                f"{rate}%",
                f"{taxable_val:.2f}",
                f"{cgst:.2f}",
                f"{sgst:.2f}",
                f"{igst:.2f}"
            ))
            
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

    filename = f"GST_Audit_Detailed_{start_str}_to_{end_str}.csv" if start_str else "GST_Full_Report.csv"
    
    response = Response(generate(), mimetype='text/csv')
    response.headers.set('Content-Disposition', 'attachment', filename=filename)
    return response

    

@app.route('/admin/users')
def admin_users():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect('/login')
        
    users = User.query.all()
    return render_template('admin_users.html', users=users, now=datetime.now())

# --- SHIFT MANAGEMENT ROUTES ---

@app.route('/admin/shifts')
def admin_shifts():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect('/login')

    shifts = Shift_management.query.order_by(Shift_management.start_time.desc()).all()
    
    shift_data = []
    
    for shift in shifts:
        user = User.query.get(shift.user_id)
        
        sales = db.session.query(
            func.sum(Orders.final_amount),
            func.sum(Payments.cash),
            func.sum(Payments.upi),
            func.sum(Payments.card)
        ).join(Payments).filter(Orders.shift_id == shift.shift_id).first()
        
        gross_sales = sales[0] or 0.0
        gross_cash = sales[1] or 0.0
        upi = sales[2] or 0.0
        card = sales[3] or 0.0
        
        refunds = db.session.query(func.sum(Returns.refund_amount))\
            .filter(Returns.shift_id == shift.shift_id).scalar() or 0.0
            
        net_sales = gross_sales - refunds
        net_cash = gross_cash - refunds

        shift_data.append({
            'id': shift.shift_id,
            'cashier': user.username if user else "Unknown",
            'start': shift.start_time.strftime('%d %b, %I:%M %p'),
            'end': shift.end_time.strftime('%d %b, %I:%M %p') if shift.end_time else "Active Now",
            'status': 'Active' if shift.status else 'Closed',
            'net_sales': net_sales,
            'net_cash': net_cash,
            'upi': upi,
            'card': card,
            'refunds': refunds
        })

    return render_template('admin_shifts.html', shifts=shift_data)


@app.route('/admin/shift/<int:shift_id>')
def admin_shift_details(shift_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect('/login')

    shift = Shift_management.query.get_or_404(shift_id)
    cashier = User.query.get(shift.user_id)
    search_query = request.args.get('q', '').strip()

    sales_stats = db.session.query(
        func.sum(Orders.final_amount),
        func.sum(Payments.cash),
        func.sum(Payments.upi),
        func.sum(Payments.card)
    ).join(Payments).filter(Orders.shift_id == shift_id).first()

    gross_sales = sales_stats[0] or 0.0
    gross_cash = sales_stats[1] or 0.0
    gross_upi = sales_stats[2] or 0.0
    gross_card = sales_stats[3] or 0.0

    total_refunds = db.session.query(func.sum(Returns.refund_amount))\
        .filter(Returns.shift_id == shift_id).scalar() or 0.0
    
    net_sales = gross_sales - total_refunds
    net_cash = gross_cash - total_refunds

    sales_query = db.session.query(Orders, Customers, Payments)\
        .join(Customers).join(Payments)\
        .filter(Orders.shift_id == shift_id)

    if search_query:
        sales_query = sales_query.filter(
            (Orders.invoice_no.ilike(f'%{search_query}%')) |
            (Customers.name.ilike(f'%{search_query}%'))
        )
    
    sales_data = sales_query.order_by(Orders.created_at.desc()).all()

    refunds_query = db.session.query(Returns).filter(Returns.shift_id == shift_id)
    refunds_data = refunds_query.order_by(Returns.return_time.desc()).all()

    transactions = []

    for s in sales_data:
        methods = []
        if s.Payments.cash > 0: methods.append("Cash")
        if s.Payments.upi > 0: methods.append("UPI")
        if s.Payments.card > 0: methods.append("Card")
        
        transactions.append({
            'type': 'BILL',
            'id': s.Orders.invoice_no,
            'raw_date': s.Orders.created_at,
            'date': s.Orders.created_at.strftime('%I:%M %p'),
            'customer': s.Customers.name,
            'method': " + ".join(methods),
            'amount': s.Orders.final_amount,
            'is_refund': False
        })

    for r in refunds_data:
        ret_id = f"RET-{r.return_id}"
        if search_query:
            if search_query.lower() not in ret_id.lower() and search_query.lower() not in "return customer":
                continue 
                
        transactions.append({
            'type': 'REFUND',
            'id': ret_id,
            'return_pk': r.return_id,
            'raw_date': r.return_time,
            'date': r.return_time.strftime('%I:%M %p'),
            'customer': "Return Customer",
            'method': "Cash (Refund)",
            'amount': r.refund_amount,
            'is_refund': True
        })

    transactions.sort(key=lambda x: x['raw_date'], reverse=True)

    return render_template('admin_shift_details.html', 
                           shift=shift, 
                           cashier_name=cashier.username,
                           transactions=transactions,
                           search_query=search_query,
                           net_sales=net_sales,
                           net_cash=net_cash,
                           upi=gross_upi,
                           card=gross_card,
                           total_refunds=total_refunds)



# --- MISSING BATCH API ROUTES ---

@app.route('/admin/api/save_batch', methods=['POST'])
def api_save_batch():
    if 'user_id' not in session: return jsonify({'status': 'error'})
    
    data = request.json
    try:
        # Convert date string to python date object
        expiry = datetime.strptime(data['expiry'], '%Y-%m-%d').date()
        
        if data.get('batch_id'):
            # Edit existing batch
            batch = Batches.query.get(data['batch_id'])
            if batch:
                batch.batch_code = data['code']
                batch.expiry_date = expiry
                batch.mrp = float(data['mrp'])
                batch.cost_price = float(data['cost'])
                batch.selling_price = float(data['sp'])
                batch.stocks = int(data['stock'])
        else:
            # Create new batch
            new_batch = Batches(
                product_id=data['product_id'],
                batch_code=data['code'],
                expiry_date=expiry,
                mrp=float(data['mrp']),
                cost_price=float(data['cost']),
                selling_price=float(data['sp']),
                stocks=int(data['stock'])
            )
            db.session.add(new_batch)
            
        db.session.commit()
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print("Batch Save Error:", e)
        return jsonify({'status': 'error', 'message': str(e)})


@app.route('/admin/delete_product/<int:id>', methods=['POST'])
def delete_product(id):
    if 'user_id' not in session: 
        return jsonify({'status': 'error', 'message': 'Login required'}), 401
    
    prod = Products.query.get(id)
    if prod:
        try:
            # 1. Delete associated batches first (Crucial Fix)
            Batches.query.filter_by(product_id=id).delete()
            
            # 2. Delete the Product
            db.session.delete(prod)
            db.session.commit()
            
            # 3. Return JSON so the page reloads automatically
            return jsonify({'status': 'success'})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'status': 'error', 'message': str(e)}), 500
            
    return jsonify({'status': 'error', 'message': 'Product not found'}), 404

@app.route('/admin/delete_batch/<int:batch_id>', methods=['POST'])
def delete_batch(batch_id):
    if 'user_id' not in session: 
        return jsonify({'status': 'error', 'message': 'Login required'}), 401

    batch = Batches.query.get(batch_id)
    if not batch:
        return jsonify({'status': 'error', 'message': 'Batch not found'}), 404

    # 1. SAFETY CHECK: Has this batch ever been sold?
    # If we delete a batch that was sold, the old bills will crash.
    sale_record = Order_items.query.filter_by(batch_id=batch_id).first()
    
    if sale_record:
        return jsonify({
            'status': 'error', 
            'message': 'Cannot delete: Items from this batch have been sold! You cannot delete history.'
        }), 400

    try:
        # 2. If safe, Delete it
        db.session.delete(batch)
        db.session.commit()
        return jsonify({'status': 'success'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


def open_browser():
    try:
        # for Chrome Fullscreen App Mode
        subprocess.Popen(['start', 'chrome', '--app=http://127.0.0.1:5000', '--start-maximized'], shell=True)
    except:
        # if fails, open in default browser
        webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        existing_admin = User.query.filter_by(role='admin').first()
        if not existing_admin:
            hashed_pw = "admin123" 
            admin = User(username='admin', password=hashed_pw, role='admin')
            db.session.add(admin)
            db.session.commit()
            print("Admin created.")

    Timer(1.5, open_browser).start()
    
    app.run(debug=False, port=5000)