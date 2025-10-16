# from fastapi import APIRouter, UploadFile, File, Form
# import os
# from core.dxf_reader import leer_dxf
# from core.optimizer import preparar_items, shelf_pack
# from core.layout_draw import draw_marker

# router = APIRouter()
# UPLOAD_DIR = "uploads"
# OUTPUT_DIR = "output"

# @router.post("/")
# async def compare(
#     archivo: UploadFile = File(...),
#     producto: str = Form(...),
#     talla: str = Form(...),
#     cantidad: int = Form(...),
#     ancho_rollo_mm: float = Form(...),
#     largo_rollo_mm: float = Form(...),
#     giro_v1: str = Form("0"),       orient_v1: str = Form("restringida"),
#     giro_v2: str = Form("0_90"),    orient_v2: str = Form("libre")
# ):
#     p = os.path.join(UPLOAD_DIR, archivo.filename)
#     with open(p, "wb") as f:
#         f.write(await archivo.read())
#     data = leer_dxf(p)

#     # v1
#     items1 = preparar_items(data["piezas"], cantidad, giro_v1, orient_v1)
#     placed1, k1 = shelf_pack(items1, ancho_rollo_mm, largo_rollo_mm)
#     geoms1 = [{"poly":g["poly"],"nombre":g["nombre"],"color":"#10b981"} for g in placed1]
#     out1 = os.path.join(OUTPUT_DIR, f"marcador_{producto}_{talla}_v1.png")
#     draw_marker(geoms1, ancho_rollo_mm, largo_rollo_mm, out1, title=f"{producto} {talla} v1 ({giro_v1}/{orient_v1})")

#     # v2
#     items2 = preparar_items(data["piezas"], cantidad, giro_v2, orient_v2)
#     placed2, k2 = shelf_pack(items2, ancho_rollo_mm, largo_rollo_mm)
#     geoms2 = [{"poly":g["poly"],"nombre":g["nombre"],"color":"#3b82f6"} for g in placed2]
#     out2 = os.path.join(OUTPUT_DIR, f"marcador_{producto}_{talla}_v2.png")
#     draw_marker(geoms2, ancho_rollo_mm, largo_rollo_mm, out2, title=f"{producto} {talla} v2 ({giro_v2}/{orient_v2})")

#     mejor = "v1"
#     if k2["aprovechamiento_porcent"] > k1["aprovechamiento_porcent"]:
#         mejor = "v2"

#     return {"criterio":"aprovechamiento_porcent","mejor":mejor,
#             "v1":{"kpis":k1,"png":out1,"giro":giro_v1,"orient":orient_v1},
#             "v2":{"kpis":k2,"png":out2,"giro":giro_v2,"orient":orient_v2}}
