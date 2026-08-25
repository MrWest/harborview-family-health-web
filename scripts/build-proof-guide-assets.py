from pathlib import Path

from fpdf import FPDF
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "download" / "harborview-proof"


class HarborviewPdf(FPDF):
    def header(self):
        self.set_fill_color(16, 43, 61)
        self.rect(0, 0, 210, 24, "F")
        self.set_xy(15, 8)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(255, 255, 255)
        self.cell(0, 7, "HARBORVIEW FAMILY HEALTH CENTRE", ln=1)
        self.set_x(15)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(210, 238, 231)
        self.cell(0, 4, "FICTIONAL TRAINING DOCUMENT - NOT A REAL MEDICAL RECORD")
        self.ln(9)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(87, 111, 124)
        self.cell(
            0,
            5,
            "Harborview proof asset | Fictional data only | Upload through the registration form, not chat",
            align="C",
        )

    def heading(self, text):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(16, 43, 61)
        self.multi_cell(0, 8, text)
        self.ln(2)

    def section(self, text):
        self.set_fill_color(220, 236, 231)
        self.set_text_color(39, 117, 121)
        self.set_font("Helvetica", "B", 9)
        self.cell(0, 7, text.upper(), fill=True, ln=1)
        self.ln(2)

    def field(self, label, value):
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(16, 43, 61)
        self.write(5, f"{label}: ")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(45, 61, 72)
        self.multi_cell(0, 5, value)

    def note(self, text):
        self.set_fill_color(247, 247, 242)
        self.set_text_color(58, 74, 83)
        self.set_font("Helvetica", "", 8)
        self.multi_cell(0, 4.5, text, fill=True)
        self.ln(2)


