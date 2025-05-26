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
  let titleSize, percentSize, spacing, footerSize, captionSize;
  if (widgetSize === "small") {
    titleSize = 16; percentSize = 32; captionSize = 12; spacing = 6; footerSize = 9;
  } else if (widgetSize === "medium") {
    titleSize = 20; percentSize = 46; captionSize = 16; spacing = 10; footerSize = 12;
  } else {
    titleSize = 26; percentSize = 60; captionSize = 20; spacing = 14; footerSize = 15;
  }

  const accentColor = new Color("#1565c0");

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1C1C1E");
  widget.setPadding(spacing, spacing, spacing, spacing);

  widget.addSpacer();

  const centerStack = widget.addStack();
  centerStack.layoutVertically();
  centerStack.centerAlignContent();
  centerStack.addSpacer();

  const title = centerStack.addText("Emser Therme");
  title.font = Font.boldSystemFont(titleSize);
  title.textColor = accentColor;
  title.centerAlignText();

  centerStack.addSpacer(spacing);

  if (auslastung !== null) {
    const percent = centerStack.addText(auslastung + "%");
    percent.font = Font.boldRoundedSystemFont(percentSize);
    percent.textColor = accentColor;
    percent.centerAlignText();
  } else {
    const error = centerStack.addText("Keine Daten");
    error.font = Font.systemFont(titleSize);
    error.textColor = Color.red();
    error.centerAlignText();
  }

  centerStack.addSpacer(spacing / 2);

  const caption = centerStack.addText("Therme & Sauna");
  caption.font = Font.italicSystemFont(captionSize);
  caption.textColor = accentColor;
  caption.centerAlignText();

  centerStack.addSpacer();
  widget.addSpacer();

  const footerStack = widget.addStack();
  footerStack.addSpacer();
  const df = new DateFormatter();
  df.useMediumTimeStyle();
  const lastUpdate = footerStack.addText("Letztes Update: " + df.string(new Date()));
  lastUpdate.font = Font.lightSystemFont(footerSize);
  lastUpdate.textColor = Color.gray();
  lastUpdate.textOpacity = 0.7;

  return widget;
}
