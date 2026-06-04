import TranslatedText from "@/components/TranslatedText"

export default function ReviewTrustBadge() {
  return (
    <div className="border bg-gray-50 p-4 text-sm text-gray-600">
      <p className="font-medium text-black"><TranslatedText k="reviews.trustTitle" /></p>
      <p className="mt-2 leading-6">
        <TranslatedText k="reviews.trustText" />
      </p>
    </div>
  )
}
