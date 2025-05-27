// Emser Therme Auslastung Donut-Chart Widget – nur mit dokumentierten DrawContext-Methoden

const URL = "https://www.emser-therme.de/";
const widgetSize = config.widgetFamily || "large";
const auslastung = await getAuslastung();
const widget = await createWidget(auslastung);

if (!config.runsInWidget) {
  switch (widgetSize) {
    case "small": await widget.presentSmall(); break;
    case "large": await widget.presentLarge(); break;
    default: await widget.presentMedium(); break;
  }
}
Script.setWidget(widget);
Script.complete();

async function getAuslastung() {
  try {
    const req = new Request(URL);
    const html = await req.loadString();
    const match = html.match(/<div class="current">(\d+)%<\/div>/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function createWidget(auslastung) {
  // Größe je nach Widget
  let donutSize, donutThickness, titleSize, percentSize, captionSize, footerSize, spacing;
  if (widgetSize === "small") {
    donutSize = 80; donutThickness = 12; titleSize = 13; percentSize = 18; captionSize = 10; footerSize = 8; spacing = 4;
  } else if (widgetSize === "medium") {
    donutSize = 120; donutThickness = 18; titleSize = 18; percentSize = 28; captionSize = 14; footerSize = 12; spacing = 8;
  } else {
    donutSize = 170; donutThickness = 24; titleSize = 22; percentSize = 38; captionSize = 18; footerSize = 15; spacing = 10;
  }

  const accentColor = new Color("#1565c0");
  const bgColor = new Color("#1C1C1E");
  const donutBg = new Color("#333333", 0.3);

  const widget = new ListWidget();
  widget.backgroundColor = bgColor;
  widget.setPadding(spacing, spacing, spacing, spacing);

  // Titel
  const title = widget.addText("Emser Therme");
  title.font = Font.boldSystemFont(titleSize);
  title.textColor = accentColor;
  title.leftAlignText();
  widget.addSpacer(spacing);

  // Donut-Chart Bild
  const donutImg = drawDonutChart(auslastung, donutSize, donutThickness, accentColor, donutBg);
  const imgStack = widget.addStack();
  imgStack.addSpacer();
  imgStack.addImage(donutImg);
  imgStack.addSpacer();
  widget.addSpacer(spacing);

  // Prozentzahl mittig
  const percentStack = widget.addStack();
  percentStack.addSpacer();
  if (auslastung !== null) {
    const percentText = percentStack.addText(`${auslastung}%`);
    percentText.font = Font.boldRoundedSystemFont(percentSize);
    percentText.textColor = accentColor;
    percentText.centerAlignText();
  } else {
    const errorText = percentStack.addText("Keine Daten");
    errorText.font = Font.systemFont(percentSize);
    errorText.textColor = Color.red();
    errorText.centerAlignText();
  }
  percentStack.addSpacer();

  // Untertitel
  const caption = widget.addText("Therme & Sauna");
  caption.font = Font.italicSystemFont(captionSize);
  caption.textColor = accentColor;
  caption.leftAlignText();
  widget.addSpacer(spacing);

  // Footer (links)
  const footerStack = widget.addStack();
  const df = new DateFormatter();
  df.useMediumTimeStyle();
  const lastUpdate = footerStack.addText("Letztes Update: " + df.string(new Date()));
  lastUpdate.font = Font.lightSystemFont(footerSize);
  lastUpdate.textColor = Color.gray();
  lastUpdate.textOpacity = 0.7;
  lastUpdate.leftAlignText();

  return widget;
}

function drawDonutChart(percent, size, thickness, fgColor, bgColor) {
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  // Hintergrund-Kreis (vollständig)
  ctx.setStrokeColor(bgColor);
  ctx.setLineWidth(thickness);
  ctx.strokeEllipse(new Rect(thickness/2, thickness/2, size-thickness, size-thickness));

  // Vordergrund-Bogen (Teilkreis)
  if (typeof percent === "number" && percent > 0) {
    const path = new Path();
    const center = new Point(size/2, size/2);
    const radius = (size - thickness) / 2;
    const startAngle = -Math.PI/2;
    const endAngle = startAngle + (2 * Math.PI * percent / 100);

    // Pfad für Bogen
    path.addArc(center, radius, startAngle, endAngle, false);

    ctx.addPath(path);
    ctx.setStrokeColor(fgColor);
    ctx.setLineWidth(thickness);
    ctx.strokePath();
  }

  return ctx.getImage();
}

