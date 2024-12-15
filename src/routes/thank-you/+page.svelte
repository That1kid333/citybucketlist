<script lang="ts">
  import { page } from '$app/stores';
  import ThankYouPage from '$lib/components/ThankYouPage.svelte';
  
  // Get ride details from URL parameters
  $: rideDetails = {
    pickupLocation: $page.url.searchParams.get('pickup') || '',
    dropoffLocation: $page.url.searchParams.get('dropoff') || '',
    customerName: $page.url.searchParams.get('name') || '',
    phone: $page.url.searchParams.get('phone') || ''
  };
</script>

<ThankYouPage {rideDetails} />
