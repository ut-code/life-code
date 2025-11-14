import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/prisma.server.ts";
import * as v from "valibot";

const CodeSchema = v.object({
  code: v.pipe(v.string(), v.minLength(1, "コードが空白です。")),
  name: v.pipe(v.string(), v.minLength(1, "コード名は必須です。")),
});

export async function POST({ request }) {
  let requestData: unknown;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Request body JSON parsing failed:", error);
    return json({ message: "無効なリクエスト形式です。" }, { status: 400 });
  }

  const result = v.safeParse(CodeSchema, requestData);
  if (!result.success) {
    console.error("Request validation failed:", result.issues);
    return json({ message: "無効なリクエストデータです。" }, { status: 400 });
  }

  const { code, name } = result.output;

  const newState = await prisma.code.create({
    data: {
      data: code,
      name: name,
    },
  });

  return json({ id: newState.id }, { status: 201 });
}

export async function GET({ url }) {
  const codeId = url.searchParams.get("id");

  if (codeId) {
    //IDが指定された場合、そのIDのコードを返す
    const id = parseInt(codeId, 10);
    if (isNaN(id)) {
      return json({ message: "無効なIDです。" }, { status: 400 });
    }

    const state = await prisma.code.findUnique({
      where: { id: id },
      select: { data: true },
    });

    if (!state) {
      return json({ message: `ID: ${id} のコードは見つかりません。` }, { status: 404 });
    }

    return json(state.data);
  } else {
    //IDが指定されなかった場合、全てのコードのリストを返す
    const allStates = await prisma.code.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!allStates || allStates.length === 0) {
      return json({ message: "保存されているコードがありません。" }, { status: 404 });
    }

    return json(allStates);
  }
}
