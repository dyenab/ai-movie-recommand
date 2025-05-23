// /utils/wishlistDB.js
import { openDB } from "idb";

const DB_NAME = "wishlistDB";
const STORE_NAME = "movies";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function addToWishlist(movie) {
  const db = await getDB();
  await db.put(STORE_NAME, movie);
}

export async function removeFromWishlist(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function isInWishlist(id) {
  const db = await getDB();
  return (await db.get(STORE_NAME, id)) !== undefined;
}

export async function getWishlist() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
