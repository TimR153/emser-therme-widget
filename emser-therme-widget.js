// Emser Therme Auslastung Widget (ohne DrawContext, 100% kompatibel)

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
  // Größenanpassung für verschiedene Widgetgrößen
  let titleSize, percentSize, emojiSize, captionSize, footerSize, spacing, emojiCount;
  if (widgetSize === "small") {
    titleSize = 13; percentSize = 26; emojiSize = 18; captionSize = 10; footerSize = 8; spacing = 4; emojiCount = 5;
  } else if (widgetSize === "medium") {
    titleSize = 18; percentSize = 38; emojiSize = 28; captionSize = 14; footerSize = 12; spacing = 8; emojiCount = 10;
  } else {
    titleSize = 22; percentSize = 54; emojiSize = 36; captionSize = 18; footerSize = 15; spacing = 12; emojiCount = 15;
  }

  const accentColor = new Color("#1565c0");
  const bgColor = new Color("#1C1C1E");

  const widget = new ListWidget();
  widget.backgroundColor = bgColor;
  widget.setPadding(spacing, spacing, spacing, spacing);

  // Titel
  const title = widget.addText("Emser Therme");
  title.font = Font.boldSystemFont(titleSize);
  title.textColor = accentColor;
  title.leftAlignText();
  widget.addSpacer(spacing);

  // Prozentzahl groß
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

  // Emoji-Visualisierung (Kreise gefüllt/leer)
  if (auslastung !== null) {
    let filled = Math.round((auslastung / 100) * emojiCount);
    let empty = emojiCount - filled;
    let emojiLine = "🔵".repeat(filled) + "⚪️".repeat(empty);
    const emojiStack = widget.addStack();
    emojiStack.addSpacer();
    const emojiText = emojiStack.addText(emojiLine);
    emojiText.font = Font.systemFont(emojiSize);
    emojiStack.addSpacer();
    widget.addSpacer(spacing);
  }

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
