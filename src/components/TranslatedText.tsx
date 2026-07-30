"use client"

import { useLanguage } from "@/context/LanguageContext"

type TranslatedTextProps = {
  k: string
  fallback?: string
}

type TranslatedTemplateProps = TranslatedTextProps & {
  values: Record<string, string>
}

export default function TranslatedText({ k, fallback }: TranslatedTextProps) {
  const { t } = useLanguage()
  const value = t(k)

  return <>{value === k ? fallback || k : value}</>
}

export function TranslatedTemplate({ k, fallback, values }: TranslatedTemplateProps) {
  const { t } = useLanguage()
  const value = t(k)
  const template = value === k ? fallback || k : value

  return <>{formatTemplate(template, values)}</>
}

export function TranslatedOption({ value }: { value: string }) {
  const { t } = useLanguage()
  return <>{translateOption(t, value)}</>
}

export function TranslatedOptionList({
  values,
  separator = ", ",
}: {
  values: string[]
  separator?: string
}) {
  const { t } = useLanguage()
  return <>{values.filter(Boolean).map((value) => translateOption(t, value)).join(separator)}</>
}

export function TranslatedReviewCount({ count }: { count: number }) {
  const { t } = useLanguage()
  const reviewWord = t(count === 1 ? "reviews.verifiedReview" : "reviews.verifiedReviews")

  return (
    <>
      {formatTemplate(t("reviews.basedOn"), {
        count: String(count),
        reviewWord,
      })}
    </>
  )
}

function translateOption(t: (key: string) => string, value: string) {
  const key = `discovery.option.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template
  )
}
