# main.py
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
import os
import numpy as np  
from shapely.geometry import Polygon
from core.dxf_reader import leer_dxf
from core.optimizer import generar_layout
from core.optimizer_v2 import generar_layout_v2
from core.draw_layout import dibujar_marcador

app = FastAPI(title="Marcador Textil")


@app.post("/leer-piezas")
async def leer_piezas(archivo: UploadFile):
    tmp = f"_in_{archivo.filename}"
    with open(tmp, "wb") as f:
        f.write(await archivo.read())

    data = leer_dxf(tmp)
    piezas = []
    for p in data["piezas"]:
        minx, miny, maxx, maxy = p["polygon"].bounds
        piezas.append(
            {
                "nombre": p["nombre"],
                "ancho_mm": round(maxx - minx, 2),
                "alto_mm": round(maxy - miny, 2),
                "area_mm2": round(p["polygon"].area, 2),
                "permite_giro_90": p["permite_giro_90"],
            }
        )

    os.remove(tmp)
    return {"mensaje": "Piezas leídas correctamente", "piezas": piezas}


@app.post("/optimize")
async def optimize(
    archivo: UploadFile,
    producto: str = Form(),
    talla: str = Form(),
    cantidad: int = Form(),
    ancho_rollo_mm: float = Form(),
    largo_rollo_mm: float = Form(),
    permitir_giro_90: bool = Form(),
):
    tmp = f"_in_{archivo.filename}"
    with open(tmp, "wb") as f:
        f.write(await archivo.read())

    data = leer_dxf(tmp)

    # Duplicar piezas por cantidad
    piezas = []
    for _ in range(max(1, cantidad)):
        for p in data["piezas"]:
            piezas.append(
                {
                    "nombre": p["nombre"],
                    "polygon": p["polygon"],  # shapely
                    "permite_giro_90": p["permite_giro_90"],
                }
            )

    colocadas, largo_usado, metricas = generar_layout(
        piezas, ancho_rollo_mm, largo_rollo_mm, permitir_giro_90
    )

    os.makedirs("output", exist_ok=True)
    out_png = f"output/marcador_{producto}_{talla}.png"
    dibujar_marcador(colocadas, ancho_rollo_mm, largo_rollo_mm, out_png, metricas)

    # Para ver “puntos de colocación”, devolvemos bbox y centro de cada pieza
    piezas_info = []
    for p in colocadas:
        minx, miny, maxx, maxy = p["polygon"].bounds
        piezas_info.append(
            {
                "nombre": p["nombre"],
                "orientacion_deg": p["orientacion_deg"],
                "ancho_mm": round(p["ancho_mm"], 2),
                "alto_mm": round(p["alto_mm"], 2),
                "area_mm2": round(p["area_mm2"], 2),
                "bbox": [
                    round(minx, 2),
                    round(miny, 2),
                    round(maxx, 2),
                    round(maxy, 2),
                ],
                "centro": [
                    round(p["polygon"].centroid.x, 2),
                    round(p["polygon"].centroid.y, 2),
                ],
            }
        )

    os.remove(tmp)
    return JSONResponse(
        {
            "mensaje": "Marcador v1 generado",
            "unidades": "mm",
            "png": out_png,
            "metricas": metricas,
            "piezas_colocadas": piezas_info,
        }
    )


