import zipfile
import re
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8")

path = Path(
    r"c:\Users\Mark\Documents\xwechat_files\TCC---Mark_54d7\msg\file\2026-10\Global Official Retail Price List (Retail 공유용) 1019.xlsx"
)
with zipfile.ZipFile(path) as zf:
    names = zf.namelist()
    print("entries", len(names))
    for n in sorted(names):
        if any(k in n.lower() for k in ("media", "drawing", "cellimage", "richdata", "metadata", "image")):
            info = zf.getinfo(n)
            print(f"{n}  {info.file_size}")
    # peek cellimages / rich value
    for candidate in [
        "xl/cellimages.xml",
        "xl/richData/rdrichvalue.xml",
        "xl/richData/richValueRel.xml",
        "xl/metadata.xml",
    ]:
        if candidate in names:
            data = zf.read(candidate).decode("utf-8", errors="replace")
            print("\n====", candidate, "len", len(data))
            print(data[:2500])
    # sheet1 for DISPIMG formulas (shared strings / cells)
    sheet = next((n for n in names if n.startswith("xl/worksheets/sheet")), None)
    if sheet:
        data = zf.read(sheet).decode("utf-8", errors="replace")
        imgs = re.findall(r"DISPIMG\([^)]+\)", data)
        print("\nDISPIMG count", len(imgs))
        print("sample", imgs[:10])
        # also look for f formulas containing IMAGE
        formulas = re.findall(r"<f[^>]*>[^<]*(?:DISPIMG|IMAGE)[^<]*</f>", data)
        print("formula count", len(formulas))
        print("sample formulas", formulas[:8])
