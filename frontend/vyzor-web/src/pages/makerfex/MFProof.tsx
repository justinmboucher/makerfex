import React, { useEffect, useState } from "react";
import { getMe } from "../../api/auth";

export default function MFProof() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setData(me);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load /accounts/me/");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Makerfex Proof: /api/accounts/me/</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
        {data ? JSON.stringify(data, null, 2) : "Loading..."}
      </pre>
    </div>
  );
}
