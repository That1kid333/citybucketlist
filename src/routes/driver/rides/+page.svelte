<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { ridesService } from '$lib/services/rides.service';
  import { getAuth } from 'firebase/auth';
  import { Clock, MapPin, DollarSign } from 'lucide-svelte';

  let rides = [];
  let activeTab = 'upcoming';

  onMount(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      // Subscribe to driver's rides
      ridesService.subscribeToDriverRides(user.uid, (updatedRides) => {
        rides = updatedRides;
      });
    }
  });

  $: filteredRides = rides.filter(ride => {
    if (activeTab === 'upcoming') {
      return ['pending', 'accepted'].includes(ride.status);
    } else if (activeTab === 'completed') {
      return ride.status === 'completed';
    } else {
      return ride.status === 'cancelled';
    }
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  <!-- Tabs -->
  <div class="flex border-b">
    {#each ['upcoming', 'completed', 'cancelled'] as tab}
      <button
        class="px-4 py-2 -mb-px text-sm font-medium capitalize"
        class:border-b-2={activeTab === tab}
        class:border-primary={activeTab === tab}
        class:text-primary={activeTab === tab}
        on:click={() => activeTab = tab}
      >
        {tab}
      </button>
    {/each}
  </div>

  <!-- Rides List -->
  <div class="space-y-4">
    {#if filteredRides.length === 0}
      <Card class="p-4">
        <p class="text-center text-muted-foreground">No {activeTab} rides</p>
      </Card>
    {:else}
      {#each filteredRides as ride}
        <Card class="p-4">
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{ride.customerName}</h3>
                <p class="text-sm text-muted-foreground flex items-center">
                  <Clock class="w-4 h-4 mr-1" />
                  {formatDate(ride.created_at)}
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block px-2 py-1 text-xs rounded-full capitalize"
                  class:bg-primary/10={ride.status === 'completed'}
                  class:text-primary={ride.status === 'completed'}
                  class:bg-destructive/10={ride.status === 'cancelled'}
                  class:text-destructive={ride.status === 'cancelled'}
                  class:bg-warning/10={['pending', 'accepted'].includes(ride.status)}
                  class:text-warning={['pending', 'accepted'].includes(ride.status)}
                >
                  {ride.status}
                </span>
                {#if ride.fare}
                  <p class="text-sm font-medium flex items-center justify-end mt-1">
                    <DollarSign class="w-4 h-4 mr-1" />
                    {ride.fare}
                  </p>
                {/if}
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex items-start">
                <MapPin class="w-4 h-4 mr-2 mt-1 text-primary" />
                <div>
                  <p class="text-sm font-medium">Pickup</p>
                  <p class="text-sm text-muted-foreground">{ride.pickup}</p>
                </div>
              </div>
              <div class="flex items-start">
                <MapPin class="w-4 h-4 mr-2 mt-1 text-destructive" />
                <div>
                  <p class="text-sm font-medium">Dropoff</p>
                  <p class="text-sm text-muted-foreground">{ride.dropoff}</p>
                </div>
              </div>
            </div>

            {#if ['pending', 'accepted'].includes(ride.status)}
              <div class="flex gap-2">
                <Button variant="default" class="flex-1">Navigate</Button>
                <Button variant="outline" class="flex-1">Contact Customer</Button>
              </div>
            {/if}
          </div>
        </Card>
      {/each}
    {/if}
  </div>
</div>
