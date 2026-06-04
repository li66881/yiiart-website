import en from "../../messages/en.json"
import zh from "../../messages/zh.json"
import de from "../../messages/de.json"
import fr from "../../messages/fr.json"
import ar from "../../messages/ar.json"

type Messages = Record<string, any>
const messages: Record<string, Messages> = { en, zh, de, fr, ar }

export async function getTranslations(locale: string = "en"): Promise<Record<string, string>> {
  const msgs = messages[locale] || messages["en"]
  
  // Flatten nested object for easy access in server components
  const flat: Record<string, string> = {}
  
  function flatten(obj: any, prefix = "") {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === "object") {
        flatten(obj[key], fullKey)
      } else {
        flat[fullKey] = obj[key]
      }
    }
  }
  
  flatten(msgs)
  return flat
}
