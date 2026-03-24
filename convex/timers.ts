import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRoom = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
  },
});

export const createRoom = mutation({
  args: {
    roomId: v.string(),
    mode: v.union(v.literal("countdown"), v.literal("countup")),
    targetSeconds: v.number(),
    savedRemainingSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
      
    if (existing) {
      throw new Error("Room already exists");
    }

    await ctx.db.insert("rooms", {
      roomId: args.roomId,
      mode: args.mode,
      status: "idle",
      startTimestamp: Date.now(),
      targetSeconds: args.targetSeconds,
      savedRemainingSeconds: args.savedRemainingSeconds,
    });
  },
});

export const updateStatus = mutation({
  args: {
    roomId: v.string(),
    status: v.union(v.literal("idle"), v.literal("running"), v.literal("paused")),
    savedRemainingSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) return;

    await ctx.db.patch(room._id, {
      status: args.status,
      startTimestamp: Date.now(),
      savedRemainingSeconds: args.savedRemainingSeconds,
    });
  },
});

export const updateSettings = mutation({
  args: {
    roomId: v.string(),
    mode: v.optional(v.union(v.literal("countdown"), v.literal("countup"))),
    targetSeconds: v.optional(v.number()),
    savedRemainingSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) return;

    const patch: any = {};
    if (args.mode !== undefined) patch.mode = args.mode;
    if (args.targetSeconds !== undefined) patch.targetSeconds = args.targetSeconds;
    if (args.savedRemainingSeconds !== undefined) patch.savedRemainingSeconds = args.savedRemainingSeconds;

    await ctx.db.patch(room._id, patch);
  },
});
