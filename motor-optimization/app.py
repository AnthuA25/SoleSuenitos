from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze_routes import router as analyze_router
from routes.optimize_routes import router as optimize_router

app = FastAPI(title="Motor de Optimización Textil", version="1.0")

# CORS para conectar con tu React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pon tu dominio de frontend si lo necesitas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(analyze_router, prefix="/analyze", tags=["Analyze"])
app.include_router(optimize_router, prefix="/optimize", tags=["Optimize"])

@app.get("/")
def root():
    return {"message": "API del Motor de Optimización Textil lista 🚀"}
