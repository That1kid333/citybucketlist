<script lang="ts">
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, updateDoc, onSnapshot } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { MapPin } from 'lucide-svelte';
  import { locations } from '$lib/constants/locations';

  let currentLocation: any = null;
  let activeLocationId: string | null = null;

  onMount(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const driverDoc = doc(db, 'drivers', auth.currentUser.uid);
      
      // Subscribe to driver's location updates
      onSnapshot(driverDoc, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          activeLocationId = data.activeLocationId;
          currentLocation = locations.find(loc => loc.id === activeLocationId);
        }
      });
    }
  });

  async function setActiveLocation(locationId: string) {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const driverDoc = doc(db, 'drivers', auth.currentUser.uid);
      await updateDoc(driverDoc, {
        activeLocationId: locationId
      });
    }
  }
</script>

<div class="space-y-6">
  <!-- Current Location -->
  <Card>
    <CardHeader>
      <CardTitle>Current Location</CardTitle>
    </CardHeader>
    <CardContent>
      {#if currentLocation}
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="font-medium">{currentLocation.name}</p>
            <p class="text-sm text-muted-foreground">{currentLocation.description}</p>
          </div>
        </div>
      {:else}
        <p class="text-muted-foreground">No active location selected</p>
      {/if}
    </CardContent>
  </Card>

  <!-- Available Locations -->
  <Card>
    <CardHeader>
      <CardTitle>Available Locations</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        {#each locations as location}
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <p class="font-medium">{location.name}</p>
                {#if location.id === activeLocationId}
                  <Badge variant="success">Active</Badge>
                {/if}
              </div>
              <p class="text-sm text-muted-foreground">{location.description}</p>
            </div>
            <Button
              variant={location.id === activeLocationId ? "outline" : "default"}
              disabled={location.id === activeLocationId}
              on:click={() => setActiveLocation(location.id)}
            >
              {location.id === activeLocationId ? 'Selected' : 'Select'}
            </Button>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
