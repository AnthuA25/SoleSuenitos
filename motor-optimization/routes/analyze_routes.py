from fastapi import APIRouter, UploadFile, File
import os
from core.dxf_reader import leer_dxf

router = APIRouter()

@router.post("/")
async def analyze(archivo: UploadFile = File(...)):
    path = f"output/temp/{archivo.filename}"
    os.makedirs("output/temp", exist_ok=True)
    with open(path, "wb") as buffer:
        buffer.write(await archivo.read())
    result = leer_dxf(path)
    return result
