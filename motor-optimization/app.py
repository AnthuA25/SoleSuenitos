from fastapi import FastAPI
from routes import analyze_routes, optimize_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Motor de Optimización de Corte Textil")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_routes.router)
app.include_router(optimize_routes.router)

@app.get("/")
def root():
    return {"message": "API del Motor de Optimización de Corte Textil funcionando 🚀"}