@app.post("/optimize-v2")
async def optimize_v2(
    archivo: UploadFile,
    producto: str = Form("Polo"),
    talla: str = Form("M"),
    cantidad: int = Form(1),
    ancho_rollo_mm: float = Form(1500),
    largo_rollo_mm: float = Form(3000)
):
    try:
        # 1️⃣ Guardar el archivo temporalmente
        tmp = f"_in_{archivo.filename}"
        with open(tmp, "wb") as f:
            f.write(await archivo.read())

        # 2️⃣ Leer piezas del DXF
        data = leer_dxf(tmp)

        # 3️⃣ Duplicar piezas según cantidad
        piezas = []
        for _ in range(max(1, cantidad)):
            for p in data["piezas"]:
                piezas.append({
                    "nombre": p["nombre"],
                    "polygon": p["polygon"],
                    "permite_giro_90": p["permite_giro_90"]
                })

        # 4️⃣ Generar layout optimizado (usa NumPy internamente)
        colocadas, largo_usado, metricas = generar_layout_v2(piezas, ancho_rollo_mm, largo_rollo_mm)

        # 5️⃣ Dibujar PNG
        os.makedirs("output", exist_ok=True)
        out_png = f"output/marcador_v2_{producto}_{talla}.png"
        dibujar_marcador(colocadas, ancho_rollo_mm, largo_rollo_mm, out_png, metricas)

        # 6️⃣ Convertir métricas NumPy → tipos nativos Python
        metricas = {
            k: float(v) if isinstance(v, (np.float32, np.float64)) else int(v) if isinstance(v, (np.int32, np.int64)) else v
            for k, v in metricas.items()
        }

        # 7️⃣ Preparar piezas serializables
        piezas_info = []
        for p in colocadas:
            minx, miny, maxx, maxy = p["polygon"].bounds
            piezas_info.append({
                "nombre": p["nombre"],
                "orientacion_deg": float(p["orientacion_deg"]),
                "ancho_mm": round(float(p["ancho_mm"]), 2),
                "alto_mm": round(float(p["alto_mm"]), 2),
                "area_mm2": round(float(p["area_mm2"]), 2),
                "bbox": [round(float(minx),2), round(float(miny),2), round(float(maxx),2), round(float(maxy),2)],
                "centro": [round(float(p["polygon"].centroid.x),2), round(float(p["polygon"].centroid.y),2)]
            })

        # 8️⃣ Eliminar archivo temporal
        os.remove(tmp)

        # 9️⃣ Responder JSON limpio
        return JSONResponse({
            "mensaje": "Marcador V2 generado correctamente",
            "version": "V2",
            "png": out_png,
            "metricas": metricas,
            "piezas_colocadas": piezas_info
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/optimize-comparar")
async def optimize_comparar(
    archivo: UploadFile,
    producto: str = Form("Polo"),
    talla: str = Form("M"),
    cantidad: int = Form(1),
    ancho_rollo_mm: float = Form(1500),
    largo_rollo_mm: float = Form(3000),
    permitir_giro_90: bool = Form(True),
):
    # --- Guardar temporalmente el archivo DXF ---
    tmp = f"_in_{archivo.filename}"
    with open(tmp, "wb") as f:
        f.write(await archivo.read())

    # --- Leer el DXF ---
    data = leer_dxf(tmp)

    # --- Duplicar piezas por cantidad ---
    piezas = []
    for _ in range(max(1, cantidad)):
        for p in data["piezas"]:
            piezas.append(
                {
                    "nombre": p["nombre"],
                    "polygon": p["polygon"],
                    "permite_giro_90": p["permite_giro_90"],
                }
            )

    # --- Generar marcador V1 ---
    colocadas_v1, largo_v1, metricas_v1 = generar_layout(
        piezas, ancho_rollo_mm, largo_rollo_mm, permitir_giro_90
    )

    # --- Generar marcador V2 ---
    colocadas_v2, largo_v2, metricas_v2 = generar_layout_v2(
        piezas, ancho_rollo_mm, largo_rollo_mm
    )

    os.makedirs("output", exist_ok=True)

    out_v1 = f"output/marcador_v1_{producto}_{talla}.png"
    out_v2 = f"output/marcador_v2_{producto}_{talla}.png"

    # --- Dibujar ambos marcadores ---
    dibujar_marcador(colocadas_v1, ancho_rollo_mm, largo_rollo_mm, out_v1, metricas_v1)
    dibujar_marcador(colocadas_v2, ancho_rollo_mm, largo_rollo_mm, out_v2, metricas_v2)

    # --- Comparar aprovechamiento ---
    mejor = (
        "V2 (Nesting geométrico)"
        if metricas_v2["aprovechamiento_porcentaje"]
        > metricas_v1["aprovechamiento_porcentaje"]
        else "V1 (Básico por filas)"
    )

    os.remove(tmp)

    return JSONResponse(
        {
            "mensaje": "Comparación de marcadores generada",
            "mejor_version": mejor,
            "v1_metricas": metricas_v1,
            "v2_metricas": metricas_v2,
            "v1_png": out_v1,
            "v2_png": out_v2,
        }
    )
