import { put, del } from "@vercel/blob";

export async function uploadImage(file, pathname) {
  const blob = await put(pathname, file, {
    access: "public",
  });

  return blob;
}

export async function deleteImage(url) {
  await del(url);
}