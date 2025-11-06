import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";

// POSTリクエスト（＝保存）の処理
export async function POST({ request }) {
  const boardData = await request.json(); // 送られてきた盤面データを取得

  // データベースに新しいレコードとして保存
  const newState = await prisma.boardState.create({
    data: {
      boardData: boardData, // boardData カラムに JSON データを保存
    },
  });

  return json(newState, { status: 201 }); // 保存成功を通知
}

// GETリクエスト（＝読み込み）の処理
export async function GET() {
  // データベースから一番「最後」に保存されたデータを1件だけ探す
  const latestState = await prisma.boardState.findFirst({
    orderBy: {
      createdAt: "desc", // 作成日時(createdAt)の降順（desc）で並び替え
    },
  });

  if (!latestState) {
    // もしデータがなければ、エラーではなく「何もない」ことを通知
    return json({ message: "No state found" }, { status: 404 });
  }

  // 見つかった盤面データを返す
  return json(latestState.boardData);
}
