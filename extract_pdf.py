import PyPDF2
import sys

pdf_path = r"c:\Users\chhim\OneDrive\Desktop\hotel booking system\Continentals_Tech_Stack_Requirements.pdf"

with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n\n"

output_path = r"c:\Users\chhim\OneDrive\Desktop\hotel booking system\TechStack.txt"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(text)
