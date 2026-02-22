import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// NOTE: Ensure these environment variables are set in .env.local
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function uploadToS3(file: File, folder: string = 'uploads'): Promise<string> {
    // Mock implementation for development logic flow without actual credentials
    // In production, you'd generate a unique key and upload

    if (!process.env.AWS_S3_BUCKET) {
        console.warn('AWS_S3_BUCKET is not set. Returning mock URL.');
        return `https://mock-s3-bucket.com/${folder}/${Date.now()}_${file.name}`;
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const key = `${folder}/${fileName}`;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read', // or use presigned URLs for private buckets
        }));

        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload image');
    }
}
