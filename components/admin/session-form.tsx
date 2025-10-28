"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/lib/data-context-new"
import type { Session } from "@/lib/data-context-new"

interface SessionFormProps {
  session?: Session
  onCancel: () => void
}

export function SessionForm({ session, onCancel }: SessionFormProps) {
  const { addSession, updateSession, speakers } = useData()
  const [formData, setFormData] = useState({
    title: session?.title || "",
    description: session?.description || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    track: session?.track || "",
    room: session?.room || "",
    speakerIds: session?.speakerIds || [],
    tags: session?.tags || [],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSpeakerToggle = (speakerId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        speakerIds: [...formData.speakerIds, speakerId]
      })
    } else {
      setFormData({
        ...formData,
        speakerIds: formData.speakerIds.filter(id => id !== speakerId)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (session) {
        await updateSession(session.id, formData)
        alert("Session updated successfully!")
      } else {
        await addSession(formData)
        alert("Session added successfully!")
      }
      onCancel()
    } catch (error) {
      alert(`Failed to ${session ? 'update' : 'add'} session. Please try again.`)
      console.error(`Error ${session ? 'updating' : 'adding'} session:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Session Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Building Modern Web Apps"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Session description..."
          rows={3}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="track">Track</Label>
          <Select value={formData.track} onValueChange={(value) => setFormData({ ...formData, track: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web">Web</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="AI/ML">AI/ML</SelectItem>
              <SelectItem value="Cloud">Cloud</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="room">Room</Label>
          <Input
            id="room"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Main Hall"
            required
          />
        </div>
      </div>
      
      <div>
        <Label>Speakers</Label>
        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
          {speakers && speakers.length > 0 ? (
            speakers.map((speaker) => (
              <div key={speaker.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`speaker-${speaker.id}`}
                  checked={formData.speakerIds.includes(speaker.id)}
                  onCheckedChange={(checked) => handleSpeakerToggle(speaker.id, checked as boolean)}
                />
                <Label 
                  htmlFor={`speaker-${speaker.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {speaker.name} - {speaker.title} at {speaker.company}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No speakers available. Add speakers first.</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (session ? "Updating..." : "Adding...") 
            : (session ? "Update Session" : "Add Session")
          }
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
