
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from fastapi.responses import StreamingResponse

import config

app = FastAPI(
    title="Local AI Chatbot API",
    description="API powered by a local LLM using LM Studio"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url=config.BASE_URL,
    api_key=config.API_KEY,
    timeout=30.0
)


# Request data structure

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]


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

def generate_response(conversation):

    response = client.chat.completions.create(
        model=config.MODEL_NAME,
        messages=conversation,
        temperature=config.TEMPERATURE,
        max_tokens=config.MAX_TOKENS,
        stream=True
    )

    for chunk in response:
        content = chunk.choices[0].delta.content

        if content:
            yield content

# Chat endpoint
@app.post("/chat")
def chat(request: ChatRequest):

    conversation = [
        {
            "role": "system",
            "content": "You are a friendly AI programming tutor."
        }
    ]

    conversation.extend(
        message.model_dump()
        for message in request.messages
    )

    response = client.chat.completions.create(
        model=config.MODEL_NAME,
        messages=conversation,
        temperature=config.TEMPERATURE,
        max_tokens=config.MAX_TOKENS,
        stream=True
    )

    ai_reply = ""

    for chunk in response:
        content = chunk.choices[0].delta.content

        if content:
            print(content, end="", flush=True)
            ai_reply += content

    return {
        "ai_response": ai_reply
    }
