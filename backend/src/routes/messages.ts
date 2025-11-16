import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { conversations, messages } from "../data/store";
import type { Conversation, Message } from "../models/types";

const router = Router();

const messageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string(),
  roomId: z.string().optional(),
  text: z.string().min(1),
});

router.post("/", requireAuth, (req: AuthRequest, res) => {
  const parse = messageSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const { conversationId, recipientId, roomId, text } = parse.data;

  let convo: Conversation | undefined;
  if (conversationId) {
    convo = conversations.find((c) => c.id === conversationId);
  }
  if (!convo) {
    const now = new Date();
    convo = {
      id: `convo_${Date.now()}`,
      participantIds: [req.user!.id, recipientId],
      roomId,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };
    conversations.push(convo);
  }

  const now = new Date();
  const msg: Message = {
    id: `msg_${Date.now()}`,
    conversationId: convo.id,
    senderId: req.user!.id,
    recipientId,
    text,
    createdAt: now,
    updatedAt: now,
  };
  messages.push(msg);
  convo.lastMessageAt = now;
  convo.updatedAt = now;

  return res.status(201).json(msg);
});

router.get("/conversations", requireAuth, (req: AuthRequest, res) => {
  const userConvos = conversations
    .filter((c) => c.participantIds.includes(req.user!.id))
    .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
  return res.json(userConvos);
});

router.get("/conversations/:id/messages", requireAuth, (req: AuthRequest, res) => {
  const convo = conversations.find((c) => c.id === req.params.id);
  if (!convo || !convo.participantIds.includes(req.user!.id)) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  const list = messages
    .filter((m) => m.conversationId === convo.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return res.json(list);
});

export const messagesRouter = router;


