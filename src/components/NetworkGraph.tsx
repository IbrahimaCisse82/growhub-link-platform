import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useConnections";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfilesByUserIds } from "@/hooks/useProfiles";
import { GHCard } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Network } from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  degree: number; // 0 = me, 1 = direct, 2 = second degree
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

export default function NetworkGraph() {
  const { user, profile } = useAuth();
  const { data: connections } = useConnections();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const [hovered, setHovered] = useState<string | null>(null);

  const accepted = connections?.filter(c => c.status === "accepted") ?? [];
  const directIds = accepted.map(c => c.requester_id === user?.id ? c.receiver_id : c.requester_id);

  // Fetch 2nd degree connections
  const { data: graphData, isLoading } = useQuery({
    queryKey: ["network-graph", user?.id, directIds.length],
    enabled: !!user && directIds.length > 0,
    queryFn: async () => {
      // Get 2nd degree (connections of my connections)
      const { data: secondDegreeConns } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .eq("status", "accepted")
        .or(directIds.map(id => `requester_id.eq.${id},receiver_id.eq.${id}`).join(","))
        .limit(200);

      const secondDegreeIds = new Set<string>();
      const edges: GraphEdge[] = [];

      // Add direct edges
      directIds.forEach(id => {
        edges.push({ source: user!.id, target: id });
      });

      // Add 2nd degree edges
      (secondDegreeConns ?? []).forEach(c => {
        const partner = directIds.includes(c.requester_id) ? c.receiver_id : c.requester_id;
        const directNode = directIds.includes(c.requester_id) ? c.requester_id : c.receiver_id;
        if (partner !== user!.id && !directIds.includes(partner)) {
          secondDegreeIds.add(partner);
          edges.push({ source: directNode, target: partner });
        }
      });

      // Limit 2nd degree
      const limitedSecond = [...secondDegreeIds].slice(0, 20);
      const allIds = [...new Set([user!.id, ...directIds, ...limitedSecond])];
      const profiles = await fetchProfilesByUserIds(allIds);
      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

      return { edges, profileMap, directIds, secondDegreeIds: limitedSecond };
    },
    staleTime: 120_000,
  });

  useEffect(() => {
    if (!graphData || !canvasRef.current || !user) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.scale(2, 2);

    const nodes: GraphNode[] = [];
    const allIds = [user.id, ...graphData.directIds, ...graphData.secondDegreeIds];

    allIds.forEach((id, i) => {
      const degree = id === user.id ? 0 : graphData.directIds.includes(id) ? 1 : 2;
      const angle = (i / allIds.length) * Math.PI * 2;
      const dist = degree === 0 ? 0 : degree === 1 ? 100 : 180;
      nodes.push({
        id,
        name: graphData.profileMap[id]?.display_name ?? "?",
        x: W / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 30,
        y: H / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 30,
        vx: 0, vy: 0,
        degree,
        radius: degree === 0 ? 20 : degree === 1 ? 12 : 8,
      });
    });

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const primary = `hsl(${primaryColor})`;
    const muted = getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim();

    let frame = 0;
    const simulate = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Simple force simulation
      for (const n of nodes) {
        // Center gravity
        n.vx += (W / 2 - n.x) * 0.001;
        n.vy += (H / 2 - n.y) * 0.001;

        // Repulsion
        for (const m of nodes) {
          if (n === m) continue;
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 200 / (dist * dist);
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }

      // Attraction along edges
      for (const edge of graphData.edges) {
        const s = nodeMap[edge.source];
        const t = nodeMap[edge.target];
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 80) * 0.003;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      }

      // Update positions
      for (const n of nodes) {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(n.radius, Math.min(W - n.radius, n.x));
        n.y = Math.max(n.radius, Math.min(H - n.radius, n.y));
      }

      // Draw edges
      for (const edge of graphData.edges) {
        const s = nodeMap[edge.source];
        const t = nodeMap[edge.target];
        if (!s || !t) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = t.degree === 2 ? `hsl(${muted} / 0.15)` : `hsl(${primaryColor} / 0.3)`;
        ctx.lineWidth = t.degree === 2 ? 0.5 : 1;
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.degree === 0) {
          ctx.fillStyle = primary;
        } else if (n.degree === 1) {
          ctx.fillStyle = `hsl(${primaryColor} / 0.7)`;
        } else {
          ctx.fillStyle = `hsl(${muted} / 0.3)`;
        }
        ctx.fill();

        // Labels for me and direct connections
        if (n.degree <= 1) {
          ctx.fillStyle = `hsl(${muted})`;
          ctx.font = `${n.degree === 0 ? "bold 10px" : "9px"} sans-serif`;
          ctx.textAlign = "center";
          const displayName = n.name.length > 12 ? n.name.slice(0, 10) + "…" : n.name;
          ctx.fillText(displayName, n.x, n.y + n.radius + 12);
        }
      }

      if (frame < 150) {
        animRef.current = requestAnimationFrame(simulate);
      }
    };

    simulate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [graphData, user]);

  if (!user || directIds.length === 0) return null;

  return (
    <GHCard title="Graphe réseau" headerRight={
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Vous</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/70" /> 1er degré</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> 2ème degré</span>
      </div>
    }>
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <canvas ref={canvasRef} className="w-full h-64 rounded-xl bg-secondary/30" />
      )}
    </GHCard>
  );
}
