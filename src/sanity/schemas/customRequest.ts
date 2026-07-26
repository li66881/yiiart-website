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
  ],
  preview: {
    select: { title: "name", subtitle: "email" },
  },
})
