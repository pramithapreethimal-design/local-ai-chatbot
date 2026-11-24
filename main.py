
from openai import OpenAI
from openai import APIConnectionError, APITimeoutError, APIStatusError

from jsonschema import validate, ValidationError

import config
import json


# Connect to LM Studio
client = OpenAI(
    base_url=config.BASE_URL,
    api_key=config.API_KEY,
    timeout=30.0
)


# System prompt
SYSTEM_PROMPT = """
You are a friendly AI programming tutor.
Explain concepts in simple English.
Always provide practical examples.
Keep answers beginner-friendly.
"""


# JSON Schema
JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "topic": {"type": "string"},
        "category": {"type": "string"},
        "difficulty": {"type": "string"},
        "explanation": {"type": "string"}
    },
    "required": [
        "topic",
        "category",
        "difficulty",
        "explanation"
    ],
    "additionalProperties": False
}


# Conversation history
messages = [
    {
        "role": "system",
        "content": SYSTEM_PROMPT
    }
]


# Clear conversation history
def clear_chat_history():
    global messages

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    print("Chat history cleared!")


# Start chatbot
print("================================")
print("       LOCAL AI CHATBOT")
print("================================")
print("Commands:")
print("  exit  - Quit chatbot")
print("  clear - Clear conversation")
print("  /json - Get JSON response")
print("================================\n")


while True:

    user_input = input("You: ").strip()

    # Exit chatbot
    if user_input.lower() == "exit":
        print("Chat ended. Goodbye!")
        break

    # Clear conversation
    if user_input.lower() == "clear":
        clear_chat_history()
        continue

    # Ignore empty input
    if not user_input:
        continue

    # Check JSON mode
    json_mode = user_input.lower().startswith("/json ")

    if json_mode:

        user_question = user_input[6:].strip()

        if not user_question:
            print("Please enter a question after /json.\n")
            continue

        user_message = f"""
        Answer the following question using valid JSON only.

        Do not use Markdown code blocks.
        Do not include explanations outside the JSON.

        Use these fields:
        topic, category, difficulty, explanation.

        Question: {user_question}
        """

    else:
        user_message = user_input

    # Add user message to history
    messages.append({
        "role": "user",
        "content": user_message
    })

    try:

        # Send request to LM Studio
        stream = client.chat.completions.create(
            model=config.MODEL_NAME,
            messages=messages,
            temperature=config.TEMPERATURE,
            max_tokens=config.MAX_TOKENS,
            stream=True
        )

        print("AI: ", end="", flush=True)

        ai_reply = ""

        # Receive streaming response
        for chunk in stream:

            content = chunk.choices[0].delta.content

            if content:
                print(content, end="", flush=True)
                ai_reply += content

        print()

        # Validate JSON response
        if json_mode:

            try:
                json_data = json.loads(ai_reply)

                validate(
                    instance=json_data,
                    schema=JSON_SCHEMA
                )

                print("\nJSON validation successful!")

                print("Topic:", json_data["topic"])
                print("Category:", json_data["category"])
                print("Difficulty:", json_data["difficulty"])
                print("Explanation:", json_data["explanation"])

            except json.JSONDecodeError:
                print("\nInvalid JSON format.")

            except ValidationError as e:
                print("\nJSON structure is incorrect.")
                print("Reason:", e.message)

        # Save assistant response
        messages.append({
            "role": "assistant",
            "content": ai_reply
        })

    except APIConnectionError:
        print("\nCannot connect to LM Studio.")
        messages.pop()

    except APITimeoutError:
        print("\nRequest timed out.")
        messages.pop()

    except APIStatusError as e:
        print(f"\nAPI Error: {e.status_code}")
        messages.pop()

    except Exception as e:
        print(f"\nUnexpected error: {e}")
        messages.pop()

    finally:
        print()
