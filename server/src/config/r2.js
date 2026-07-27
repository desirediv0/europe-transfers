import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./env.config.js";

const r2 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);
  return `${env.R2_PUBLIC_URL}/${key}`;
};

export const deleteFromR2 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  await r2.send(command);
};

export const getPresignedUrl = async (key) => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
};

export const getPresignedDownloadUrl = async (key, fileName) => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
};

export const listR2Objects = async (prefix = "") => {
  const command = new ListObjectsV2Command({
    Bucket: env.R2_BUCKET_NAME,
    Prefix: prefix,
    Delimiter: "/",
  });

  const response = await r2.send(command);

  const folders = (response.CommonPrefixes || []).map((p) => ({
    name: p.Prefix.replace(prefix, "").replace(/\/$/, ""),
    type: "folder",
    path: p.Prefix,
  }));

  const files = (response.Contents || [])
    .filter((obj) => obj.Key !== prefix)
    .map((obj) => ({
      name: obj.Key.replace(prefix, ""),
      type: "file",
      key: obj.Key,
      size: obj.Size || 0,
      lastModified: obj.LastModified,
      url: `${env.R2_PUBLIC_URL}/${obj.Key}`,
    }));

  return { folders, files, prefix };
};

export const createR2Folder = async (folderPath) => {
  const key = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: "",
  });
  await r2.send(command);
  return key;
};

export default r2;
