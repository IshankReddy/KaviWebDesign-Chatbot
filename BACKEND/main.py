import os
import glob
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request modelgit 
class ChatRequest(BaseModel):
    message: str

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found in environment variables")

MODEL = "gpt-4o-mini"  # Never change this model
db_name = "vector_db"

# Initialize conversation chain with error handling
def initialize_chain():
    try:
        folders = glob.glob("../DB/*")
        
        def add_metadata(doc, doc_type):
            doc.metadata["doc_type"] = doc_type
            return doc

        text_loader_kwargs = {'encoding': 'utf-8'}

        documents = []
        for folder in folders:
            doc_type = os.path.basename(folder)
            loader = DirectoryLoader(folder, glob="**/*.md", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs)
            folder_docs = loader.load()
            documents.extend([add_metadata(doc, doc_type) for doc in folder_docs])

        if not documents:
            raise ValueError("No documents found in the DB directory")

        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

        if os.path.exists(db_name):
            Chroma(persist_directory=db_name, embedding_function=embeddings).delete_collection()

        vectorstore = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=db_name)
        
        llm = ChatOpenAI(
            temperature=0.7, 
            model_name=MODEL,
            openai_api_key=OPENAI_API_KEY
        )
        
        memory = ConversationBufferMemory(
            memory_key='chat_history',
            output_key='answer',
            return_messages=True
        )
        
        retriever = vectorstore.as_retriever(
            search_kwargs={"k": 3}
        )
        
        # Create proper prompt template
        system_message = SystemMessagePromptTemplate.from_template("""
        You are a helpful assistant for KaviWebDesigns company. 
        
        For greetings like 'hi', 'hello', 'hey', respond with a friendly welcome message like:
        "Hello! Welcome to KaviWebDesigns. How can I assist you today?"
        
        When users ask about services or pricing, provide relevant information from the knowledge base.
        
        If you don't understand a query, politely ask for clarification instead of showing pricing tables.
        
        Base your responses on the provided context. If no context is relevant, provide a general response about KaviWebDesigns services.
        
        Context: {context}
        """)

        human_message = HumanMessagePromptTemplate.from_template("{question}")
        
        chat_prompt = ChatPromptTemplate.from_messages([
            system_message,
            human_message
        ])

        return ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            verbose=True,
            combine_docs_chain_kwargs={'prompt': chat_prompt}
        )
    except Exception as e:
        print(f"Error initializing chain: {str(e)}")
        raise

# Initialize the conversation chain
try:
    conversation_chain = initialize_chain()
except Exception as e:
    print(f"Failed to initialize conversation chain: {str(e)}")
    conversation_chain = None

@app.post("/chat")
async def chat(request: ChatRequest):
    if not conversation_chain:
        raise HTTPException(status_code=500, detail="Conversation chain not initialized")
    
    try:
        # Check for greetings
        greetings = ['hi', 'hello', 'hey', 'greetings']
        if request.message.lower().strip() in greetings:
            return {
                "response": "Hello! Welcome to KaviWebDesigns. How can I assist you today?",
                "sources": []
            }
            
        result = conversation_chain({
            "question": request.message
        })
        
        # Extract sources if available
        sources = []
        if result.get("source_documents"):
            sources = [doc.metadata.get("source", "") for doc in result["source_documents"]]
        
        return {
            "response": result["answer"],
            "sources": sources
        }
    except Exception as e:
        print(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing your request: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": MODEL}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)