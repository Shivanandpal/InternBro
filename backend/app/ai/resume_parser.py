import pdfplumber
from docx import Document


class ResumeParser:

    @staticmethod
    def extract_text(file_path):

        if file_path.endswith(".pdf"):

            return ResumeParser.extract_pdf(file_path)

        elif file_path.endswith(".docx"):

            return ResumeParser.extract_docx(file_path)

        raise ValueError("Unsupported file")


    @staticmethod
    def extract_pdf(path):

        text = ""

        with pdfplumber.open(path) as pdf:

            for page in pdf.pages:

                extracted = page.extract_text()

                if extracted:
                    text += extracted + "\n"

        return text


    @staticmethod
    def extract_docx(path):

        document = Document(path)

        text = ""

        for para in document.paragraphs:

            text += para.text + "\n"

        return text