def new_pdf():
    pdf = HarborviewPdf(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_margins(15, 30, 15)
    return pdf


def create_avery():
    pdf = new_pdf()
    pdf.add_page()
    pdf.heading("Referral and Registration Summary")
    pdf.note(
        "Purpose: fictional administrative proof data for testing Harborview local PDF-to-form candidate extraction. "
        "This document contains patient-reported information only. It is not clinical advice, a diagnosis, or a medical assessment."
    )
    pdf.section("Identity and contact")
    pdf.field("Full Name", "Avery Jordan Marshall")
    pdf.field("Date of Birth", "1991-05-17")
    pdf.field("Email", "avery.marshall@example.test")
    pdf.field("Phone", "+1 416 555 0148")
    pdf.field("Preferred Language", "English")
    pdf.field("Country/Region", "Canada")
    pdf.section("Administrative referral")
    pdf.field("Referral Source", "Fictional community wellness referral - administrative intake demonstration")
    pdf.field("Reason for Visit", "Recognition appointment and administrative coordination for a new primary-care relationship")
    pdf.field("Coverage Plan", "Northshore Community Coverage Plan - fictional demonstration coverage")

    pdf.add_page()
    pdf.heading("Registration Contact and Coverage Detail")
    pdf.section("Address and communication")
    pdf.field("Address Line 1", "118 Bayfield Avenue")
    pdf.field("Address Line 2", "Apartment 3B")
    pdf.field("City", "Toronto")
    pdf.field("State/Province", "Ontario")
    pdf.field("Postal Code", "M5V 2T6")
    pdf.field("Communication Preference", "Email first; telephone for time-sensitive administrative changes")
    pdf.section("Emergency contact")
    pdf.field("Emergency Contact Name", "Jordan Marshall")
    pdf.field("Emergency Contact Relationship", "Sibling")
    pdf.field("Emergency Contact Phone", "+1 416 555 0192")
    pdf.section("Coverage reference")
    pdf.field("Payer", "Northshore Community Coverage Plan")
    pdf.field("Member or Policy Number", "DEMO-NCCP-4482-771")
    pdf.field("Coverage Notes", "Fictional plan; administrative eligibility has not been verified")

    pdf.add_page()
    pdf.heading("Patient-Reported Conditions and Allergies")
    pdf.note(
        "All fields below are fictional, self-reported training text. Harborview must display them as extracted/unverified. "
        "The proof must not interpret, diagnose, triage, or recommend treatment from this text."
    )
    pdf.section("Patient-reported conditions")
    pdf.field(
        "Patient-reported conditions",
        "Recurring migraines reported since university; seasonal nasal allergy symptoms; intermittent lower-back stiffness after desk work; "
        "history of childhood asthma reported as inactive; occasional sleep disruption during high-stress periods; motion sensitivity during long ferry travel; "
        "dry skin reported during winter; prior ankle sprain with occasional stiffness after extended walking.",
    )
    pdf.section("Patient-reported allergies")
    pdf.field(
        "Patient-reported allergies",
        "Penicillin reported rash in childhood; pollen sensitivity reported each spring; adhesive tape irritation reported after prior procedures; "
        "fragrance sensitivity reported in enclosed spaces; no food allergy reported in this fictional sample.",
    )
    pdf.section("Source wording and verification")
    pdf.field("Verification Status", "Not verified - copied from a fictional patient-provided source document")
    pdf.field("Administrative Follow-up", "Confirm spelling, dates, and whether the list is current during a verified staff intake")

    pdf.add_page()
    pdf.heading("Patient-Reported Medications and Procedures")
    pdf.section("Patient-reported medications")
    pdf.field(
        "Patient-reported medications",
        "Cetirizine 10 mg as needed during allergy season; ibuprofen 200 mg occasionally for self-reported headache discomfort; "
        "vitamin D supplement daily; magnesium glycinate in the evening; saline nasal spray as needed; topical fragrance-free moisturizer; "
        "no prescription medication list confirmed in this fictional sample.",
    )
    pdf.section("Patient-reported procedures")
    pdf.field(
        "Patient-reported procedures",
        "Appendectomy reported in 2007; wisdom-tooth extraction reported in 2010; physical therapy course for lower-back stiffness reported in 2021; "
        "dental crown replacement reported in 2023; ankle imaging after a recreational sprain reported in 2019; routine vision examination reported in 2025.",
    )
    pdf.section("Source chronology")
    pdf.field("Most Recent List Review", "Patient reports reviewing this fictional list on 2026-08-20")
    pdf.field("Outside Documents Mentioned", "No outside report is attached beyond this fictional training packet")

    pdf.add_page()
    pdf.heading("Administrative Review Notes and Proof Instructions")
    pdf.section("Patient-reported context")
    pdf.field(
        "Patient-reported context",
        "Works primarily at a desk; prefers morning administrative calls; requests plain-language appointment instructions; "
        "uses email for routine reminders; asks that emergency contact details be confirmed before any record is created; "
        "reports no accessibility accommodation request in this fictional packet.",
    )
    pdf.section("Registration checklist")
    pdf.field("Identity Check", "Not completed")
    pdf.field("Coverage Check", "Not completed")
    pdf.field("Staff Review", "Required")
    pdf.field("Appointment Status", "No hold or booking created")
    pdf.section("Proof instruction")
    pdf.note(
        "Upload this file using the Harborview registration form's direct PDF upload control. Review each PDF candidate, complete any missing fields locally, "
        "and use the assistant only for bounded conversation guidance. Do not attach this document in chat for the direct-to-Harborview demonstration."
    )
    pdf.output(str(OUT / "harborview_avery_marshall_extended_registration.pdf"))


def create_sofia():
    pdf = new_pdf()
    pdf.add_page()
    pdf.heading("Resumen de Derivacion y Registro")
    pdf.note(
        "Documento ficticio para pruebas de Harborview. Los datos son administrativos y reportados por la paciente. "
        "No constituyen diagnostico, triaje, interpretacion ni consejo medico."
    )
    pdf.section("Identidad y contacto")
    pdf.field("Nombre completo", "Sofia Elena Rivera")
    pdf.field("Fecha de nacimiento", "1988-09-03")
    pdf.field("Correo electronico", "sofia.rivera@example.test")
    pdf.field("Telefono", "+598 94 555 248")
    pdf.field("Idioma preferido", "Espanol")
    pdf.field("Pais/Region", "Uruguay")
    pdf.section("Contacto de emergencia")
    pdf.field("Contacto de emergencia", "Mateo Rivera")
    pdf.field("Relacion de emergencia", "Hermano")
    pdf.field("Telefono de emergencia", "+598 98 555 661")
    pdf.section("Cobertura y derivacion")
    pdf.field("Aseguradora", "Plan de cobertura comunitaria ficticio")
    pdf.field("Derivacion", "Derivacion administrativa ficticia para cita de reconocimiento")

    pdf.add_page()
    pdf.heading("Informacion Reportada Por La Paciente")
    pdf.note("Harborview debe mostrar estos valores como extraidos/no verificados. El contenido no debe interpretarse clinicamente.")
    pdf.section("Condiciones reportadas")
    pdf.field(
        "Condiciones reportadas",
        "Migranas recurrentes reportadas; alergia estacional reportada; rigidez ocasional de espalda despues de trabajo de escritorio; "
        "antecedente de asma infantil reportado como inactivo; sensibilidad al movimiento durante viajes largos reportada.",
    )
    pdf.section("Alergias")
    pdf.field(
        "Alergias",
        "Alergia a penicilina reportada con erupcion en la infancia; sensibilidad al polen reportada; irritacion con cinta adhesiva reportada.",
    )
    pdf.section("Medicamentos")
    pdf.field(
        "Medicamentos",
        "Cetirizina segun necesidad; vitamina D diaria; ibuprofeno ocasional reportado; suplemento de magnesio por la noche; solucion salina segun necesidad.",
    )
    pdf.section("Procedimientos")
    pdf.field(
        "Procedimientos",
        "Apendicectomia reportada en 2007; tratamiento de fisioterapia reportado en 2021; corona dental reportada en 2023; extraccion dental reportada en 2010.",
    )
    pdf.output(str(OUT / "harborview_sofia_rivera_spanish_referral.pdf"))


def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{name}", size)


def rounded_box(draw, bounds, fill, outline=None, radius=18, width=2):
    draw.rounded_rectangle(bounds, radius=radius, fill=fill, outline=outline, width=width)


def create_duplicate_review_visual():
    canvas = Image.new("RGB", (1600, 900), (247, 247, 242))
    draw = ImageDraw.Draw(canvas)
    navy = (16, 43, 61)
    teal = (39, 117, 121)
    seafoam = (220, 236, 231)
    muted = (91, 108, 118)
    white = (255, 255, 255)

    draw.rectangle((0, 0, 1600, 104), fill=navy)
    draw.text((72, 28), "HARBORVIEW FAMILY HEALTH CENTRE", font=font(30, True), fill=white)
    draw.text((72, 68), "FICTIONAL CONCEPT REFERENCE  •  NOT LIVE SYSTEM OUTPUT", font=font(16, True), fill=(169, 217, 207))

    draw.text((72, 148), "Review possible duplicates before creating", font=font(42, True), fill=navy)
    draw.text((72, 205), "Candidate details are administrative signals—not proof of identity.", font=font(23), fill=muted)

    rounded_box(draw, (72, 270, 545, 728), white, (220, 225, 224), 22, 2)
    draw.text((108, 306), "SOURCE CANDIDATE", font=font(16, True), fill=teal)
    draw.text((108, 352), "Sofia Elena Rivera", font=font(31, True), fill=navy)
    source_rows = [
        ("Date of birth", "1988-09-03"),
        ("Email", "sofia.rivera@example.test"),
        ("Phone", "+598 94 555 248"),
        ("Language", "Spanish"),
        ("Status", "Extracted / unverified"),
    ]
    y = 426
    for label, value in source_rows:
        draw.text((108, y), label.upper(), font=font(13, True), fill=muted)
        draw.text((108, y + 23), value, font=font(20), fill=navy)
        draw.line((108, y + 57, 505, y + 57), fill=(229, 232, 230), width=2)
        y += 71

    draw.text((610, 286), "POSSIBLE MATCHES", font=font(16, True), fill=teal)
    draw.text((610, 320), "Staff must compare identifiers and confirm the next step.", font=font(20), fill=muted)

    match_cards = [
        ("Possible match A", "Sofia Rivera", "1988-09-03  •  s••••@example.test", True),
        ("Possible match B", "S. E. Rivera", "1989-03-09  •  different phone", False),
        ("Create new patient", "No confirmed match", "Use only after duplicate review", False),
    ]
    y = 384
    for eyebrow, title, detail, selected in match_cards:
        fill = seafoam if selected else white
        outline = teal if selected else (210, 217, 217)
        rounded_box(draw, (610, y, 1528, y + 118), fill, outline, 18, 3 if selected else 2)
        draw.ellipse((642, y + 40, 676, y + 74), outline=teal, width=3)
        if selected:
            draw.ellipse((651, y + 49, 667, y + 65), fill=teal)
        draw.text((706, y + 20), eyebrow.upper(), font=font(13, True), fill=teal)
        draw.text((706, y + 46), title, font=font(24, True), fill=navy)
        draw.text((706, y + 80), detail, font=font(17), fill=muted)
        y += 138

    draw.rectangle((0, 802, 1600, 900), fill=navy)
    draw.text((72, 830), "STAFF CHECK", font=font(14, True), fill=(169, 217, 207))
    draw.text((72, 855), "Review identity  •  select only when confirmed  •  then create or match the intake", font=font(20, True), fill=white)
    draw.text((1290, 846), "FICTIONAL DATA", font=font(15, True), fill=(169, 217, 207))

    canvas.save(OUT / "harborview_reception_duplicate_review.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    create_avery()
    create_sofia()
    create_duplicate_review_visual()
    print(f"Generated proof assets in {OUT}")
