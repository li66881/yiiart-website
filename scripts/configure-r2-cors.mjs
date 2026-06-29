import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3"

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const bucket = process.env.CLOUDFLARE_R2_BUCKET
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error("Cloudflare R2 credentials and bucket are required.")
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
})

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [
            "https://www.yiiart.com",
            "https://yiiart.com",
            "http://localhost:3000",
            "http://localhost:3001",
          ],
          AllowedMethods: ["PUT", "HEAD"],
          AllowedHeaders: ["content-type", "cache-control"],
          ExposeHeaders: ["etag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  })
)

console.log(`Configured browser upload CORS for R2 bucket ${bucket}.`)
