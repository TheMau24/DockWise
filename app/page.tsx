"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Dock = {
  id: string;
  name: string;
  zone: string;
  dock_type: string;
  status: string;
};

export default function Home() {
  const [docks, setDocks] = useState<Dock[]>([]);

  useEffect(() => {
    getDocks();
  }, []);

  async function getDocks() {
    const { data, error } = await supabase
      .from("docks")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setDocks(data || []);
  }

  return (
    <main style={{ padding: 30 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Dockwise 🚛
      </h1>

      <p style={{ marginBottom: 30 }}>
        Estado operacional de andenes
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {docks.map((dock) => (
          <div
            key={dock.id}
            style={{
              border: "1px solid #333",
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h2>{dock.name}</h2>

            <p>Zona: {dock.zone}</p>

            <p>Tipo: {dock.dock_type}</p>

            <p>
              Estado: <strong>{dock.status}</strong>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}