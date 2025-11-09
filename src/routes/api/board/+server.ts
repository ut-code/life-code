import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";
import * as v from "valibot";

const BoardSchema = v.object({
  board: v.array(v.array(v.boolean())),
  name: v.pipe(v.string(), v.minLength(1, "盤面名は必須です。")),
});

export async function POST({ request }) {
  let body;
  try {
    body = v.parse(BoardSchema, await request.json());
  } catch (error) {
    console.error("Request validation failed:", error);
    return json({ message: "無効なリクエストデータです。" }, { status: 400 });
  }

  const { board, name } = body;

  const newState = await prisma.boardState.create({
    data: {
      boardData: board,
      boardName: name,
    },
  });

  return json(newState, { status: 201 });
}

export async function GET() {
  // データベースから一番「最後」に保存されたデータを1件だけ探す
  const latestState = await prisma.boardState.findFirst({
    orderBy: {
      createdAt: "desc", // 作成日時(createdAt)の降順（desc）で並び替え
    },
  });

  if (!latestState) {
    return json({ message: "No state found" }, { status: 404 });
  }

  return json(latestState.boardData);
}
