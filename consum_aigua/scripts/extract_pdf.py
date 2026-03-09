import sys
from pathlib import Path

def main():
    try:
        from pypdf import PdfReader
    except Exception as e:
        print(f"ERROR: No s'ha pogut importar pypdf: {e}")
        sys.exit(1)

    if len(sys.argv) < 2:
        print("Ús: python scripts/extract_pdf.py <fitxer.pdf>")
        sys.exit(2)

    # Accepta rutes amb espais encara que vinguin trencades per la shell
    pdf_arg = " ".join(sys.argv[1:])
    # Neteja cometes sobrants
    pdf_arg = pdf_arg.strip().strip('"').strip("'")
    pdf_path = Path(pdf_arg)
    if not pdf_path.exists():
        # Escriu diagnòstic a un fitxer per si stdout falla
        try:
            Path("scripts").mkdir(exist_ok=True)
            with open("scripts/debug_extract_pdf.log", "w", encoding="utf-8") as fd:
                fd.write(f"CWD: {Path.cwd()}\n")
                fd.write("LLISTAT:\n")
                for p in Path.cwd().iterdir():
                    fd.write(f" - {p}\n")
                fd.write(f"ARG: {pdf_path}\n")
        except Exception:
            pass
        print(f"ERROR: No s'ha trobat el fitxer: {pdf_path}")
        sys.exit(3)

    try:
        reader = PdfReader(str(pdf_path))
        all_text = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""
            all_text.append(f"\n\n--- Pàgina {i+1} ---\n{text}")
        print("".join(all_text))
    except Exception as e:
        print(f"ERROR: No s'ha pogut llegir el PDF: {e}")
        sys.exit(4)

if __name__ == "__main__":
    main()
