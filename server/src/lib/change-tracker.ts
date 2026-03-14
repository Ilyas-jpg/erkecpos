import { db } from "../db/client.js";
import { changeLog } from "../db/schema.js";

export async function trackChange(
  tableName: string,
  recordId: string,
  action: "insert" | "update" | "delete",
  payload?: any
) {
  await db.insert(changeLog).values({
    tableName,
    recordId,
    action,
    payload: payload ? JSON.stringify(payload) : null,
  });
}
