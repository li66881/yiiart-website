import en from "../../messages/en.json"
import zh from "../../messages/zh.json"

type Messages = typeof en
const messages: Record<string, Messages> = { en, zh }

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
