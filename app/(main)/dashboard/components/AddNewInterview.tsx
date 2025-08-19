"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { generateInterview } from "../_actions/interview";
import { LoaderCircle } from "lucide-react";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 transition-all cursor-pointer h-full flex items-center justify-center"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your interview
            </DialogTitle>
            <DialogDescription>
              Provide details about the job you're interviewing for. Our AI
              will generate questions based on your input.
            </DialogDescription>
          </DialogHeader>

          <form action={async (formData) => {
              setLoading(true);
              await generateInterview(formData);
              setLoading(false);
              setOpenDialog(false);
          }}>
            <div className="space-y-4">
              <div>
                <label className="font-bold">Job Role/Position</label>
                <Input name="jobPosition" className="mt-1" placeholder="e.g., Full Stack Developer" required />
              </div>
              <div>
                <label className="font-bold">Job Description/Tech Stack</label>
                <Textarea name="jobDesc" className="mt-1" placeholder="e.g., React, Next.js, Node.js, TypeScript, SQL" required />
              </div>
              <div>
                <label className="font-bold">Years of Experience</label>
                <Input name="jobExperience" className="mt-1" placeholder="e.g., 5" type="number" max="50" required />
              </div>
            </div>
            <div className="flex gap-5 justify-end mt-6">
              <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" /> Generating...
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;