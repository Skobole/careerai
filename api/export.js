export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { resumeData } = req.body;

    const {
      name = '', contact = '', summary = '',
      sections = [], industry = 'professional'
    } = resumeData;

    const lines = [];

    // Header
    lines.push({ text: name, style: 'name' });
    lines.push({ text: contact, style: 'contact' });
    lines.push({ text: '', style: 'spacer' });

    // Summary
    if (summary) {
      lines.push({ text: 'PROFESSIONAL SUMMARY', style: 'section-header' });
      lines.push({ text: summary, style: 'body' });
      lines.push({ text: '', style: 'spacer' });
    }

    // Sections
    sections.forEach(section => {
      lines.push({ text: section.title.toUpperCase(), style: 'section-header' });
      if (section.subtitle) lines.push({ text: section.subtitle, style: 'subtitle' });
      if (section.body) lines.push({ text: section.body, style: 'body' });
      if (section.bullets) {
        section.bullets.forEach(b => lines.push({ text: b, style: 'bullet' }));
      }
      lines.push({ text: '', style: 'spacer' });
    });

    // Build HTML for Word-compatible export
    let html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8"/>
<style>
  @page { size: 8.5in 11in; margin: 0.75in 0.9in; }
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; line-height: 1.4; }
  .name { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 2pt; letter-spacing: 1px; }
  .contact { font-size: 9.5pt; text-align: center; color: #444; margin-bottom: 8pt; }
  .section-header { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #1a1a1a; margin-top: 10pt; margin-bottom: 4pt; padding-bottom: 2pt; }
  .subtitle { font-size: 10pt; font-weight: bold; margin-bottom: 2pt; }
  .body { font-size: 10pt; margin-bottom: 4pt; }
  .bullet { font-size: 10pt; margin-left: 14pt; text-indent: -14pt; margin-bottom: 2pt; }
  .bullet::before { content: "• "; }
  .spacer { margin-bottom: 4pt; }
</style>
</head>
<body>`;

    lines.forEach(line => {
      if (line.style === 'bullet') {
        html += `<p class="bullet">${line.text}</p>`;
      } else if (line.style === 'spacer') {
        html += `<p class="spacer">&nbsp;</p>`;
      } else {
        html += `<p class="${line.style}">${line.text}</p>`;
      }
    });

    html += `</body></html>`;

    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename="optimized-resume.doc"');
    return res.status(200).send(html);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
