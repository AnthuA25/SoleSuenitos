from fastapi import APIRouter, UploadFile, File, Form
import os
from core.dxf_reader import leer_dxf
from core.optimizer import shelf_pack
from core.layout_draw import draw_marker_from_dxf as draw_marker

router = APIRouter()

@router.post("/optimize/")
async def optimize(
    archivo: UploadFile = File(...),
    producto: str = Form(...),
    talla: str = Form(...),
    cantidad: int = Form(...),
    ancho_rollo_mm: float = Form(...),
    largo_rollo_mm: float = Form(...)
):
    os.makedirs("output", exist_ok=True)
    path = f"temp/{archivo.filename}"
    with open(path, "wb") as f:
        f.write(await archivo.read())

    data = leer_dxf(path)
    piezas = data["piezas"]

    colocadas, kpis = shelf_pack(piezas, ancho_rollo_mm, largo_rollo_mm)

    out_png = f"output/{producto}_{talla}_marcador.png"
    draw_marker(colocadas, ancho_rollo_mm, largo_rollo_mm, out_png)

    return {
        "mensaje": "Marcador generado correctamente.",
        "kpis": kpis,
        "imagen": out_png
    }
