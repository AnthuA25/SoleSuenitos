import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle
import random

def dibujar_marcador(piezas, ancho_rollo, largo_rollo, output_path):
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.set_xlim(0, ancho_rollo)
    ax.set_ylim(0, largo_rollo)
    ax.set_aspect("equal")

    # Fondo del rollo (color azul claro)
    rollo = Rectangle((0, 0), ancho_rollo, largo_rollo, 
                      linewidth=2, edgecolor="#2b5fab", facecolor="#d4e2f7")
    ax.add_patch(rollo)

    # Dibujar piezas cerradas
    for pieza in piezas:
        coords = [(x + pieza["pos_x"], y + pieza["pos_y"]) for (x, y) in pieza["coordenadas"]]
        color = random.choice([
            "#ffa07a", "#98fb98", "#87cefa", "#dda0dd",
            "#f0e68c", "#afeeee", "#ffb6c1", "#d8bfd8"
        ])
        poly = Polygon(coords, closed=True, facecolor=color, alpha=0.85, edgecolor="#444", linewidth=1.3)
        ax.add_patch(poly)

        xs, ys = zip(*coords)
        ax.text(sum(xs)/len(xs), sum(ys)/len(ys), pieza["nombre"].upper(),
                ha="center", va="center", fontsize=9, weight="bold", color="#222")

    plt.gca().invert_yaxis()
    ax.axis("off")
    ax.set_title("Marcador Digital Textil - Corte Pijama M", fontsize=12, color="#1d3f7a", pad=20)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    plt.close(fig)
    return output_path
