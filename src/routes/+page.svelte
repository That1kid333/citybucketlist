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
  import { getAuth, onAuthStateChanged } from 'firebase/auth';

  let name = '';
  let phone = '';
  let pickup = '';
  let dropoff = '';
  let selectedLocationId = '';
  let selectedDriverId = '';
  let availableDrivers: Driver[] = [];
  let loading = false;
  let error = '';
  let isLoggedIn = false;

  onMount(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      isLoggedIn = !!user;
      if (user) {
        // Redirect to dashboard if logged in
        goto('/dashboard');
      }
    });
  });

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

<div class="min-h-screen bg-black relative">
  <div class="absolute inset-0">
    <img 
      src="https://aiautomationsstorage.blob.core.windows.net/cbl/unnamed (6).jpg"
      alt="Background"
      class="w-full h-full object-cover opacity-20"
    />
  </div>

  <div class="relative z-10">
    <header class="py-4 px-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-[#C69249]">CITYBUCKETLIST.COM</h1>
      <button class="text-white md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-16 6h16" />
        </svg>
      </button>
    </header>

    <main class="container mx-auto px-4 pt-12 pb-20">
      <div class="max-w-xl mx-auto">
        <h2 class="text-[#C69249] text-4xl md:text-5xl font-bold mb-4">NEED A RIDE?</h2>
        <h3 class="text-white text-xl mb-4">Private Rider Association Sign-up & Scheduler</h3>
        
        <p class="text-white mb-8">
          If you're looking for a ride to the airport or need a long distance run,<br />
          please submit your info below. (Please schedule 24 hours prior)
        </p>

        <form on:submit|preventDefault={handleSubmit} class="space-y-6 bg-black/80 p-8 rounded-lg">
          {#if error}
            <div class="bg-red-500/10 text-red-500 p-3 rounded-md">{error}</div>
          {/if}

          <div class="space-y-2">
            <div class="flex items-center space-x-2 text-[#C69249]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <select 
                class="flex-1 bg-white/10 text-white border border-[#C69249]/20 rounded-md p-3 focus:outline-none focus:border-[#C69249]"
              >
                <option>Pittsburgh, Pennsylvania</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-white">Name</label>
            <Input 
              type="text"
              bind:value={name}
              placeholder="Your full name"
              class="w-full bg-white/10 text-white border border-[#C69249]/20 rounded-md p-3 focus:outline-none focus:border-[#C69249]"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-white">Phone</label>
            <Input 
              type="tel"
              bind:value={phone}
              placeholder="Your phone number"
              class="w-full bg-white/10 text-white border border-[#C69249]/20 rounded-md p-3 focus:outline-none focus:border-[#C69249]"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-white">Pickup Location (Optional)</label>
            <Input 
              type="text"
              bind:value={pickup}
              placeholder="Enter pickup address"
              class="w-full bg-white/10 text-white border border-[#C69249]/20 rounded-md p-3 focus:outline-none focus:border-[#C69249]"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-white">Drop-off Location (Optional)</label>
            <Input 
              type="text"
              bind:value={dropoff}
              placeholder="Enter drop-off address"
              class="w-full bg-white/10 text-white border border-[#C69249]/20 rounded-md p-3 focus:outline-none focus:border-[#C69249]"
            />
          </div>

          <Button 
            type="submit"
            class="w-full bg-[#C69249] text-white py-3 rounded-md hover:bg-[#B58239] transition-colors"
            disabled={loading}
          >
            Find Available Drivers
          </Button>
        </form>
      </div>
    </main>
  </div>
</div>
