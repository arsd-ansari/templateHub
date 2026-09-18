"""Square TemplateHub logo for AdSense Privacy & messaging upload."""

from pathlib import Path
from PIL import Image, ImageDraw

SIZE = 512
TEAL = (15, 118, 110, 255)  # #0F766E
WHITE = (255, 255, 255, 255)
OUT = Path("public/logo.png")


def rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def main():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    rounded_rect(draw, (0, 0, SIZE - 1, SIZE - 1), 96, TEAL)

    # Spreadsheet: white sheet with grid lines
    sheet = (96, 88, 416, 424)
    rounded_rect(draw, sheet, 28, WHITE)

    header = (96, 88, 416, 160)
    draw.rounded_rectangle(header, radius=28, fill=(13, 148, 136, 255))
    draw.rectangle((96, 132, 416, 160), fill=(13, 148, 136, 255))

    line_color = (15, 118, 110, 90)
    for x in (200, 312):
        draw.line([(x, 160), (x, 424)], fill=line_color, width=8)
    for y in (248, 336):
        draw.line([(96, y), (416, y)], fill=line_color, width=8)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG")
    print(f"Wrote {OUT.resolve()} ({SIZE}x{SIZE})")


if __name__ == "__main__":
    main()
