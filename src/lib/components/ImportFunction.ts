export function stripExports(code: string): string {
  return code
    .replace(/export\s+(default\s+)?/g, "") // export文を削除
    .replace(/export\s*\{[^}]*\}\s*from\s*['"][^'"]*['"]\s*;?/g, "") // export {...} from を削除
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, ""); // import文も削除
}

export function processFunctions(funcModules: Record<string, unknown>): Record<string, string> {
  return Object.entries(funcModules).reduce(
    (acc, [path, content]) => {
      const fileName = path.split("/").pop()?.replace(".js", "") || "";
      acc[fileName] = stripExports(content as string);
      return acc;
    },
    {} as Record<string, string>,
  );
}
