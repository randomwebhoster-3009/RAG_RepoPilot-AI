import os
import shutil
from git import Repo
from pinecone import Pinecone, ServerlessSpec
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv


#loading environment variables
load_dotenv()

#CONFIGURATION
INDEX_NAME = "repopilot-fastapi"
REPO_URL = "https://github.com/fastapi/fastapi"
LOCAL_PATH = "./fastapi_repo"

#Extensions to index
ALLOWED_EXTENSIONS = {'.py', '.md', '.yaml', '.toml', '.json'}


#shutil.rmtree(LOCAL_PATH)
#1. Clone the Repository
if os.path.exists(LOCAL_PATH):
    print("Already Exists")
else:  
    print(f"Cloning {REPO_URL}...")
    Repo.clone_from(REPO_URL, LOCAL_PATH)

# 2. Initialize Pinecone and Embedding Model
model = SentenceTransformer('all-MiniLM-L6-v2') # 384 dimensions
pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))
index_name = "fastapi-repo-index"


index = pc.Index(index_name)

# 3.Chunking 
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\nclass ", "\ndef ", "\n\n", "\n", " "]
)
