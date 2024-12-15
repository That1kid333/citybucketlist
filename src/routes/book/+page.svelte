<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { locations } from '$lib/types/location';
  import { ridesService } from '$lib/services/rides.service';
  import { onMount } from 'svelte';
  import type { Driver } from '$lib/types/driver';

  let name = '';
  let phone = '';
  let pickup = '';
  let dropoff = '';
  let selectedLocationId = '';
  let selectedDriverId = '';
  let availableDrivers: Driver[] = [];
  let loading = false;
  let error = '';

  $: {
    if (selectedLocationId) {
      loadAvailableDrivers();
    }
  }

  async function loadAvailableDrivers() {
    try {
      availableDrivers = await ridesService.getAvailableDriversByLocation(selectedLocationId);
    } catch (err) {
      console.error('Error loading drivers:', err);
      error = 'Failed to load available drivers';
    }
  }

  async function handleSubmit() {
    if (!name || !phone || !selectedLocationId) {
      error = 'Please fill in all required fields';
      return;
    }

    loading = true;
    error = '';

    try {
      const result = await ridesService.createRide({
        name,
        phone,
        pickup,
        dropoff,
        locationId: selectedLocationId,
        selectedDriverId: selectedDriverId || undefined,
        isGuestBooking: true
      });

      // Redirect to thank you page with ride details
      const params = new URLSearchParams({
        pickup: pickup || '',
        dropoff: dropoff || '',
        name,
        phone
      });
      
      goto(`/thank-you?${params.toString()}`);
    } catch (err) {
      console.error('Error creating ride:', err);
      error = 'Failed to create ride request';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <Card class="p-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Book a Ride</h1>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      {#if error}
        <div class="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>
      {/if}

      <div class="space-y-2">
        <Label for="name">Name *</Label>
        <Input type="text" id="name" bind:value={name} required placeholder="Enter your name" />
      </div>

      <div class="space-y-2">
        <Label for="phone">Phone Number *</Label>
        <Input type="tel" id="phone" bind:value={phone} required placeholder="Enter your phone number" />
      </div>

      <div class="space-y-2">
        <Label for="location">Location *</Label>
        <select
          id="location"
          bind:value={selectedLocationId}
          class="w-full p-2 border rounded-md"
          required
        >
          <option value="">Select a location</option>
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-2">
        <Label for="pickup">Pickup Address</Label>
        <Input type="text" id="pickup" bind:value={pickup} placeholder="Enter pickup address" />
      </div>

      <div class="space-y-2">
        <Label for="dropoff">Dropoff Address</Label>
        <Input type="text" id="dropoff" bind:value={dropoff} placeholder="Enter dropoff address" />
      </div>

      {#if availableDrivers.length > 0}
        <div class="space-y-2">
          <Label for="driver">Select Driver (Optional)</Label>
          <select
            id="driver"
            bind:value={selectedDriverId}
            class="w-full p-2 border rounded-md"
          >
            <option value="">Choose a driver</option>
            {#each availableDrivers as driver}
              <option value={driver.id}>
                {driver.name} - Rating: {driver.rating || 5.0}⭐
              </option>
            {/each}
          </select>
        </div>
      {/if}

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? 'Requesting Ride...' : 'Request Ride'}
      </Button>
    </form>
  </Card>
</div>
