import zipfile
import re
import xml.etree.ElementTree as ET
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8")

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "xlrd": "http://schemas.microsoft.com/office/spreadsheetml/2017/richdata",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}

path = Path(
    r"c:\Users\Mark\Documents\xwechat_files\TCC---Mark_54d7\msg\file\2026-10\Global Official Retail Price List (Retail 공유용) 1019.xlsx"
)

with zipfile.ZipFile(path) as zf:
    # richValueRel relationships -> media targets
    rels_xml = zf.read("xl/richData/_rels/richValueRel.xml.rels")
    rels_root = ET.fromstring(rels_xml)
    rid_to_target = {}
    for rel in rels_root:
        rid = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        rid_to_target[rid] = target
    print("rels", len(rid_to_target))
    for i in range(1, 6):
        print(f"rId{i}", rid_to_target.get(f"rId{i}"))

    # richValueRel order
    rv_rel = ET.fromstring(zf.read("xl/richData/richValueRel.xml"))
    rel_ids = [el.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id") for el in rv_rel]
    print("richValueRel count", len(rel_ids), "first", rel_ids[:3], "last", rel_ids[-3:])

    # rdrichvalue: first v is image index into richValueRel?
    rv = ET.fromstring(zf.read("xl/richData/rdrichvalue.xml"))
    rv_entries = []
    for node in rv:
        vals = [v.text for v in node]
        rv_entries.append(vals)
    print("rv entries", len(rv_entries), "sample", rv_entries[:5])

    # metadata futureMetadata bk -> rvb i
    meta = ET.fromstring(zf.read("xl/metadata.xml"))
    rvb_indices = re.findall(r'rvb i="(\d+)"', zf.read("xl/metadata.xml").decode("utf-8"))
    print("rvb count", len(rvb_indices), "first", rvb_indices[:5])

    # sheet cells with vm= (value metadata)
    sheet = zf.read("xl/worksheets/sheet1.xml").decode("utf-8")
    # find C column cells with vm
    cells = re.findall(r'<c r="(C\d+)"[^>]*vm="(\d+)"[^>]*/?>', sheet)
    print("C cells with vm", len(cells))
    print("sample", cells[:10])
    print("all", cells)

    # also any cell with vm
    all_vm = re.findall(r'<c r="([A-Z]+\d+)"[^>]*vm="(\d+)"', sheet)
    print("all vm cells", len(all_vm))
    print(all_vm[:20])
