# core/draw_layout.py
import matplotlib.pyplot as plt
from shapely.geometry import Polygon
from matplotlib.patches import Polygon as MplPolygon
from matplotlib.collections import PatchCollection
import random

PALETTE = ["#6CC7BE", "#F7B7C7", "#BEE3A2", "#9CC9FF", "#FFD89E"]

def _poly_to_patch(poly: Polygon) -> MplPolygon:
    x, y = poly.exterior.xy
    return MplPolygon(list(zip(x, y)), closed=True)



def dibujar_marcador(piezas_colocadas, ancho_rollo, largo_rollo, output_png: str):
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, ancho_rollo)
    ax.set_ylim(0, largo_rollo)
    ax.set_facecolor("#E6E6E6")
    ax.invert_yaxis()  # Para visualizar como plano de corte

    patches = []
    colors = []
    for i, p in enumerate(piezas_colocadas):
        patch = _poly_to_patch(p["polygon"])
        patches.append(patch)
        colors.append(PALETTE[i % len(PALETTE)])

        cx, cy = p["polygon"].centroid.x, p["polygon"].centroid.y
        ax.text(cx, cy, p["nombre"].capitalize(), ha="center", va="center",
                fontsize=12, color="black")

    pc = PatchCollection(patches, facecolor=colors, edgecolor="black", linewidth=1.2, alpha=0.95)
    ax.add_collection(pc)

    # Borde del rollo
    ax.add_patch(MplPolygon([(0,0),(ancho_rollo,0),(ancho_rollo,largo_rollo),(0,largo_rollo)],
                            closed=True, fill=False, edgecolor="black", linewidth=1.5))

    ax.set_aspect('equal', adjustable='box')
    plt.tight_layout()
    plt.savefig(output_png, dpi=150)
    plt.close(fig)
