import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase"; // 这行根据你项目 firebase 文件路径改一下

export async function fetchUserRole(uid) {
  if (!uid) return "user";

  const ref = doc(db, "roles", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return "user"; 
  return snap.data().role || "user";
}
