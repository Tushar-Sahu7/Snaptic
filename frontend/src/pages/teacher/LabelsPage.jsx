import React, { useState, useEffect } from "react";
import { fetchLabels, createLabel, deleteLabel } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Palette, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLOR_PALETTE = [
  "oklch(0.6 0.2 250)", "oklch(0.6 0.2 20)", "oklch(0.6 0.2 150)", 
  "oklch(0.6 0.2 80)", "oklch(0.6 0.2 280)", "oklch(0.6 0.2 320)", 
  "oklch(0.6 0.2 190)", "oklch(0.6 0.2 120)", "oklch(0.6 0.2 40)", 
  "oklch(0.6 0.2 0)"
];

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [creating, setCreating] = useState(false);

  // Migration Dialog State
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [targetLabel, setTargetLabel] = useState(null);
  const [replacementId, setReplacementId] = useState("");
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    setLoading(true);
    try {
      const { data } = await fetchLabels();
      setLabels(data.labels || []);
    } catch (err) {
      toast.error("Failed to load labels");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    setCreating(true);
    try {
      await createLabel({ name: newLabelName.trim(), color: selectedColor });
      toast.success("Label created");
      setNewLabelName("");
      loadLabels();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create label");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (label, replacementId = null) => {
    try {
      if (replacementId) setMigrating(true);
      await deleteLabel(label._id, replacementId);
      
      toast.success(replacementId ? "Label migrated and deleted" : "Label deleted");
      setMigrationOpen(false);
      setTargetLabel(null);
      setReplacementId("");
      loadLabels();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.affectedClasses) {
        setTargetLabel(label);
        setMigrationOpen(true);
      } else {
        toast.error(err.response?.data?.message || "Failed to delete label");
      }
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Labels</h1>
        <p className="text-muted-foreground">
          Labels help you categorize different types of class sessions (e.g., Lecture, Lab).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Form */}
        <Card className="md:col-span-1 h-fit sticky top-8">
          <CardHeader>
            <CardTitle className="text-lg">New Label</CardTitle>
            <CardDescription>Create a custom tag for your schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="e.g. Workshop" 
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  disabled={creating}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === c ? "border-primary scale-110 shadow-sm" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={creating || !newLabelName.trim()}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Label
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Labels List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {labels.map((l) => (
            <Card key={l._id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="font-medium">{l.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(l)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {labels.length === 0 && (
            <div className="col-span-full py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
              <Palette className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">No labels found</h3>
              <p className="text-muted-foreground">Create your first label to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Migration Dialog */}
      <Dialog open={migrationOpen} onOpenChange={setMigrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Label in Use
            </DialogTitle>
            <DialogDescription>
              The label <strong>{targetLabel?.name}</strong> is currently assigned to one or more schedules. 
              To delete it, you must select a replacement label to update those schedules.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Replacement Label</label>
              <Select value={replacementId} onValueChange={setReplacementId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose replacement..." />
                </SelectTrigger>
                <SelectContent>
                  {labels
                    .filter(l => l._id !== targetLabel?._id)
                    .map(l => (
                      <SelectItem key={l._id} value={l._id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                          {l.name}
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setMigrationOpen(false)} disabled={migrating}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(targetLabel, replacementId)}
              disabled={!replacementId || migrating}
            >
              {migrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Migrate & Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}