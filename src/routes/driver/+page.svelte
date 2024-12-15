<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { ridesService } from '$lib/services/rides.service';
  import { getAuth } from 'firebase/auth';
  import { doc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';

  let availableRides = [];
  let isAvailable = false;
  let earnings = { today: 0, week: 0, month: 0 };
  let currentRide = null;

  onMount(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      // Subscribe to available rides
      ridesService.subscribeToAvailableRides((rides) => {
        availableRides = rides;
      });

      // Get driver's current status
      const driverDoc = doc(db, 'drivers', user.uid);
      // TODO: Get driver's current status
    }
  });

  async function toggleAvailability() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const driverDoc = doc(db, 'drivers', user.uid);
      await updateDoc(driverDoc, {
        available: !isAvailable
      });
      isAvailable = !isAvailable;
    }
  }

  async function acceptRide(rideId: string) {
    try {
      await ridesService.assignDriver(rideId, getAuth().currentUser.uid);
      // Update current ride
      currentRide = await ridesService.getRide(rideId);
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  }
</script>

<div class="space-y-6">
  <!-- Status Card -->
  <Card class="p-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">Driver Status</h2>
        <p class="text-sm text-muted-foreground">
          {isAvailable ? 'You are available for rides' : 'You are currently offline'}
        </p>
      </div>
      <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
    </div>
  </Card>

  <!-- Earnings Summary -->
  <Card class="p-4">
    <h2 class="text-lg font-semibold mb-4">Earnings</h2>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-muted-foreground">Today</p>
        <p class="text-xl font-semibold">${earnings.today}</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">This Week</p>
        <p class="text-xl font-semibold">${earnings.week}</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">This Month</p>
        <p class="text-xl font-semibold">${earnings.month}</p>
      </div>
    </div>
  </Card>

  <!-- Current Ride -->
  {#if currentRide}
    <Card class="p-4">
      <h2 class="text-lg font-semibold mb-2">Current Ride</h2>
      <div class="space-y-2">
        <p><strong>Pickup:</strong> {currentRide.pickup}</p>
        <p><strong>Dropoff:</strong> {currentRide.dropoff}</p>
        <p><strong>Customer:</strong> {currentRide.customerName}</p>
        <div class="flex gap-2 mt-4">
          <Button variant="default" class="flex-1">Navigate</Button>
          <Button variant="outline" class="flex-1">Contact</Button>
        </div>
      </div>
    </Card>
  {/if}

  <!-- Available Rides -->
  {#if isAvailable && !currentRide}
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Available Rides</h2>
      {#if availableRides.length === 0}
        <Card class="p-4">
          <p class="text-center text-muted-foreground">No available rides at the moment</p>
        </Card>
      {:else}
        {#each availableRides as ride}
          <Card class="p-4">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold">{ride.customerName}</h3>
                  <p class="text-sm text-muted-foreground">{ride.pickup}</p>
                </div>
                <Button variant="default" on:click={() => acceptRide(ride.id)}>
                  Accept
                </Button>
              </div>
              <div class="text-sm">
                <p><strong>Distance:</strong> {ride.distance || 'Calculating...'}</p>
                <p><strong>Estimated Fare:</strong> ${ride.estimatedFare || 'Calculating...'}</p>
              </div>
            </div>
          </Card>
        {/each}
      {/if}
    </div>
  {/if}
</div>
