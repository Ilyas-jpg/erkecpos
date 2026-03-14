import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { db } from "../db/client.js";
import { changeLog } from "../db/schema.js";
import { gt, asc } from "drizzle-orm";

const app = new Hono();

app.get("/stream", async (c) => {
  return streamSSE(c, async (stream) => {
    let lastId = 0;

    // Get latest id first
    const [latest] = await db
      .select({ id: changeLog.id })
      .from(changeLog)
      .orderBy(asc(changeLog.id))
      .limit(1);
    if (latest) lastId = latest.id - 1;

    while (true) {
      try {
        const changes = await db
          .select()
          .from(changeLog)
          .where(gt(changeLog.id, lastId))
          .orderBy(asc(changeLog.id))
          .limit(50);

        for (const change of changes) {
          await stream.writeSSE({
            event: change.tableName,
            data: JSON.stringify({
              action: change.action,
              record_id: change.recordId,
              payload: change.payload ? JSON.parse(change.payload) : null,
            }),
            id: String(change.id),
          });
          lastId = change.id;
        }
      } catch (err) {
        // Connection may be closed
        break;
      }
      await stream.sleep(1000);
    }
  });
});

app.get("/changes", async (c) => {
  const since = c.req.query("since") || "1970-01-01T00:00:00";
  const changes = await db
    .select()
    .from(changeLog)
    .where(gt(changeLog.createdAt, since))
    .orderBy(asc(changeLog.id))
    .limit(100);
  return c.json(changes);
});

export default app;
