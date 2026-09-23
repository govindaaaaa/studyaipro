import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from config import settings
from routers.auth import get_current_user

router = APIRouter(prefix="/output", tags=["output"])


class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str = "Your StudyAI Pro Notes"
    body: str


class WhatsAppRequest(BaseModel):
    to_number: str  # e.g. +919876543210
    message: str


@router.post("/email")
async def send_email(body: EmailRequest, current_user: dict = Depends(get_current_user)):
    if not settings.smtp_user or not settings.smtp_pass:
        raise HTTPException(status_code=503, detail="Email not configured on server")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = body.subject
    msg["From"] = settings.smtp_user
    msg["To"] = body.to_email
    msg.attach(MIMEText(body.body, "plain"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(settings.smtp_user, body.to_email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"status": "sent", "to": body.to_email}


@router.post("/whatsapp")
async def send_whatsapp(body: WhatsAppRequest, current_user: dict = Depends(get_current_user)):
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        raise HTTPException(status_code=503, detail="WhatsApp/Twilio not configured on server")

    try:
        from twilio.rest import Client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        message = client.messages.create(
            from_=settings.twilio_whatsapp_from,
            to=f"whatsapp:{body.to_number}",
            body=body.message[:1500],
        )
        return {"status": "sent", "sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send WhatsApp: {str(e)}")
