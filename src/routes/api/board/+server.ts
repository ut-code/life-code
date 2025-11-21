import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";
import { createBoardPreview } from "@/lib/board-preview.js";
import * as v from "valibot";

const BoardSchema = v.object({
  board: v.array(v.array(v.number())),
  name: v.pipe(v.string(), v.minLength(1, "盤面名は必須です。")),
  code: v.string(),
  isColorful: v.boolean(),
});

export async function POST({ request }) {
  let requestData: unknown;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Request body JSON parsing failed:", error);
    return json({ message: "無効なリクエスト形式です。" }, { status: 400 });
  }

  const result = v.safeParse(BoardSchema, requestData);
  if (!result.success) {
    console.error("Request validation failed:", result.issues);
    return json({ message: "無効なリクエストデータです。" }, { status: 400 });
  }

  const { board, name, code, isColorful } = result.output;
  const preview = createBoardPreview(board);

  const newState = await prisma.board.create({
    data: {
      board: board,
      name: name,
      preview: preview,
      code: code,
      isColorful: isColorful,
    },
  });

  return json({ id: newState.id }, { status: 201 });
}

export async function GET({ url }) {
  const boardId = url.searchParams.get("id");

  if (boardId) {
    //IDが指定された場合、そのIDの盤面を返す
    const id = parseInt(boardId, 10);
    if (isNaN(id)) {
      return json({ message: "無効なIDです。" }, { status: 400 });
    }

    const state = await prisma.board.findUnique({
      where: { id: id },
      select: { board: true, code: true, isColorful: true },
    });

    if (!state) {
      return json({ message: `ID: ${id} の盤面は見つかりません。` }, { status: 404 });
    }

    return json(state);
  } else {
    //IDが指定されなかった場合、全ての盤面のリストを返す
    const allStates = await prisma.board.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        preview: true,
      },
    });

    if (!allStates || allStates.length === 0) {
      return json({ message: "保存されている盤面がありません。" }, { status: 404 });
    }

    return json(allStates);
  }
}
