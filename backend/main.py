from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
from dotenv import load_dotenv
from groq import Groq

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoRequest(BaseModel):
    repo_url: str


class ChatRequest(BaseModel):
    message: str


# Build full repo tree (names only)
def build_tree(path):
    tree = {}

    try:
        for item in sorted(os.listdir(path)):
            # Skip unnecessary internals
            if item in [".git", "__pycache__", "node_modules"]:
                continue

            item_path = os.path.join(path, item)

            if os.path.isdir(item_path):
                tree[item] = build_tree(item_path)
            else:
                tree[item] = None
    except Exception:
        pass

    return tree


@app.post("/load-repo")
def load_repo(data: RepoRequest):
    repo_url = data.repo_url
    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    repo_path = f"cloned_{repo_name}"

    # Clone repo only once
    if not os.path.exists(repo_path):
        subprocess.run(["git", "clone", repo_url, repo_path], check=True)

    structure = build_tree(repo_path)
    return {"structure": structure}


@app.get("/")
def home():
    return {"message": "Backend is running"}


# Load Groq API key from .env at startup
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)


@app.post("/chat")
def chat_endpoint(data: ChatRequest):
    user_message = data.message

    if not client:
        return {"reply": "Groq API key not configured on server."}

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_message},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error contacting AI service: {str(e)}"}
