import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen, Clock, BarChart3, Play, Check, Plus, Search,
  GraduationCap, Award, Loader2, ChevronRight, Users
} from "lucide-react";

const CATEGORIES = ["Tous", "Entrepreneuriat", "Marketing", "Finance", "Tech", "Leadership", "Fundraising", "Juridique"];
const DIFFICULTIES = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const DIFF_COLORS = { beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };

function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useMyEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("course_enrollments").select("*, courses(*)").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
}

export default function CoursesPage() {
  usePageMeta({ title: "Formations — GrowHubLink", description: "Formez-vous avec des cours conçus pour les entrepreneurs africains." });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useCourses();
  const { data: enrollments } = useMyEnrollments();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [activeTab, setActiveTab] = useState("explore");
  const [createOpen, setCreateOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", category: "Entrepreneuriat", difficulty: "beginner", duration_minutes: 30 });

  const enrolledCourseIds = new Set((enrollments ?? []).map(e => (e as any).course_id));

  const enroll = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("course_enrollments").insert({ user_id: user!.id, course_id: courseId });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["enrollments"] }); toast.success("Inscrit au cours !"); },
    onError: (e: any) => toast.error(e.message?.includes("unique") ? "Déjà inscrit" : "Erreur"),
  });

  const createCourse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({
        created_by: user!.id,
        title: newCourse.title,
        description: newCourse.description || null,
        category: newCourse.category,
        difficulty: newCourse.difficulty,
        duration_minutes: newCourse.duration_minutes,
        is_published: true,
        lessons: [
          { title: "Introduction", content: "Bienvenue dans ce cours !", type: "text", order: 0 },
        ],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCreateOpen(false);
      setNewCourse({ title: "", description: "", category: "Entrepreneuriat", difficulty: "beginner", duration_minutes: 30 });
      toast.success("Cours créé !");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });

  const filtered = (courses ?? []).filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Tous" || c.category === category;
    return matchSearch && matchCategory;
  });

  const myEnrolled = (enrollments ?? []).map(e => ({ ...e, course: (e as any).courses }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" /> Formations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Développez vos compétences avec des cours adaptés à votre parcours</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Créer un cours</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un nouveau cours</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label>Titre *</Label><Input placeholder="Ex: Les bases du pitch deck" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} placeholder="De quoi parle ce cours..." value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Catégorie</Label>
                  <Select value={newCourse.category} onValueChange={v => setNewCourse({ ...newCourse, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.filter(c => c !== "Tous").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Niveau</Label>
                  <Select value={newCourse.difficulty} onValueChange={v => setNewCourse({ ...newCourse, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Durée estimée (minutes)</Label><Input type="number" value={newCourse.duration_minutes} onChange={e => setNewCourse({ ...newCourse, duration_minutes: parseInt(e.target.value) || 30 })} /></div>
              <Button className="w-full" disabled={!newCourse.title || createCourse.isPending} onClick={() => createCourse.mutate()}>
                {createCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />} Créer le cours
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50"><CardContent className="p-4 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-xl font-heading font-bold text-foreground">{courses?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground">Cours disponibles</div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center">
          <Play className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-xl font-heading font-bold text-foreground">{enrollments?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground">En cours</div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center">
          <Award className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-xl font-heading font-bold text-foreground">{myEnrolled.filter(e => e.is_completed).length}</div>
          <div className="text-xs text-muted-foreground">Terminés</div>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="explore">Explorer</TabsTrigger>
          <TabsTrigger value="enrolled">Mes formations ({enrollments?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un cours..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <Badge key={c} variant={category === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategory(c)}>{c}</Badge>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-border/50"><CardContent className="p-8 text-center text-muted-foreground">
              Aucun cours trouvé. Soyez le premier à en créer un !
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((course, i) => (
                <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="border-border/50 hover:border-primary/30 transition-colors h-full flex flex-col">
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-[10px] px-2 py-0.5 ${DIFF_COLORS[course.difficulty as keyof typeof DIFF_COLORS] || DIFF_COLORS.beginner}`}>
                          {DIFFICULTIES[course.difficulty as keyof typeof DIFFICULTIES] || "Débutant"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                      </div>
                      <h3 className="font-heading font-bold text-foreground mb-1.5 line-clamp-2">{course.title}</h3>
                      {course.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{course.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 mt-auto">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration_minutes} min</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollment_count ?? 0}</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {(course.lessons as any[])?.length ?? 0} leçons</span>
                      </div>
                      {enrolledCourseIds.has(course.id) ? (
                        <Button size="sm" variant="secondary" disabled className="w-full"><Check className="w-3.5 h-3.5 mr-1" /> Inscrit</Button>
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => enroll.mutate(course.id)} disabled={enroll.isPending}>
                          <Play className="w-3.5 h-3.5 mr-1" /> S'inscrire
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4 mt-4">
          {myEnrolled.length === 0 ? (
            <Card className="border-border/50"><CardContent className="p-8 text-center text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              Vous n'êtes inscrit à aucun cours. Explorez le catalogue !
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myEnrolled.map(e => (
                <Card key={e.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-foreground truncate">{e.course?.title || "Cours"}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{e.course?.category}</span>
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{e.course?.duration_minutes} min</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={e.progress ?? 0} className="flex-1 h-2" />
                          <span className="text-xs font-medium text-foreground">{e.progress ?? 0}%</span>
                        </div>
                      </div>
                      {e.is_completed ? (
                        <Badge variant="default" className="shrink-0"><Check className="w-3 h-3 mr-1" /> Terminé</Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="shrink-0"><ChevronRight className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
