import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { uploadToR2, getR2Config } from "../_shared/r2Client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "uploads";
    const customFileName = formData.get("fileName") as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = getR2Config();
    if (!config.bucketName || !config.publicUrl) {
      throw new Error("R2_BUCKET_NAME or R2_PUBLIC_URL not configured");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const extension = file.name.split(".").pop() || "bin";
    const fileName = customFileName || `${timestamp}-${randomId}.${extension}`;
    const key = `${folder}/${fileName}`;

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2
    const result = await uploadToR2(key, uint8Array, file.type || "application/octet-stream");

    if (!result.success) {
      throw new Error(result.error || "Upload failed");
    }

    console.log(`Successfully uploaded: ${key}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: result.url,
        key,
        fileName,
        contentType: file.type,
        size: file.size 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
