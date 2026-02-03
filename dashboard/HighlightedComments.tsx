"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HighlightedCommentsProps {
  initialComments?: string[]
}

export default function HighlightedComments({
  initialComments = [],
}: HighlightedCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")

  const addComment = () => {
    if (!newComment.trim()) return
    setComments([newComment, ...comments])
    setNewComment("")
  }

  const removeComment = (idx: number) => {
    setComments(comments.filter((_, i) => i !== idx))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlighted Comments</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ADD COMMENT */}
        <div className="flex gap-2">
          <input
            className="input input-bordered w-full"
            placeholder="Add comment to highlight"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addComment}>
            Add
          </button>
        </div>

        {/* COMMENT LIST */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs opacity-60 text-center">
              No highlighted comments yet
            </p>
          )}

          {comments.map((comment, idx) => (
            <div
              key={idx}
              className="glass p-3 rounded-lg flex justify-between items-center text-sm"
            >
              <span>{comment}</span>
              <button
                className="btn btn-xs btn-error"
                onClick={() => removeComment(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
