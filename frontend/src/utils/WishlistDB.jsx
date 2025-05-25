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
  if (!movie || !movie.id) {
    throw new Error("유효한 영화 정보가 필요합니다.");
  }

  const db = await getDB();
  const all = await db.getAll(STORE_NAME)

  if(all.length >= 10) {
    throw new Error("위시리스트는 최대 10개까지만 가능합니다.");
  }

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
