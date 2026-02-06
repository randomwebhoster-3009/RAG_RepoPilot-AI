from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
from dotenv import load_dotenv
from groq import Groq
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from langchain_huggingface import HuggingFaceEndpoint,ChatHuggingFace

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
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

# Initialize Pinecone and Model
pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))
index = pc.Index("fastapi-repo-index")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2') #matches the one used for upload

#store chat history
fast_api_structure='''
    ( fastapi/fastapi [root] ( fastapi/ [Core Framework Logic] ( dependencies/ ( models.py, utils.py ) ) ( openapi/ ( models.py, utils.py ) ) ( routers/ ( common.py ) ) ( applications.py, routing.py, params.py, datastructures.py, exceptions.py, responses.py, security/ ) ) ( docs/ [Documentation Source] ( en/ ( docs/ ( index.md, tutorial/, advanced/, features/ ) ) ( [other_langs]/ [Translations] ) ) ( docs_src/ [Runnable Tutorial Code - Primary for RAG] ( dependencies/ ( tutorial001.py, tutorial002.py ) ) ( sql_databases/ ( tutorial001.py, main.py, sql_app/ ) ) ( background_tasks/ ( tutorial001.py ) ) ( ... [One folder per documentation chapter] ) ) ( tests/ [Full Test Suite] ( test_main.py, test_routing.py, test_dependencies.py ) ) ( pyproject.toml, requirements.txt, scripts/, build/ ) )
    '''
history=[
                {"role": "system", "content": f"You are acting as a repopilot AI helping the following repository{fast_api_structure} "}
  
            ]

from groq import AsyncGroq # Ensure you use the Async version

# Initialize this outside or in lifespan
# client = AsyncGroq(api_key="...") 
@app.post("/chat")

async def chat_endpoint(data: ChatRequest):
    user_message = data.message
    
    # 1. Vector Retrieval
    query_vector = embedding_model.encode(user_message).tolist()
    results = index.query(
        vector=query_vector,
        top_k=5,
        include_metadata=True
    )
    results_matches = results['matches']

    # 2. Building the relevant text (Fixed the .append error)
    rel_chunks = []
    for i, match in enumerate(results_matches):
        content = match.metadata.get('page_content', '')
        rel_chunks.append(f"\n{i+1}. {content}\n")
    
    rel_text = "".join(rel_chunks)

    # 3. Update History (Ensure history is a list you can append to)
    formatted_prompt = f"\n User: {user_message} \n relevant chunk {rel_text}"
    history.append({"role": "user", "content": formatted_prompt})

    if not client:
        return {"reply": "Groq API key not configured."}

    try:
        # 4. Async AI Call (Prevents blocking and weird cancellation errors)
        response =client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=history,
            max_tokens=500,
            temperature=0.7,
        )

        reply = response.choices[0].message.content.strip()
        history.append({"role": "assistant", "content": reply})
        return {"reply": reply}
        
    except Exception as e:
        return {"reply": f"Error contacting AI service: {str(e)}"}
def multi_query(query):
    print("hi")
