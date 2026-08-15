import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

/* ------------------------------------------------------------------ */
/* Auth middleware                                                      */
/* ------------------------------------------------------------------ */

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res
      .status(503)
      .json({ error: "Admin access is not configured on this server." });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== secret) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  next();
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// List all pending (unapproved) reviews.
router.get("/admin/reviews", adminAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.approved, false))
    .orderBy(reviewsTable.createdAt);
  res.json(rows);
});

// Approve a review — sets approved = true so it appears publicly.
router.post("/admin/reviews/:id/approve", adminAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid review id." });
    return;
  }
  const [row] = await db
    .update(reviewsTable)
    .set({ approved: true })
    .where(eq(reviewsTable.id, id))
    .returning({ id: reviewsTable.id });
  if (!row) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json({ ok: true });
});

// Reject a review — permanently deletes it.
router.delete("/admin/reviews/:id", adminAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid review id." });
    return;
  }
  const [row] = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, id))
    .returning({ id: reviewsTable.id });
  if (!row) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json({ ok: true });
});

export default router;
