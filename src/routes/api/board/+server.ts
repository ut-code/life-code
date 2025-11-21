import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";
import { createBoardPreview } from "@/lib/board-preview.js";
import * as v from "valibot";

const BoardSchema = v.object({
  board: v.array(v.array(v.number())),
  name: v.pipe(v.string(), v.minLength(1, "盤面名は必須です。")),
  code: v.string(),
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
    // より詳細なエラーログ
    result.issues.forEach((issue, idx) => {
      console.error(`Issue ${idx}:`, {
        path: issue.path,
        message: issue.message,
        expected: issue.expected,
        received: issue.received,
      });
    });
    return json({ message: "無効なリクエストデータです。" }, { status: 400 });
  }

  const { board, name, code } = result.output;
  const preview = createBoardPreview(board);

  // Prisma保存前のログ
  console.log("Attempting to save to DB...");
  console.log("Board dimensions:", board.length, "x", board[0]?.length);
  console.log("Preview dimensions:", preview.length, "x", preview[0]?.length);

  try {
    const newState = await prisma.board.create({
      data: {
        board: board,
        name: name,
        preview: preview,
        code: code,
      },
    });

    console.log("✅ Save successful! ID:", newState.id);
    return json({ id: newState.id }, { status: 201 });
  } catch (dbError) {
    console.error("❌ Database save failed:", dbError);
    // エラーの詳細を出力
    if (dbError instanceof Error) {
      console.error("Error name:", dbError.name);
      console.error("Error message:", dbError.message);
      console.error("Error stack:", dbError.stack);
    }
    return json({ message: "データベースエラーが発生しました。" }, { status: 500 });
  }
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
      select: { board: true, code: true },
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
