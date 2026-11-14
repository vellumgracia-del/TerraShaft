import fs from "node:fs";
import path from "node:path";
import i18next from "i18next";
import { readmeResources } from "../src/locales/readmeResources";

const ROOT_DIR = path.resolve(__dirname, "..");

function buildReadmeMarkdown(lang: "id" | "en"): string {
  const t = i18next.getFixedT(lang, "readme");

  return `<div align="center">

[![Bahasa Indonesia](${t("badgeId")})](./README.md)
[![English](${t("badgeEn")})](./README.en.md)

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
    lng: "id",
    fallbackLng: "id",
    ns: ["readme"],
    defaultNS: "readme",
    interpolation: {
      escapeValue: false,
    },
    resources: readmeResources,
  });

  const mdId = buildReadmeMarkdown("id");
  const mdEn = buildReadmeMarkdown("en");

  fs.writeFileSync(path.join(ROOT_DIR, "README.md"), mdId, "utf8");
  fs.writeFileSync(path.join(ROOT_DIR, "README.en.md"), mdEn, "utf8");

  console.log("✅ [i18next] Generated README.md (Bahasa Indonesia) and README.en.md (English).");
}

main().catch((err) => {
  console.error("Failed to generate localized README files:", err);
  process.exit(1);
});
