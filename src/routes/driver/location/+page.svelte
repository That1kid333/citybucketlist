<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { locations } from '$lib/types/location';
  import { getAuth } from 'firebase/auth';
  import { doc, updateDoc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { MapPin, CheckCircle } from 'lucide-svelte';

  let selectedLocationId = '';
  let currentLocation = null;

  onMount(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
      if (driverDoc.exists()) {
        selectedLocationId = driverDoc.data().locationId || '';
        currentLocation = locations.find(loc => loc.id === selectedLocationId);
      }
    }
  });

  async function updateLocation(locationId: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'drivers', user.uid), {
          locationId
        });
        selectedLocationId = locationId;
        currentLocation = locations.find(loc => loc.id === locationId);
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  }
</script>

<div class="space-y-6">
  <!-- Current Location -->
  {#if currentLocation}
    <Card class="p-6">
      <div class="flex items-center space-x-4">
        <div class="bg-primary/10 p-3 rounded-full">
          <MapPin class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 class="text-lg font-semibold">Current Location</h2>
          <p class="text-muted-foreground">{currentLocation.name}</p>
        </div>
      </div>
    </Card>
  {/if}

  <!-- Available Locations -->
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Available Locations</h3>
    <div class="grid gap-4">
      {#each locations as location}
        <Card
          class="p-4 cursor-pointer hover:bg-accent transition-colors"
          class:border-primary={selectedLocationId === location.id}
          on:click={() => updateLocation(location.id)}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="bg-muted p-2 rounded-full">
                <MapPin class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium">{location.name}</h4>
                <p class="text-sm text-muted-foreground">{location.description || 'No description available'}</p>
              </div>
            </div>
            {#if selectedLocationId === location.id}
              <CheckCircle class="w-5 h-5 text-primary" />
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  </div>

  <!-- Location Info -->
  {#if currentLocation}
    <Card class="p-6">
      <h3 class="text-lg font-semibold mb-4">Location Information</h3>
      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium">Operating Hours</p>
          <p class="text-muted-foreground">24/7</p>
        </div>
        <div>
          <p class="text-sm font-medium">Service Area</p>
          <p class="text-muted-foreground">Within {currentLocation.radius || 5} km radius</p>
        </div>
        <div>
          <p class="text-sm font-medium">Peak Hours</p>
          <p class="text-muted-foreground">6:00 AM - 9:00 AM & 4:00 PM - 7:00 PM</p>
        </div>
      </div>
    </Card>
  {/if}
</div>
