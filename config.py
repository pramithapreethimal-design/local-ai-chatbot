import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

TEMPERATURE = float(os.getenv("TEMPERATURE", 0.7))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 300))