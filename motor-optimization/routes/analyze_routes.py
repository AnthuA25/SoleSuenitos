from fastapi import APIRouter, UploadFile, File
import os
from core.dxf_reader import leer_dxf

router = APIRouter()

@router.post("/analyze/")
async def analyze(archivo: UploadFile = File(...)):
    path = f"temp/{archivo.filename}"
    os.makedirs("temp", exist_ok=True)
    with open(path, "wb") as f:
        f.write(await archivo.read())

    data = leer_dxf(path)
    return {"resultado": data}
