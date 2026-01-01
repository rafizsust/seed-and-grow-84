import { S3Client } from "https://esm.sh/@aws-sdk/client-s3@3.529.1";

export const getR2Client = () => {
  const accountId = Deno.env.get("R2_ACCOUNT_ID");
  
  if (!accountId) {
    throw new Error("R2_ACCOUNT_ID environment variable not set");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID") || "",
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY") || "",
    },
  });
};

export const getR2Config = () => ({
  bucketName: Deno.env.get("R2_BUCKET_NAME") || "",
  publicUrl: Deno.env.get("R2_PUBLIC_URL") || "",
});
