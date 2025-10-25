# main.py
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
import os
from shapely.geometry import Polygon
from core.dxf_reader import leer_dxf
from core.optimizer import generar_layout
from core.draw_layout import dibujar_marcador

app = FastAPI(title="Marcador Textil")

@app.post("/optimize")
async def optimize(
    archivo: UploadFile,
    producto: str = Form("Polo"),
    talla: str = Form("M"),
    cantidad: int = Form(1),
    ancho_rollo_mm: float = Form(1500),
    largo_rollo_mm: float = Form(3000),
    permitir_giro_90: bool = Form(True),
):
    tmp = f"_in_{archivo.filename}"
    with open(tmp, "wb") as f:
        f.write(await archivo.read())

    data = leer_dxf(tmp)

    # Duplicar piezas por cantidad
    piezas = []
    for _ in range(max(1, cantidad)):
        for p in data["piezas"]:
            piezas.append({
                "nombre": p["nombre"],
                "polygon": p["polygon"],      # shapely
                "permite_giro_90": p["permite_giro_90"],
            })

    colocadas, largo_usado, metricas = generar_layout(
        piezas, ancho_rollo_mm, largo_rollo_mm, permitir_giro_90
    )

    os.makedirs("output", exist_ok=True)
    out_png = f"output/marcador_{producto}_{talla}.png"
    dibujar_marcador(colocadas, ancho_rollo_mm, largo_rollo_mm, out_png)

    # Para ver “puntos de colocación”, devolvemos bbox y centro de cada pieza
    piezas_info = []
    for p in colocadas:
        minx, miny, maxx, maxy = p["polygon"].bounds
        piezas_info.append({
            "nombre": p["nombre"],
            "orientacion_deg": p["orientacion_deg"],
            "ancho_mm": round(p["ancho_mm"], 2),
            "alto_mm": round(p["alto_mm"], 2),
            "area_mm2": round(p["area_mm2"], 2),
            "bbox": [round(minx,2), round(miny,2), round(maxx,2), round(maxy,2)],
            "centro": [round(p["polygon"].centroid.x,2), round(p["polygon"].centroid.y,2)]
        })

    os.remove(tmp)
    return JSONResponse({
        "mensaje": "Marcador generado",
        "unidades": "mm",
        "png": out_png,
        "metricas": metricas,
        "piezas_colocadas": piezas_info
    })
