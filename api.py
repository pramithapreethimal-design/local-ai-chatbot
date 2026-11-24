
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI

import config

app = FastAPI(
    title="Local AI Chatbot API",
    description="API powered by a local LLM using LM Studio"
)

client = OpenAI(
    base_url=config.BASE_URL,
    api_key=config.API_KEY,
    timeout=30.0
)


# Request data structure
class ChatRequest(BaseModel):
    message: str


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Local AI Chatbot API is running"
    }


# Health endpoint
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Chat endpoint
@app.post("/chat")
def chat(request: ChatRequest):

    response = client.chat.completions.create(
        model=config.MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a friendly AI programming tutor."
            },
            {
                "role": "user",
                "content": request.message
            }
        ],
        temperature=config.TEMPERATURE,
        max_tokens=config.MAX_TOKENS
    )

    ai_reply = response.choices[0].message.content

    return {
        "user_message": request.message,
        "ai_response": ai_reply
    }
