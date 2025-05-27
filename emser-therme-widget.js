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
  let titleSize, percentSize, spacing, footerSize, captionSize, chartSize;
  if (widgetSize === "small") {
    titleSize = 16; percentSize = 18; captionSize = 12; spacing = 6; footerSize = 9; chartSize = 70;
  } else if (widgetSize === "medium") {
    titleSize = 20; percentSize = 24; captionSize = 16; spacing = 10; footerSize = 12; chartSize = 110;
  } else {
    titleSize = 26; percentSize = 32; captionSize = 20; spacing = 14; footerSize = 15; chartSize = 150;
  }

  const accentColor = new Color("#1592c0");

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1C1C1E");
  widget.setPadding(spacing, spacing, spacing, spacing);

  widget.addSpacer();

  const centerRow = widget.addStack();
  centerRow.addSpacer();
  const centerCol = centerRow.addStack();
  centerCol.layoutVertically();
  centerCol.centerAlignContent();

  centerCol.addSpacer();

  const title = centerCol.addText("Emser Therme");
  title.font = Font.boldSystemFont(titleSize);
  title.textColor = accentColor;
  title.centerAlignText();

  centerCol.addSpacer(spacing);

  let chartImg;
  if (auslastung !== null) {
    chartImg = drawPieChart(auslastung, chartSize, accentColor);
  } else {
    chartImg = drawPieChart(0, chartSize, Color.gray());
  }
  const imgStack = centerCol.addStack();
  imgStack.addSpacer();
  imgStack.addImage(chartImg);
  imgStack.addSpacer();

  if (auslastung !== null) {
    const percent = centerCol.addText(auslastung + "%");
    percent.font = Font.boldRoundedSystemFont(percentSize);
    percent.textColor = accentColor;
    percent.centerAlignText();
  } else {
    const error = centerCol.addText("Keine Daten");
    error.font = Font.systemFont(titleSize);
    error.textColor = Color.red();
    error.centerAlignText();
  }

  centerCol.addSpacer(spacing / 2);

  const caption = centerCol.addText("Therme & Sauna");
  caption.font = Font.italicSystemFont(captionSize);
  caption.textColor = accentColor;
  caption.centerAlignText();

  centerCol.addSpacer();
  centerRow.addSpacer();

  widget.addSpacer();

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

function drawPieChart(percent, size, color) {
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  ctx.setFillColor(new Color("#333333", 0.2));
  ctx.fillEllipse(new Rect(0, 0, size, size));

  const angle = (percent / 100) * 2 * Math.PI;
  ctx.setFillColor(color);
  ctx.beginPath();
  ctx.moveToPoint(size / 2, size / 2);
  ctx.addArc(size / 2, size / 2, size / 2, -Math.PI / 2, -Math.PI / 2 + angle, false);
  ctx.closePath();
  ctx.fillPath();

  return ctx.getImage();
}
