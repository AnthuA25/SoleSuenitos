from fastapi import APIRouter, UploadFile, File, Form
import os
from core.dxf_reader import leer_dxf
from core.optimizer import shelf_pack
from core.layout_draw import dibujar_marcador

router = APIRouter()

@router.post("/")
async def optimize(
    archivo: UploadFile = File(...),
    producto: str = Form(...),
    talla: str = Form(...),
    cantidad: int = Form(...),
    ancho_rollo_mm: float = Form(...),
    largo_rollo_mm: float = Form(...),
    giro_permitido: str = Form("0"),
    orientacion_pieza: str = Form("libre"),
):
    os.makedirs("output/temp", exist_ok=True)
    os.makedirs("output/markers", exist_ok=True)
    path = f"output/temp/{archivo.filename}"
    with open(path, "wb") as buffer:
        buffer.write(await archivo.read())

    piezas = leer_dxf(path)["piezas"]
    colocadas, kpis = shelf_pack(piezas, ancho_rollo_mm, largo_rollo_mm)

    output_path = f"output/markers/{producto}_{talla}_marcador.png"
    dibujar_marcador(colocadas, ancho_rollo_mm, largo_rollo_mm, output_path)

    return {
        "mensaje": "Marcador generado con éxito ✅",
        "marcador_path": output_path,
        "metricas": kpis,
    }
