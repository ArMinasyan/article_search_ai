const { createToolCallingAgent, AgentExecutor } = require("@langchain/classic/agents");
module.exports = function createResearchPdf(result) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 72, bottom: 72, left: 60, right: 60 },
    bufferPages: true,
    info: { Title: result.topic, Author: 'Article Search AI', Subject: 'Research report' },
  });
  const colors = { ink: '#172B4D', body: '#334155', muted: '#64748B', accent: '#0F766E', rule: '#DCE5EA' };
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  function section(title) {
    if (doc.y + 70 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
    doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.accent)
      .text(title, { characterSpacing: 1.2 });
    doc.moveDown(0.8);
  }

  doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.accent)
    .text('RESEARCH REPORT', { characterSpacing: 2 });
  doc.moveDown(1.2);
  doc.font('Helvetica-Bold').fontSize(28).fillColor(colors.ink)
    .text(result.topic, { lineGap: 4 });
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9).fillColor(colors.muted)
    .text(`ARTICLE SEARCH AI  |  ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1.5);
  doc.strokeColor(colors.rule).lineWidth(1)
    .moveTo(60, doc.y).lineTo(60 + width, doc.y).stroke();
  doc.moveDown(1.5);

  section('SUMMARY');
  for (const paragraph of result.summary.split(/\r?\n/).map(text => text.trim()).filter(Boolean)) {
    doc.font('Helvetica').fontSize(11).fillColor(colors.body)
      .text(paragraph, { align: 'left', lineGap: 5, paragraphGap: 12 });
  }

  doc.moveDown(1);
  section('SOURCES');
  doc.font('Helvetica').fontSize(9).fillColor(colors.muted)
    .text(result.source, { lineGap: 4 });

  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor(colors.accent).lineWidth(3)
      .moveTo(60, 40).lineTo(92, 40).stroke();
    doc.strokeColor(colors.rule).lineWidth(0.5)
      .moveTo(60, doc.page.height - 55).lineTo(60 + width, doc.page.height - 55).stroke();
    // Keep footer text outside the body flow without creating another page.
    doc.font('Helvetica').fontSize(8).fillColor(colors.muted)
      .text(`ARTICLE SEARCH AI   |   ${i - pages.start + 1} / ${pages.count}`,
        60, doc.page.height - 43, { lineBreak: false });
  }

  return doc;
}
