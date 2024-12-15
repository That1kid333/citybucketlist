<script lang="ts">
  import { getAuth } from 'firebase/auth';
  import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { DollarSign, Navigation, Phone } from 'lucide-svelte';

  let isOnline = false;
  let currentRide: any = null;
  let availableRides: any[] = [];
  let earnings = {
    today: 0,
    week: 0,
    month: 0
  };

  onMount(() => {
    const auth = getAuth();
    const db = getFirestore();
    
    // Subscribe to current ride
    if (auth.currentUser) {
      const ridesRef = collection(db, 'rides');
      const currentRideQuery = query(
        ridesRef,
        where('driverId', '==', auth.currentUser.uid),
        where('status', '==', 'active')
      );

      onSnapshot(currentRideQuery, (snapshot) => {
        if (!snapshot.empty) {
          currentRide = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } else {
          currentRide = null;
        }
      });

      // Subscribe to available rides
      const availableRidesQuery = query(
        ridesRef,
        where('status', '==', 'pending')
      );

      onSnapshot(availableRidesQuery, (snapshot) => {
        availableRides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });

      // Fetch earnings (simplified for demo)
      // In a real app, you would calculate these based on completed rides
      earnings = {
        today: 150,
        week: 750,
        month: 3000
      };
    }
  });

  function toggleOnline() {
    isOnline = !isOnline;
    // TODO: Update driver status in Firestore
  }

  function acceptRide(rideId: string) {
    // TODO: Implement ride acceptance logic
    console.log('Accepting ride:', rideId);
  }
</script>

<div class="space-y-6">
  <!-- Online/Offline Toggle -->
  <div class="flex items-center justify-between p-4 bg-card rounded-lg shadow">
    <span class="font-medium">Available for Rides</span>
    <Switch checked={isOnline} on:click={toggleOnline} />
  </div>

  <!-- Earnings Summary -->
  <div class="grid grid-cols-3 gap-4">
    <Card>
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium">Today</CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
        <div class="flex items-baseline">
          <DollarSign class="h-4 w-4 text-muted-foreground" />
          <span class="text-2xl font-bold">{earnings.today}</span>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium">This Week</CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
        <div class="flex items-baseline">
          <DollarSign class="h-4 w-4 text-muted-foreground" />
          <span class="text-2xl font-bold">{earnings.week}</span>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium">This Month</CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-0">
        <div class="flex items-baseline">
          <DollarSign class="h-4 w-4 text-muted-foreground" />
          <span class="text-2xl font-bold">{earnings.month}</span>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Current Ride -->
  {#if currentRide}
    <Card>
      <CardHeader>
        <CardTitle>Current Ride</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">{currentRide.pickup}</p>
              <p class="text-sm text-muted-foreground">to {currentRide.destination}</p>
            </div>
            <Badge>{currentRide.status}</Badge>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" class="flex-1">
              <Navigation class="mr-2 h-4 w-4" />
              Navigate
            </Button>
            <Button variant="outline" class="flex-1">
              <Phone class="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Available Rides -->
  {#if isOnline && availableRides.length > 0}
    <Card>
      <CardHeader>
        <CardTitle>Available Rides</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each availableRides as ride}
            <div class="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p class="font-medium">{ride.pickup}</p>
                <p class="text-sm text-muted-foreground">to {ride.destination}</p>
                <p class="text-sm font-medium mt-1">${ride.fare}</p>
              </div>
              <Button on:click={() => acceptRide(ride.id)}>Accept</Button>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
