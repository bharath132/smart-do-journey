import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types/task";

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTask: Task) => void;
  customCategories: string[];
}

export default function TaskEditDialog({ 
  task, 
  open, 
  onOpenChange, 
  onSave, 
  customCategories 
}: TaskEditDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  // Initialize edited task when dialog opens
  useEffect(() => {
    if (task && open) {
      setEditedTask({ ...task });
    }
  }, [task, open]);

  const handleSave = () => {
    if (!editedTask) return;
    onSave(editedTask);
    onOpenChange(false);
  };

  const getAIPrioritySuggestion = async () => {
    if (!editedTask?.text.trim()) {
      toast({
        title: "Enter task text first",
        description: "Please add task text before getting AI suggestion"
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-priority-suggestion', {
        body: { taskText: editedTask.text }
      });

      if (error) throw error;

      if (data?.priority) {
        setEditedTask(prev => prev ? { ...prev, priority: data.priority } : null);
        toast({
          title: "AI Suggestion Applied! 🤖",
          description: `Priority set to ${data.priority} based on AI analysis`
        });
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast({
        title: "AI suggestion failed",
        description: "Please select priority manually"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!editedTask || !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update your task details and get AI priority suggestions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-text">Task</Label>
            <Input
              id="task-text"
              value={editedTask.text}
              onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-1 flex-wrap">
                {customCategories.map((category) => (
                  <Button
                    key={category}
                    variant={editedTask.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditedTask({ ...editedTask, category })}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Priority</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getAIPrioritySuggestion}
                  disabled={isLoadingAI}
                  className="flex items-center gap-1"
                >
                  {isLoadingAI ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Brain className="h-3 w-3" />
                  )}
                  AI Suggest
                </Button>
              </div>
              <div className="flex gap-1">
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <Button
                    key={priority}
                    variant={editedTask.priority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditedTask({ ...editedTask, priority })}
                    className="capitalize"
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {editedTask.startDate ? editedTask.startDate.toLocaleDateString() : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar 
                      mode="single" 
                      selected={editedTask.startDate} 
                      onSelect={(date) => setEditedTask({ ...editedTask, startDate: date })} 
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={editedTask.startTime || ''} 
                    onChange={(e) => setEditedTask({ ...editedTask, startTime: e.target.value })} 
                    className="w-32" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {editedTask.endDate ? editedTask.endDate.toLocaleDateString() : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar 
                      mode="single" 
                      selected={editedTask.endDate} 
                      onSelect={(date) => setEditedTask({ ...editedTask, endDate: date })} 
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={editedTask.endTime || ''} 
                    onChange={(e) => setEditedTask({ ...editedTask, endTime: e.target.value })} 
                    className="w-32" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reminder</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input 
                type="datetime-local" 
                value={editedTask.reminderTime ? new Date(editedTask.reminderTime.getTime() - editedTask.reminderTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                onChange={(e) => setEditedTask({ ...editedTask, reminderTime: e.target.value ? new Date(e.target.value) : undefined })} 
                className="w-48" 
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}