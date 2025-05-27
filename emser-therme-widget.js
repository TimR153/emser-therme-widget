const URL = "https://www.emser-therme.de/";
const widgetSize = config.widgetFamily || "large";

const auslastung = await getAuslastung();
const widget = await createWidget(auslastung, widgetSize);

if (!config.runsInWidget) {
  await showPreview(widget, widgetSize);
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

async function createWidget(auslastung, widgetSize) {
  const sizes = getSizes(widgetSize);

  const accentColor = new Color("#2fb9eb");
  const bgColor = new Color("#1C1C1E");
  const barBg = new Color("#333333", 0.3);

  const widget = new ListWidget();
  widget.backgroundColor = bgColor;
  widget.setPadding(sizes.padding, sizes.padding, sizes.padding, sizes.padding);

  addTitle(widget, accentColor, sizes.titleSize, sizes.spacing);
  addBar(widget, auslastung, sizes, accentColor, barBg, sizes.spacing);
  addPercent(widget, auslastung, accentColor, sizes.percentSize, sizes.spacing);
  addCaption(widget, accentColor, sizes.captionSize, sizes.spacing);
  addFooter(widget, sizes.footerSize);

  return widget;
}

async function showPreview(widget, widgetSize) {
  switch (widgetSize) {
    case "small": await widget.presentSmall(); break;
    case "large": await widget.presentLarge(); break;
    default: await widget.presentMedium(); break;
  }
}

function getSizes(widgetSize) {
  if (widgetSize === "small") {
    return { barWidth: 60, barHeight: 24, titleSize: 18, percentSize: 34, captionSize: 14, footerSize: 10, spacing: 10, padding: 8 };
  } else if (widgetSize === "medium") {
    return { barWidth: 180, barHeight: 18, titleSize: 18, percentSize: 38, captionSize: 16, footerSize: 12, spacing: 16, padding: 8 };
  } else {
    return { barWidth: 260, barHeight: 24, titleSize: 22, percentSize: 38, captionSize: 18, footerSize: 15, spacing: 16, padding: 8 };
  }
}

function addTitle(widget, accentColor, titleSize, spacing) {
  const title = widget.addText("Emser Therme");
  title.font = Font.boldSystemFont(titleSize);
  title.textColor = accentColor;
  title.leftAlignText();
  title.centerAlignText();
  widget.addSpacer(spacing);
}

function addBar(widget, auslastung, sizes, accentColor, barBg, spacing) {
  const barImg = drawBarChart(auslastung, sizes.barWidth, sizes.barHeight, accentColor, barBg);
  const imgStack = widget.addStack();
  imgStack.addSpacer();
  imgStack.addImage(barImg);
  imgStack.addSpacer();
  widget.addSpacer(spacing);
}

function addPercent(widget, auslastung, accentColor, percentSize, spacing) {
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
  widget.addSpacer(spacing);
}

function addCaption(widget, accentColor, captionSize, spacing) {
  const caption = widget.addText("Therme & Sauna");
  caption.font = Font.italicSystemFont(captionSize);
  caption.textColor = accentColor;
  caption.centerAlignText();
  widget.addSpacer(spacing);
}

function addFooter(widget, footerSize) {
  const footerStack = widget.addStack();
  footerStack.addSpacer();
  const df = new DateFormatter();
  df.useMediumTimeStyle();
  const lastUpdate = footerStack.addText("Letztes Update: " + df.string(new Date()));
  lastUpdate.font = Font.italicSystemFont(footerSize);
  lastUpdate.textColor = Color.gray();
  lastUpdate.centerAlignText();
  lastUpdate.textOpacity = 0.7;
  footerStack.addSpacer();
}

function drawBarChart(percent, width, height, fgColor, bgColor) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  ctx.setFillColor(bgColor);
  ctx.fillRect(new Rect(0, 0, width, height));

  if (typeof percent === "number" && percent > 0) {
    ctx.setFillColor(fgColor);
    ctx.fillRect(new Rect(0, 0, width * (percent/100), height));
  }

  ctx.setStrokeColor(Color.gray());
  ctx.setLineWidth(1);
  ctx.strokeRect(new Rect(0, 0, width, height));

  return ctx.getImage();
}
