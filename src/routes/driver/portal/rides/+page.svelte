<script lang="ts">
  import { getAuth } from 'firebase/auth';
  import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Navigation, Phone } from 'lucide-svelte';

  let upcomingRides: any[] = [];
  let completedRides: any[] = [];
  let cancelledRides: any[] = [];

  onMount(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const ridesRef = collection(db, 'rides');

      // Subscribe to upcoming rides
      const upcomingQuery = query(
        ridesRef,
        where('driverId', '==', auth.currentUser.uid),
        where('status', 'in', ['scheduled', 'active'])
      );

      onSnapshot(upcomingQuery, (snapshot) => {
        upcomingRides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });

      // Subscribe to completed rides
      const completedQuery = query(
        ridesRef,
        where('driverId', '==', auth.currentUser.uid),
        where('status', '==', 'completed')
      );

      onSnapshot(completedQuery, (snapshot) => {
        completedRides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });

      // Subscribe to cancelled rides
      const cancelledQuery = query(
        ridesRef,
        where('driverId', '==', auth.currentUser.uid),
        where('status', '==', 'cancelled')
      );

      onSnapshot(cancelledQuery, (snapshot) => {
        cancelledRides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    }
  });

  function formatDate(timestamp: any) {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
</script>

<Tabs defaultValue="upcoming" class="w-full">
  <TabsList class="grid w-full grid-cols-3">
    <TabsTrigger value="upcoming">
      Upcoming
      {#if upcomingRides.length > 0}
        <Badge variant="secondary" class="ml-2">{upcomingRides.length}</Badge>
      {/if}
    </TabsTrigger>
    <TabsTrigger value="completed">
      Completed
      {#if completedRides.length > 0}
        <Badge variant="secondary" class="ml-2">{completedRides.length}</Badge>
      {/if}
    </TabsTrigger>
    <TabsTrigger value="cancelled">
      Cancelled
      {#if cancelledRides.length > 0}
        <Badge variant="secondary" class="ml-2">{cancelledRides.length}</Badge>
      {/if}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="upcoming">
    <div class="space-y-4">
      {#each upcomingRides as ride}
        <Card>
          <CardContent class="p-4">
            <div class="space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{ride.pickup}</p>
                  <p class="text-sm text-muted-foreground">to {ride.destination}</p>
                  <p class="text-sm mt-1">{formatDate(ride.scheduledTime)}</p>
                </div>
                <Badge>{ride.status}</Badge>
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
      {/each}
    </div>
  </TabsContent>

  <TabsContent value="completed">
    <div class="space-y-4">
      {#each completedRides as ride}
        <Card>
          <CardContent class="p-4">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{ride.pickup}</p>
                  <p class="text-sm text-muted-foreground">to {ride.destination}</p>
                  <p class="text-sm mt-1">{formatDate(ride.completedTime)}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium">${ride.fare}</p>
                  <Badge variant="success">Completed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </TabsContent>

  <TabsContent value="cancelled">
    <div class="space-y-4">
      {#each cancelledRides as ride}
        <Card>
          <CardContent class="p-4">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{ride.pickup}</p>
                  <p class="text-sm text-muted-foreground">to {ride.destination}</p>
                  <p class="text-sm mt-1">{formatDate(ride.cancelledTime)}</p>
                </div>
                <div class="text-right">
                  <Badge variant="destructive">Cancelled</Badge>
                  {#if ride.cancellationReason}
                    <p class="text-sm text-muted-foreground mt-1">{ride.cancellationReason}</p>
                  {/if}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </TabsContent>
</Tabs>
