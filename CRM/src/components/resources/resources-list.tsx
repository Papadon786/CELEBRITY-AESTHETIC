"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toggleResourceActive, type getResources } from "@/actions/resources"

type Resources = Awaited<ReturnType<typeof getResources>>

export function ResourcesList({ resources }: { resources: Resources }) {
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No rooms or equipment yet. Add treatment rooms and laser/FUE machines so appointments can be checked
          for double-booking.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} />
      ))}
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resources[number] }) {
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{resource.name}</p>
          <Badge variant={resource.active ? "default" : "secondary"}>{resource.active ? "Active" : "Inactive"}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{resource.type === "ROOM" ? "Room" : "Equipment"}</p>
        {resource.description && <p className="text-xs text-muted-foreground mt-2">{resource.description}</p>}
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          className="mt-3"
          onClick={() =>
            startTransition(async () => {
              try {
                await toggleResourceActive(resource.id, !resource.active)
              } catch {
                toast.error("Could not update")
              }
            })
          }
        >
          {resource.active ? "Deactivate" : "Activate"}
        </Button>
      </CardContent>
    </Card>
  )
}
