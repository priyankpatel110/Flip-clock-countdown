import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    mode: v.union(v.literal("countdown"), v.literal("countup")),
    status: v.union(v.literal("idle"), v.literal("running"), v.literal("paused")),
    startTimestamp: v.number(), // Server timestamp when last started/resumed
    targetSeconds: v.number(),  // The total duration the timer was set for
    savedRemainingSeconds: v.number(), // Remaining time exactly when paused or initialized
  }).index("by_roomId", ["roomId"]),
});
