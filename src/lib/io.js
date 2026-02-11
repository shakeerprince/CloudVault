import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getSignedUrlPutFunction(fileName) {
    console.log("Generating signed URL for", fileName);

    const s3 = new S3Client({
        region: process.env.AWS_S3_REGION ? process.env.AWS_S3_REGION : 'blr1',
        credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY ? process.env.AWS_S3_ACCESS_KEY : 'DO801VUF7DJ2KNR9XDL7',
            secretAccessKey: process.env.AWS_S3_SECRET_KEY ? process.env.AWS_S3_SECRET_KEY : 'go8daNmwLELyJDVmsz9sD3eg/YgjW1d/CQz5pD3nHLI',
        },
        endpoint: process.env.AWS_S3_BUCKET_URL ? process.env.AWS_S3_BUCKET_URL : `https://sdhub.blr1.digitaloceanspaces.com`,
        forcePathStyle: false,
    });

    const params = {
        Key: fileName
    };

    try {
        console.log("S3 Client initialized, generating signed URL...");
        console.log("Params:", params);
        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw new Error("Could not generate signed URL");
    }
}