const URL = "https://www.emser-therme.de/";

const widgetSize = config.widgetFamily || "large";
const auslastung = await getAuslastung();
const widget = await createWidget(auslastung);

if (!config.runsInWidget) {
  switch (widgetSize) {
    case "small": await widget.presentSmall(); break;
    case "large": await widget.presentLarge(); break;
    default: await widget.presentMedium();
  }
}
Script.setWidget(widget);
Script.complete();

async function getAuslastung() {
  try {
    const req = new Request(URL);
    const html = await req.loadString();
    // Regex für <div class="current">18%</div>
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
  // Layout-Parameter je nach Widgetgröße
  let titleSize, percentSize, spacing, footerSize;
  if (widgetSize === "small") {
    titleSize = 14; percentSize = 36; spacing = 6; footerSize = 8;
  } else if (widgetSize === "medium") {
    titleSize = 18; percentSize = 48; spacing = 10; footerSize = 12;
  } else {
    titleSize = 22; percentSize = 60; spacing = 16; footerSize = 14;
  }

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1C1C1E");
  widget.setPadding(spacing, spacing, spacing, spacing);

  // Header
  const header = widget.addText("♨️ Emser Therme");
  header.font = Font.boldSystemFont(titleSize);
  header.textColor = Color.white();
  widget.addSpacer(spacing);

  // Hauptwert
  if (auslastung !== null) {
    const percent = widget.addText(auslastung + "%");
    percent.font = Font.boldRoundedSystemFont(percentSize);
    percent.textColor = getColorForPercentage(auslastung);
    percent.centerAlignText();
  } else {
    const error = widget.addText("Keine Daten");
    error.font = Font.systemFont(titleSize);
    error.textColor = Color.red();
    error.centerAlignText();
  }
  widget.addSpacer(spacing);

  // Footer
  const df = new DateFormatter();
  df.useMediumTimeStyle();
  const lastUpdate = widget.addText("Letztes Update: " + df.string(new Date()));
  lastUpdate.font = Font.lightSystemFont(footerSize);
  lastUpdate.textColor = Color.gray();
  lastUpdate.rightAlignText();
  lastUpdate.textOpacity = 0.7;

  return widget;
}

function getColorForPercentage(p) {
  if (p < 20) return new Color("#4CD964");      // Grün
  if (p < 50) return new Color("#FFCC00");      // Gelb
  if (p < 75) return new Color("#FF9500");      // Orange
  return new Color("#FF3B30");                  // Rot
}
