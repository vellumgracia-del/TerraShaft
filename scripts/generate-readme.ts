import fs from "node:fs";
import path from "node:path";
import i18next from "i18next";
import { readmeResources } from "../src/locales/readmeResources";

const ROOT_DIR = path.resolve(__dirname, "..");

function buildReadmeMarkdown(lang: "id" | "en"): string {
  const t = i18next.getFixedT(lang, "readme");

  return `<div align="center">

[![English](${t("badgeEn")})](./README.md)
[![Bahasa Indonesia](${t("badgeId")})](./README.id.md)

</div>

# ${t("title")}

**${t("subtitle")}**

${t("intro1")}

${t("intro2")}

> **${t("noteLabel")}** ${t("noteBody")}

---

## ${t("tocTitle")}

${t("tocItems")}

---

${t("sectionsBody")}
`;
}

async function main() {
  await i18next.init({
    lng: "en",
    fallbackLng: "en",
    ns: ["readme"],
    defaultNS: "readme",
    interpolation: {
      escapeValue: false,
    },
    resources: readmeResources,
  });

  const mdEn = buildReadmeMarkdown("en");
  const mdId = buildReadmeMarkdown("id");

  fs.writeFileSync(path.join(ROOT_DIR, "README.md"), mdEn, "utf8");
  fs.writeFileSync(path.join(ROOT_DIR, "README.id.md"), mdId, "utf8");

  console.log("✅ [i18next] Generated README.md (English default) and README.id.md (Bahasa Indonesia).");
}

main().catch((err) => {
  console.error("Failed to generate localized README files:", err);
  process.exit(1);
});
