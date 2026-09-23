import { defineField, defineType } from "sanity"

export default defineType({
  name: "customRequest",
  title: "Custom Painting Request",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "artworkSize", title: "Artwork size", type: "string" }),
    defineField({ name: "preferredColors", title: "Preferred colors", type: "string" }),
    defineField({ name: "roomType", title: "Room type", type: "string" }),
    defineField({ name: "budget", title: "Budget", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text" }),
    defineField({ name: "clientRole", title: "Client role", type: "string" }),
    defineField({ name: "company", title: "Company or studio", type: "string" }),
    defineField({ name: "destinationCountry", title: "Delivery country or region", type: "string" }),
    defineField({ name: "artworkQuantity", title: "Approximate artwork quantity", type: "string" }),
    defineField({ name: "projectTiming", title: "Project timing", type: "string" }),
    defineField({
      name: "photos",
      title: "Room / reference photos",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "cloudflarePhotos",
      title: "Room / reference photos (Cloudflare)",
      type: "array",
      of: [{ type: "cloudflareAsset" }],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "In discussion", value: "in_discussion" },
          { title: "Quoted", value: "quoted" },
          { title: "In production", value: "in_production" },
          { title: "Completed", value: "completed" },
          { title: "Closed", value: "closed" },
        ],
      },
      initialValue: "new",
    }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime" }),
    defineField({ name: "source", title: "Source", type: "string" }),
    defineField({
      name: "intent",
      title: "Enquiry intent",
      type: "string",
      options: {
        list: [
          { title: "Size advice", value: "size-advice" },
          { title: "Custom painting", value: "custom" },
          { title: "Project enquiry", value: "project" },
        ],
      },
    }),
    defineField({ name: "artworkSlug", title: "Artwork slug", type: "string" }),
    defineField({ name: "artworkTitle", title: "Artwork or project", type: "string" }),
    defineField({ name: "sourcePage", title: "Source page", type: "string" }),
    defineField({ name: "landingPath", title: "Landing path", type: "string" }),
    defineField({ name: "utmSource", title: "UTM source", type: "string" }),
    defineField({ name: "utmMedium", title: "UTM medium", type: "string" }),
    defineField({ name: "utmCampaign", title: "UTM campaign", type: "string" }),
    defineField({ name: "utmContent", title: "UTM content", type: "string" }),
  ],
  preview: {
    select: { title: "name", subtitle: "email" },
  },
})
