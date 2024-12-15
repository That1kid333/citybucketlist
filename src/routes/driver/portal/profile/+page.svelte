<script lang="ts">
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Star } from 'lucide-svelte';

  let profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: ''
    },
    stats: {
      totalRides: 0,
      rating: 0,
      completionRate: 0,
      earnings: 0
    }
  };

  let isEditing = false;
  let editedProfile: any = {};

  onMount(async () => {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const driverDoc = doc(db, 'drivers', auth.currentUser.uid);
      const docSnap = await getDoc(driverDoc);
      
      if (docSnap.exists()) {
        profile = { ...profile, ...docSnap.data() };
        editedProfile = { ...profile };
      }
    }
  });

  async function saveProfile() {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const driverDoc = doc(db, 'drivers', auth.currentUser.uid);
      await updateDoc(driverDoc, editedProfile);
      profile = { ...editedProfile };
      isEditing = false;
    }
  }
</script>

<div class="space-y-6">
  <!-- Profile Summary -->
  <Card>
    <CardHeader>
      <CardTitle>Driver Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        {#if isEditing}
          <div class="grid gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="firstName">First Name</Label>
                <Input id="firstName" bind:value={editedProfile.firstName} />
              </div>
              <div class="space-y-2">
                <Label for="lastName">Last Name</Label>
                <Input id="lastName" bind:value={editedProfile.lastName} />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="phone">Phone</Label>
              <Input id="phone" bind:value={editedProfile.phone} />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
          </div>
        {:else}
          <div class="grid gap-2">
            <p class="text-2xl font-semibold">{profile.firstName} {profile.lastName}</p>
            <p class="text-muted-foreground">{profile.email}</p>
            <p class="text-muted-foreground">{profile.phone}</p>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Vehicle Information -->
  <Card>
    <CardHeader>
      <CardTitle>Vehicle Information</CardTitle>
    </CardHeader>
    <CardContent>
      {#if isEditing}
        <div class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="make">Make</Label>
              <Input id="make" bind:value={editedProfile.vehicle.make} />
            </div>
            <div class="space-y-2">
              <Label for="model">Model</Label>
              <Input id="model" bind:value={editedProfile.vehicle.model} />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="year">Year</Label>
              <Input id="year" bind:value={editedProfile.vehicle.year} />
            </div>
            <div class="space-y-2">
              <Label for="color">Color</Label>
              <Input id="color" bind:value={editedProfile.vehicle.color} />
            </div>
            <div class="space-y-2">
              <Label for="licensePlate">License Plate</Label>
              <Input id="licensePlate" bind:value={editedProfile.vehicle.licensePlate} />
            </div>
          </div>
        </div>
      {:else}
        <div class="grid gap-2">
          <p class="font-medium">{profile.vehicle.year} {profile.vehicle.make} {profile.vehicle.model}</p>
          <p class="text-muted-foreground">Color: {profile.vehicle.color}</p>
          <p class="text-muted-foreground">License Plate: {profile.vehicle.licensePlate}</p>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Performance Stats -->
  <Card>
    <CardHeader>
      <CardTitle>Performance Stats</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-sm text-muted-foreground">Total Rides</p>
          <p class="text-2xl font-semibold">{profile.stats.totalRides}</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm text-muted-foreground">Rating</p>
          <div class="flex items-center">
            <p class="text-2xl font-semibold">{profile.stats.rating.toFixed(1)}</p>
            <Star class="h-5 w-5 text-yellow-400 ml-1" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="text-sm text-muted-foreground">Completion Rate</p>
          <p class="text-2xl font-semibold">{(profile.stats.completionRate * 100).toFixed(1)}%</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm text-muted-foreground">Total Earnings</p>
          <p class="text-2xl font-semibold">${profile.stats.earnings.toFixed(2)}</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Edit/Save Button -->
  <div class="flex justify-end">
    {#if isEditing}
      <div class="space-x-2">
        <Button variant="outline" on:click={() => {
          editedProfile = { ...profile };
          isEditing = false;
        }}>Cancel</Button>
        <Button on:click={saveProfile}>Save Changes</Button>
      </div>
    {:else}
      <Button on:click={() => isEditing = true}>Edit Profile</Button>
    {/if}
  </div>
</div>
