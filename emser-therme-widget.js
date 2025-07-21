const URL = "https://www.emser-therme.de/";
const widgetSize = config.widgetFamily || "large";
const VERSION = "1.0.1";
const USER = "TimR153";
const REPO = "emser-therme-widget";

let showExclamation = false;
await checkForUpdates();
const auslastung = await getAuslastung();
const widget = await createWidget(auslastung, widgetSize);

if (!config.runsInWidget) {
  await showPreview(widget, widgetSize);
}
Script.setWidget(widget);
Script.complete();

async function checkForUpdates() {
  const apiUrl = `https://api.github.com/repos/${USER}/${REPO}/releases/latest`;
  try {
    const req = new Request(apiUrl);
    const json = await req.loadJSON();
    if (!json.tag_name) return;
    const latest = json.tag_name.replace(/^v/, "");
    if (isMinorOrMajorUpdate(latest, VERSION)) {
      showExclamation = true;

      if (!config.runsInWidget) {
        let alert = new Alert();
        alert.title = "Update available!";
        alert.message = `A new version (${latest}) is available on GitHub.\nYour version: ${VERSION}`;
        alert.addAction("Open GitHub");
        alert.addCancelAction("Later");
        let response = await alert.present();
        if (response === 0) Safari.openInApp(json.html_url, false);
      }
    }
  } catch (e) {
    console.warn("Update check failed:", e);
    return false;
  }
}

function isMinorOrMajorUpdate(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  if ((pa[0]||0) > (pb[0]||0)) return true;
  if ((pa[0]||0) < (pb[0]||0)) return false;
  if ((pa[1]||0) > (pb[1]||0)) return true;
  return false;
}

async function getAuslastung() {
  try {
    const req = new Request(URL);
    const html = await req.loadString();
    const match = html.match(/<h3 class="bold mb-0">(\d+)%<\/h3>/);
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
    return { barWidth: 100, barHeight: 18, titleSize: 18, percentSize: 30, captionSize: 14, footerSize: 10, spacing: 6, padding: 8 };
  } else if (widgetSize === "medium") {
    return { barWidth: 180, barHeight: 18, titleSize: 18, percentSize: 36, captionSize: 16, footerSize: 12, spacing: 6, padding: 8 };
  } else {
    return { barWidth: 260, barHeight: 24, titleSize: 22, percentSize: 38, captionSize: 18, footerSize: 15, spacing: 6, padding: 8 };
  }
}

function addTitle(widget, accentColor, titleSize, spacing) {
  const titleText = showExclamation ? "↑ Emser Therme" : "Emser Therme";
  const title = widget.addText(titleText);
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
