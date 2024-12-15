<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';

  export let rideDetails: any = {};
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
  <Card class="p-8 text-center">
    <h1 class="text-3xl font-bold mb-6">Thank You for Your Ride Request!</h1>
    <p class="text-lg mb-8">Your ride has been successfully requested. A driver will be assigned shortly.</p>

    {#if rideDetails.pickupLocation}
      <div class="bg-muted p-4 rounded-lg mb-6 text-left">
        <h2 class="font-semibold mb-2">Ride Details:</h2>
        <p>From: {rideDetails.pickupLocation}</p>
        <p>To: {rideDetails.dropoffLocation}</p>
      </div>
    {/if}

    <div class="bg-primary/10 p-6 rounded-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Register as a Rider for Better Experience!</h2>
      <ul class="text-left list-disc list-inside mb-6">
        <li>Save your favorite locations</li>
        <li>Track your ride history</li>
        <li>Get exclusive discounts</li>
        <li>24/7 priority customer support</li>
        <li>Earn loyalty points</li>
      </ul>
      <Button variant="default" class="w-full md:w-auto" on:click={() => goto('/register')}>
        Register Now
      </Button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <Button variant="outline" on:click={() => goto('/')}>
        Return to Home
      </Button>
      <Button variant="outline" on:click={() => goto('/book')}>
        Book Another Ride
      </Button>
    </div>
  </Card>
</div>
