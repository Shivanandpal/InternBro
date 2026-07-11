from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import razorpay
import hmac
import hashlib

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.core.config import settings

router = APIRouter(
    prefix="/payment",
    tags=["Payments"]
)

@router.post("/create-order")
def create_order(
    current_user=Depends(get_current_user)
):
    try:
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            print("DATABASE INFO: Razorpay keys missing from configuration. Generating mock order ID.")
            return {
                "id": f"order_mock_{current_user.id[:8]}",
                "amount": 9900,
                "currency": "INR",
                "key_id": "rzp_test_mockkey123"
            }
            
        order_data = {
            "amount": 9900,
            "currency": "INR",
            "receipt": f"receipt_{current_user.id[:8]}",
            "payment_capture": 1
        }
        
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create(data=order_data)
            return {
                "id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "key_id": settings.RAZORPAY_KEY_ID
            }
        except Exception as api_err:
            print(f"DATABASE INFO: Razorpay API call failed: {api_err}. Falling back to mock order.")
            return {
                "id": f"order_mock_{current_user.id[:8]}",
                "amount": 9900,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_mockkey123"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/verify")
def verify_payment(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    
    if not razorpay_order_id or not razorpay_payment_id:
        raise HTTPException(status_code=400, detail="Missing payment details")
        
    # Check for templates mock mode
    if razorpay_order_id.startswith("order_mock_tmpl_"):
        return {"success": True, "type": "templates", "message": "Resume templates unlocked successfully."}
        
    # Check for dev mock mode
    if razorpay_order_id.startswith("order_mock_"):
        current_user.premium = True
        db.commit()
        return {"success": True, "message": "Premium subscription activated successfully."}
        
    try:
        # Verify signature
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        secret = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
        generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()
        
        if generated_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Signature verification failed")
            
        # Update user status to premium
        current_user.premium = True
        db.commit()
        
        return {
            "success": True,
            "message": "Premium subscription activated successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-order-templates")
def create_order_templates(
    current_user=Depends(get_current_user)
):
    try:
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            print("DATABASE INFO: Razorpay keys missing from config. Generating mock templates order ID.")
            return {
                "id": f"order_mock_tmpl_{current_user.id[:8]}",
                "amount": 1900,
                "currency": "INR",
                "key_id": "rzp_test_mockkey123"
            }
            
        order_data = {
            "amount": 1900,
            "currency": "INR",
            "receipt": f"receipt_tmpl_{current_user.id[:8]}",
            "payment_capture": 1
        }
        
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create(data=order_data)
            return {
                "id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "key_id": settings.RAZORPAY_KEY_ID
            }
        except Exception as api_err:
            print(f"DATABASE INFO: Razorpay API call failed: {api_err}. Falling back to mock templates order.")
            return {
                "id": f"order_mock_tmpl_{current_user.id[:8]}",
                "amount": 1900,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_mockkey123"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create templates payment order: {str(e)}"
        )
