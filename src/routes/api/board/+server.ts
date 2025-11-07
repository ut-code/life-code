import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";

export async function POST({ request }) {
  const boardData = await request.json();

  const newState = await prisma.boardState.create({
    data: {
      boardData: boardData,
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
