import fetch from "node-fetch";

function headers(token?: string) {
  const h: any = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `token ${token}`;
  return h;
}

function parseRepo(url: string) {
  const [owner, repo] = url.replace("https://github.com/", "").split("/");
  return { owner, repo };
}

export async function fetchTPKG(repoUrl: string, token?: string) {
  const { owner, repo } = parseRepo(repoUrl);

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/tpkg.json`,
    { headers: headers(token) }
  );

  if (!res.ok) throw new Error("tpkg.json not found");

  const data: any = await res.json();
  return JSON.parse(Buffer.from(data.content, "base64").toString());
}

export async function fetchRepoStats(repoUrl: string, token?: string) {
  const { owner, repo } = parseRepo(repoUrl);

  const repoRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: headers(token) }
  );

  if (!repoRes.ok) throw new Error("Repo inaccessible");

  const r: any = await repoRes.json();

  const readmeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers: headers(token) }
  );

  let readme = "";
  if (readmeRes.ok) {
    const rm: any = await readmeRes.json();
    readme = Buffer.from(rm.content, "base64").toString();
  }

  return {
    stars: r.stargazers_count,
    forks: r.forks_count,
    issues: r.open_issues_count,
    private: r.private,
    readme
  };
}
