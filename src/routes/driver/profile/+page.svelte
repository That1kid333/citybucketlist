<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { getAuth } from 'firebase/auth';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { Camera } from 'lucide-svelte';

  let profile = {
    name: '',
    email: '',
    phone: '',
    carModel: '',
    licensePlate: '',
    photoURL: '',
    rating: 0,
    totalRides: 0,
    completionRate: 0
  };

  let isEditing = false;
  let editedProfile = { ...profile };

  onMount(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
      if (driverDoc.exists()) {
        profile = { ...profile, ...driverDoc.data() };
        editedProfile = { ...profile };
      }
    }
  });

  async function handleSave() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'drivers', user.uid), editedProfile);
        profile = { ...editedProfile };
        isEditing = false;
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }

  function handleCancel() {
    editedProfile = { ...profile };
    isEditing = false;
  }
</script>

<div class="space-y-6">
  <!-- Profile Header -->
  <Card class="p-6">
    <div class="flex flex-col items-center space-y-4">
      <div class="relative">
        <img
          src={profile.photoURL || 'https://via.placeholder.com/150'}
          alt="Profile"
          class="w-24 h-24 rounded-full object-cover"
        />
        {#if isEditing}
          <button class="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full">
            <Camera class="w-4 h-4" />
          </button>
        {/if}
      </div>
      <div class="text-center">
        <h2 class="text-xl font-semibold">{profile.name}</h2>
        <p class="text-sm text-muted-foreground">Driver since {new Date().getFullYear()}</p>
      </div>
    </div>
  </Card>

  <!-- Stats -->
  <Card class="p-4">
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-2xl font-semibold">{profile.rating.toFixed(1)}</p>
        <p class="text-sm text-muted-foreground">Rating</p>
      </div>
      <div>
        <p class="text-2xl font-semibold">{profile.totalRides}</p>
        <p class="text-sm text-muted-foreground">Total Rides</p>
      </div>
      <div>
        <p class="text-2xl font-semibold">{profile.completionRate}%</p>
        <p class="text-sm text-muted-foreground">Completion</p>
      </div>
    </div>
  </Card>

  <!-- Profile Details -->
  <Card class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold">Profile Details</h3>
      {#if !isEditing}
        <Button variant="outline" on:click={() => isEditing = true}>Edit Profile</Button>
      {/if}
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Full Name</Label>
        <Input
          type="text"
          id="name"
          bind:value={editedProfile.name}
          disabled={!isEditing}
        />
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          type="email"
          id="email"
          bind:value={editedProfile.email}
          disabled={!isEditing}
        />
      </div>

      <div class="space-y-2">
        <Label for="phone">Phone Number</Label>
        <Input
          type="tel"
          id="phone"
          bind:value={editedProfile.phone}
          disabled={!isEditing}
        />
      </div>

      <div class="space-y-2">
        <Label for="carModel">Car Model</Label>
        <Input
          type="text"
          id="carModel"
          bind:value={editedProfile.carModel}
          disabled={!isEditing}
        />
      </div>

      <div class="space-y-2">
        <Label for="licensePlate">License Plate</Label>
        <Input
          type="text"
          id="licensePlate"
          bind:value={editedProfile.licensePlate}
          disabled={!isEditing}
        />
      </div>

      {#if isEditing}
        <div class="flex gap-2 pt-4">
          <Button variant="default" class="flex-1" on:click={handleSave}>Save Changes</Button>
          <Button variant="outline" class="flex-1" on:click={handleCancel}>Cancel</Button>
        </div>
      {/if}
    </div>
  </Card>
</div>
