"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useData } from "@/lib/data-context-new"
import type { Speaker } from "@/lib/data-context-new"

interface SpeakerFormProps {
  speaker?: Speaker
  onCancel: () => void
}

export function SpeakerForm({ speaker, onCancel }: SpeakerFormProps) {
  const { addSpeaker, updateSpeaker } = useData()
  const [formData, setFormData] = useState({
    name: speaker?.name || "",
    title: speaker?.title || "",
    company: speaker?.company || "",
    bio: speaker?.bio || "",
    image: speaker?.image || "/placeholder-user.jpg",
    twitter: speaker?.twitter || "",
    linkedin: speaker?.linkedin || "",
    github: speaker?.github || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (speaker) {
        await updateSpeaker(speaker.id, formData)
        alert("Speaker updated successfully!")
      } else {
        await addSpeaker(formData)
        alert("Speaker added successfully!")
      }
      onCancel()
    } catch (error) {
      alert(`Failed to ${speaker ? 'update' : 'add'} speaker. Please try again.`)
      console.error(`Error ${speaker ? 'updating' : 'adding'} speaker:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Senior Developer"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="Google"
          required
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Speaker bio..."
          rows={3}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            placeholder="@username"
          />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            placeholder="username"
          />
        </div>
        <div>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            placeholder="username"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (speaker ? "Updating..." : "Adding...") 
            : (speaker ? "Update Speaker" : "Add Speaker")
          }
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
