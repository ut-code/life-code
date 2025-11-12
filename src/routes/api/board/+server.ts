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

export async function GET({ url }) {
  const boardId = url.searchParams.get("id");

  if (boardId) {
    //IDが指定された場合、そのIDの盤面を返す
    const id = parseInt(boardId, 10);
    if (isNaN(id)) {
      return json({ message: "無効なIDです。" }, { status: 400 });
    }

    const state = await prisma.boardState.findUnique({
      where: { id: id },
      select: { boardData: true },
    });

    if (!state) {
      return json({ message: `ID: ${id} の盤面は見つかりません。` }, { status: 404 });
    }

    return json(state.boardData);
  } else {
    //IDが指定されなかった場合、全ての盤面のリストを返す
    const allStates = await prisma.boardState.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        boardName: true,
        createdAt: true,
        boardData: true,
      },
    });

    if (!allStates || allStates.length === 0) {
      return json({ message: "No state found" }, { status: 404 });
    }

    return json(allStates);
  }
}
