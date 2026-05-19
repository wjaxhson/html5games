export const gameFolders = [
  "simple-clicker",
  "upgrade-clicker",
  "test-game",
  "crystal-miner",
  "trace-the-line",
  "more-dots",
  "stroop-test",
  "path-memory"
];

export async function loadGames() {
  const results = await Promise.allSettled(
    gameFolders.map(async (id) => {
      const res = await fetch(`./games/${id}/meta.json`);
      if (!res.ok) throw new Error(`${id} meta.json 로드 실패`);

      const meta = await res.json();
      
      return {
        id,
        title: meta.title ?? id,
        description: meta.description ?? "",
        visible: meta.visible !== false,
        path: `./games/${id}/`
      };
    })
  );

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((game) => game.visible);
  
}
